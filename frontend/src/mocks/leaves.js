import { LEAVE_STATUS } from '../constants/statuses';

export const MOCK_LEAVES = [
  {
    id: 'lev-1',
    employeeId: 'emp-4',
    employeeName: 'Test Employee',
    fromDate: '2026-11-20',
    toDate: '2026-11-21',
    days: 2,
    halfDay: false,
    type: 'Casual Leave',
    status: LEAVE_STATUS.APPROVED,
    syncedAt: '2026-11-02 08:30',
  },
  {
    id: 'lev-2',
    employeeId: 'emp-iyer',
    employeeName: 'S. Iyer',
    fromDate: '2026-11-06',
    toDate: '2026-11-09',
    days: 2,
    halfDay: false,
    type: 'Sick Leave',
    status: LEAVE_STATUS.APPROVED,
    syncedAt: '2026-11-02 08:30',
    // Clashes with task "Configure Workload Policy in Control-M" due 2026-11-08!
    clashTaskTitle: 'Configure Workload Policy in Control-M',
    clashTaskDue: '2026-11-08',
  },
  {
    id: 'lev-3',
    employeeId: 'emp-rao',
    employeeName: 'A. Rao',
    fromDate: '2026-11-18',
    toDate: '2026-11-18',
    days: 0.5,
    halfDay: true,
    type: 'Privilege Leave',
    status: LEAVE_STATUS.APPLIED,
    syncedAt: '2026-11-02 08:30',
  },
];

export const MOCK_LEAVE_SUMMARY = {
  lastSynced: 'Today at 08:30 AM',
  balance: 14, // days for employee
  importIssues: [
    { row: 14, employee: 'Deepak Jha', reason: 'Invalid date format: 31/02/2026' },
    { row: 28, employee: 'Unknown Employee', reason: 'HR Portal ID "EMP-999" not found in user database' },
  ],
};

