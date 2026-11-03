import dayjs from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import { formatDate } from './dates';

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

/**
 * Checks if a proposed allocation causes an employee's total allocation
 * on any day to exceed 100%.
 *
 * @param {Array<{ fromDate: string, toDate: string, percent: number, employeeName?: string }>} existingAllocations
 * @param {{ fromDate: string, toDate: string, percent: number, employeeName?: string }} proposed
 * @returns {{ valid: boolean, date?: string, current?: number, total?: number, message?: string }}
 */
export function checkAllocation(existingAllocations = [], proposed = {}) {
  const proposedFrom = dayjs(proposed.fromDate || proposed.from_date);
  const proposedTo = dayjs(proposed.toDate || proposed.to_date);
  const addPercent = Number(proposed.percent || 0);
  const name = proposed.employeeName || 'This person';

  if (!proposedFrom.isValid() || !proposedTo.isValid() || addPercent <= 0) {
    return { valid: true };
  }

  // Collect all critical boundary dates to test (proposed start/end, and any existing start/ends that fall inside the window)
  const datesToCheck = new Set();
  datesToCheck.add(proposedFrom.format('YYYY-MM-DD'));
  datesToCheck.add(proposedTo.format('YYYY-MM-DD'));

  for (const alloc of existingAllocations) {
    const aFrom = dayjs(alloc.fromDate || alloc.from_date);
    const aTo = dayjs(alloc.toDate || alloc.to_date);

    if (aFrom.isSameOrAfter(proposedFrom, 'day') && aFrom.isSameOrBefore(proposedTo, 'day')) {
      datesToCheck.add(aFrom.format('YYYY-MM-DD'));
    }
    if (aTo.isSameOrAfter(proposedFrom, 'day') && aTo.isSameOrBefore(proposedTo, 'day')) {
      datesToCheck.add(aTo.format('YYYY-MM-DD'));
    }
  }

  // Sort dates chronologically
  const sortedDates = Array.from(datesToCheck).sort();

  for (const dateStr of sortedDates) {
    const currentDay = dayjs(dateStr);
    let currentTotal = 0;

    for (const alloc of existingAllocations) {
      const aFrom = dayjs(alloc.fromDate || alloc.from_date);
      const aTo = dayjs(alloc.toDate || alloc.to_date);

      if (currentDay.isSameOrAfter(aFrom, 'day') && currentDay.isSameOrBefore(aTo, 'day')) {
        currentTotal += Number(alloc.percent || 0);
      }
    }

    const newTotal = currentTotal + addPercent;
    if (newTotal > 100) {
      const displayDate = formatDate(dateStr);
      return {
        valid: false,
        date: dateStr,
        displayDate,
        current: currentTotal,
        total: newTotal,
        message: `${name} is at ${currentTotal}% on ${displayDate}; adding ${addPercent}% makes ${newTotal}%.`,
      };
    }
  }

  return { valid: true };
}

