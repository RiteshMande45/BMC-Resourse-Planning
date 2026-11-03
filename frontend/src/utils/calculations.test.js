import { describe, it, expect } from 'vitest';
import {
  plannedAllocation,
  availableHoursWeek,
  actualUtilisation,
  temporarilyFreePercent,
  freeCapacity2Weeks,
  projectWorkPercent,
  projectTimePercent,
  projectHealth,
  deliveryScore,
  matchScore,
  timesheetCompliance,
} from './calculations';

describe('PRD Calculations (src/utils/calculations.js)', () => {
  it('matchScore calculates 0.6 * skill + 0.4 * free correctly', () => {
    // S. Iyer: 80% skill + 100% free → 88
    expect(matchScore(80, 100)).toBe(88);
    // K. Desai: 70% skill + 100% free → 82
    expect(matchScore(70, 100)).toBe(82);
    // A. Rao: 90% skill + 60% free → 78
    expect(matchScore(90, 60)).toBe(78);
    // P. Nair: 100% skill + 40% free → 76
    expect(matchScore(100, 40)).toBe(76);
    // R. Joshi: 60% skill + 20% free → 44
    expect(matchScore(60, 20)).toBe(44);
  });

  it('projectHealth computes on_track, at_risk, delayed properly', () => {
    // On track: diff <= 8 (e.g. time 58%, work 62% -> diff -4 -> on_track)
    expect(projectHealth(58, 62)).toBe('on_track');
    // BMC ITSM: time 55%, work 40% -> diff 15 -> At risk (9-20)
    expect(projectHealth(55, 40)).toBe('at_risk');
    // ElliotAI: time 48%, work 22% -> diff 26 -> Delayed (> 20)
    expect(projectHealth(48, 22)).toBe('delayed');
  });

  it('plannedAllocation sums active allocations on given date', () => {
    const allocs = [
      { fromDate: '2026-04-01', toDate: '2026-06-30', percent: 60 },
      { fromDate: '2026-05-01', toDate: '2026-08-31', percent: 40 },
    ];
    // In April: only first is active (60%)
    expect(plannedAllocation(allocs, '2026-04-15')).toBe(60);
    // In May: both are active (60 + 40 = 100%)
    expect(plannedAllocation(allocs, '2026-05-15')).toBe(100);
    // In July: only second is active (40%)
    expect(plannedAllocation(allocs, '2026-07-15')).toBe(40);
    // In September: none active
    expect(plannedAllocation(allocs, '2026-09-01')).toBe(0);
  });

  it('availableHoursWeek subtracts leave hours', () => {
    expect(availableHoursWeek(40, 8)).toBe(32);
    expect(availableHoursWeek(40, 4)).toBe(36); // half day
    expect(availableHoursWeek(40, 48)).toBe(0); // clamp at 0
  });

  it('actualUtilisation divides logged hours by available hours', () => {
    expect(actualUtilisation(30, 40)).toBe(0.75);
    expect(actualUtilisation(40, 40)).toBe(1.0);
    expect(actualUtilisation(0, 40)).toBe(0);
  });

  it('temporarilyFreePercent calculates free percent from blocked tasks', () => {
    const allocs = [
      { projectId: 'p1', percent: 50 },
      { projectId: 'p2', percent: 50 },
    ];
    const tasks = {
      p1: [{ status: 'blocked' }, { status: 'blocked' }],
      p2: [{ status: 'in_progress' }, { status: 'blocked' }],
    };
    expect(temporarilyFreePercent(allocs, tasks)).toBe(50);
  });

  it('freeCapacity2Weeks subtracts estimated task hours from available hours', () => {
    expect(freeCapacity2Weeks(80, 50)).toBe(30);
    expect(freeCapacity2Weeks(80, 90)).toBe(0);
  });

  it('projectWorkPercent computes hours on done tasks', () => {
    const tasks = [
      { status: 'done', estimateHrs: 20 },
      { status: 'in_progress', estimateHrs: 10 },
      { status: 'todo', estimateHrs: 10 },
    ];
    // 20 out of 40 = 50%
    expect(projectWorkPercent(tasks)).toBe(50);
  });

  it('projectTimePercent computes elapsed days clamp 0-100', () => {
    // 10 days total, 5 days passed = 50%
    expect(projectTimePercent('2026-04-01', '2026-04-11', '2026-04-06')).toBe(50);
  });

  it('deliveryScore calculates on-time completion ratio', () => {
    const tasks = [
      { status: 'done', dueDate: '2026-04-10', completedAt: '2026-04-09' },
      { status: 'done', dueDate: '2026-04-10', completedAt: '2026-04-15' },
    ];
    expect(deliveryScore(tasks)).toBe(0.5);
  });

  it('timesheetCompliance calculates days logged ratio', () => {
    expect(timesheetCompliance(4, 5)).toBe(0.8);
  });
});

