import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';

dayjs.extend(isBetween);

/**
 * Formats ISO date 'YYYY-MM-DD' as 'D MMM YYYY' (e.g. '1 Apr 2026')
 */
export function formatDate(dateString) {
  if (!dateString) return '—';
  const d = dayjs(dateString);
  if (!d.isValid()) return '—';
  return d.format('D MMM YYYY');
}

/**
 * Returns today's date in 'YYYY-MM-DD' ISO format
 */
export function getTodayIso() {
  return dayjs().format('YYYY-MM-DD');
}

/**
 * Checks if a date is within N days from today
 */
export function isWithinDays(dateString, days) {
  if (!dateString) return false;
  const target = dayjs(dateString);
  const now = dayjs();
  const diffDays = target.diff(now, 'day');
  return diffDays >= 0 && diffDays <= days;
}

/**
 * Computes difference in calendar days between two dates
 */
export function daysBetween(startString, endString) {
  if (!startString || !endString) return 0;
  return dayjs(endString).diff(dayjs(startString), 'day');
}

export { dayjs };

