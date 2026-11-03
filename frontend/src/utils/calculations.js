import dayjs from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

/**
 * PRD §10.3 / Section 11 Calculations
 */

/**
 * Sum of the person's allocation % active on that date
 * @param {Array<{ fromDate: string, toDate: string, percent: number }>} allocs
 * @param {string|Date} date
 * @returns {number}
 */
export function plannedAllocation(allocs = [], date) {
  if (!date || !allocs.length) return 0;
  const target = dayjs(date);

  return allocs.reduce((sum, a) => {
    const from = dayjs(a.fromDate || a.from_date);
    const to = dayjs(a.toDate || a.to_date);
    if (target.isSameOrAfter(from, 'day') && target.isSameOrBefore(to, 'day')) {
      return sum + Number(a.percent || 0);
    }
    return sum;
  }, 0);
}

/**
 * availableHoursWeek = weeklyHours − leave hours (half day = half a day = 4h of 8h day)
 */
export function availableHoursWeek(weeklyHours = 40, approvedLeaveHours = 0) {
  return Math.max(0, Number(weeklyHours) - Number(approvedLeaveHours));
}

/**
 * actualUtilisation = hoursLogged ÷ availableHours
 * Returns decimal ratio (0 to 1, or can be > 1 if overtime)
 */
export function actualUtilisation(hoursLogged = 0, availableHours = 40) {
  if (!availableHours || availableHours <= 0) return 0;
  return Number((Number(hoursLogged) / Number(availableHours)).toFixed(2));
}

/**
 * temporarilyFreePercent = Allocation % of projects where all the person's open tasks are 'blocked'
 * @param {Array<{ projectId: string, percent: number }>} personAllocs
 * @param {Record<string, Array<{ status: string }>>} openTasksByProject - map of projectId -> tasks
 */
export function temporarilyFreePercent(personAllocs = [], openTasksByProject = {}) {
  let freePercent = 0;

  for (const alloc of personAllocs) {
    const pId = alloc.projectId || alloc.project_id;
    const tasks = openTasksByProject[pId] || [];
    // Only counts if there are open tasks and ALL open tasks on this project are 'blocked'
    if (tasks.length > 0 && tasks.every((t) => t.status === 'blocked')) {
      freePercent += Number(alloc.percent || 0);
    }
  }

  return freePercent;
}

/**
 * freeCapacity2Weeks = availableHours − remaining estimated hours of open tasks
 */
export function freeCapacity2Weeks(availableHours = 80, remainingEstimatedHours = 0) {
  return Math.max(0, Number(availableHours) - Number(remainingEstimatedHours));
}

/**
 * projectWorkPercent = Hours on Done tasks ÷ total estimated hours (clamped 0-100)
 * @param {Array<{ status: string, estimateHrs?: number, estimate_hrs?: number }>} tasks
 */
export function projectWorkPercent(tasks = []) {
  if (!tasks.length) return 0;
  let totalEst = 0;
  let doneEst = 0;

  for (const t of tasks) {
    const est = Number(t.estimateHrs || t.estimate_hrs || 0);
    totalEst += est;
    if (t.status === 'done') {
      doneEst += est;
    }
  }

  if (totalEst <= 0) return 0;
  return Math.min(100, Math.max(0, Math.round((doneEst / totalEst) * 100)));
}

/**
 * projectTimePercent = Days elapsed ÷ days between start and due, clamp 0–100
 */
export function projectTimePercent(start, due, today = dayjs().format('YYYY-MM-DD')) {
  if (!start || !due) return 0;
  const startDate = dayjs(start);
  const dueDate = dayjs(due);
  const targetDate = dayjs(today);

  const totalDays = dueDate.diff(startDate, 'day');
  if (totalDays <= 0) return 100;

  const elapsedDays = targetDate.diff(startDate, 'day');
  if (elapsedDays <= 0) return 0;

  const pct = Math.round((elapsedDays / totalDays) * 100);
  return Math.min(100, Math.max(0, pct));
}

/**
 * projectHealth:
 * diff = time% − work%
 * diff ≤ 8  → 'on_track'
 * 9–20     → 'at_risk'
 * > 20     → 'delayed'
 */
export function projectHealth(timePct = 0, workPct = 0, thresholds = { onTrack: 8, atRisk: 20 }) {
  const diff = Number(timePct) - Number(workPct);
  if (diff <= thresholds.onTrack) return 'on_track';
  if (diff <= thresholds.atRisk) return 'at_risk';
  return 'delayed';
}

/**
 * deliveryScore = Tasks done by due date ÷ tasks done
 */
export function deliveryScore(tasks = []) {
  const doneTasks = tasks.filter((t) => t.status === 'done');
  if (!doneTasks.length) return 1;

  const onTimeTasks = doneTasks.filter((t) => {
    if (!t.dueDate && !t.due_date) return true;
    const due = dayjs(t.dueDate || t.due_date);
    const completedAt = dayjs(t.completedAt || t.completed_at || t.updatedAt || t.updated_at);
    return completedAt.isSameOrBefore(due, 'day');
  });

  return Number((onTimeTasks.length / doneTasks.length).toFixed(2));
}

/**
 * matchScore = 0.6 × skill + 0.4 × free (rounded)
 */
export function matchScore(skillMatchPct = 0, freePctOnStart = 0) {
  const score = 0.6 * Number(skillMatchPct) + 0.4 * Number(freePctOnStart);
  return Math.round(score);
}

/**
 * timesheetCompliance = daysLoggedOnTime / workingDays
 */
export function timesheetCompliance(daysLoggedOnTime = 0, workingDays = 5) {
  if (!workingDays || workingDays <= 0) return 1;
  return Number(Math.min(1, Math.max(0, daysLoggedOnTime / workingDays)).toFixed(2));
}

