import { describe, it, expect } from 'vitest';
import { checkAllocation } from './allocationRules';

describe('Allocation 100% Rule (src/utils/allocationRules.js)', () => {
  it('allows valid allocation when sum <= 100%', () => {
    const existing = [
      { fromDate: '2026-04-01', toDate: '2026-06-30', percent: 60, employeeName: 'S. Iyer' },
    ];
    const proposed = {
      fromDate: '2026-04-01',
      toDate: '2026-06-30',
      percent: 40,
      employeeName: 'S. Iyer',
    };
    const result = checkAllocation(existing, proposed);
    expect(result.valid).toBe(true);
  });

  it('rejects allocation when sum > 100% (70% + 50% = 120%)', () => {
    const existing = [
      { fromDate: '2026-04-01', toDate: '2026-10-31', percent: 70, employeeName: 'R. Joshi' },
    ];
    const proposed = {
      fromDate: '2026-05-01',
      toDate: '2026-07-31',
      percent: 50,
      employeeName: 'R. Joshi',
    };
    const result = checkAllocation(existing, proposed);
    expect(result.valid).toBe(false);
    expect(result.current).toBe(70);
    expect(result.total).toBe(120);
    expect(result.message).toContain('R. Joshi is at 70%');
    expect(result.message).toContain('adding 50% makes 120%');
  });

  it('correctly handles non-overlapping dates', () => {
    const existing = [
      { fromDate: '2026-01-01', toDate: '2026-03-31', percent: 100, employeeName: 'K. Desai' },
    ];
    const proposed = {
      fromDate: '2026-04-01',
      toDate: '2026-06-30',
      percent: 100,
      employeeName: 'K. Desai',
    };
    const result = checkAllocation(existing, proposed);
    expect(result.valid).toBe(true);
  });
});

