import { RESOURCE_REQUEST_STATUS, HR_ACTION } from '../constants/statuses';

export const MOCK_RESOURCE_REQUESTS = [
  // 3 requests waiting for Owner in inbox
  {
    id: 'req-1',
    projectId: 'proj-1',
    projectName: 'BMC Control-M',
    managerId: 'emp-mgr-1',
    managerName: 'Durgadas Barhate',
    kind: 'current',
    fromDate: '2026-11-15',
    toDate: '2027-03-31',
    note: 'Urgent need for AWS cloud automation expert to finalize production migration.',
    status: RESOURCE_REQUEST_STATUS.SENT_TO_OWNER,
    ownerNote: null,
    hrAction: null,
    hrNote: null,
    lines: [
      { id: 'reql-1', skillId: 'skl-6', skillName: 'AWS', peopleCount: 1, percent: 100 },
    ],
    events: [
      { id: 'ev-1', action: 'Created by Manager', userName: 'Durgadas Barhate', at: '2026-11-01 10:30' },
    ],
  },
  {
    id: 'req-2',
    projectId: 'proj-2',
    projectName: 'BMC ITSM',
    managerId: 'emp-8',
    managerName: 'Manager B',
    kind: 'upcoming',
    fromDate: '2026-12-01',
    toDate: '2027-04-30',
    note: 'Need 2 QA automation engineers for regression test cycle on release 4.2.',
    status: RESOURCE_REQUEST_STATUS.SENT_TO_OWNER,
    ownerNote: null,
    hrAction: null,
    hrNote: null,
    lines: [
      { id: 'reql-2', skillId: 'skl-13', skillName: 'Automation Testing', peopleCount: 2, percent: 50 },
    ],
    events: [
      { id: 'ev-2', action: 'Created by Manager', userName: 'Manager B', at: '2026-11-01 11:15' },
    ],
  },
  {
    id: 'req-3',
    projectId: 'proj-3',
    projectName: 'ElliotAI',
    managerId: 'emp-15',
    managerName: 'Manager C',
    kind: 'current',
    fromDate: '2026-11-10',
    toDate: '2026-12-31',
    note: 'Deep learning engineer to speed up inference pipeline.',
    status: RESOURCE_REQUEST_STATUS.SENT_TO_OWNER,
    ownerNote: null,
    hrAction: null,
    hrNote: null,
    lines: [
      { id: 'reql-3', skillId: 'skl-15', skillName: 'Deep Learning', peopleCount: 1, percent: 100 },
    ],
    events: [
      { id: 'ev-3', action: 'Created by Manager', userName: 'Manager C', at: '2026-11-01 14:00' },
    ],
  },

  // Additional requests in other states for HR & history
  {
    id: 'req-4',
    projectId: 'proj-4',
    projectName: 'Elliot Corel',
    managerId: 'emp-14',
    managerName: 'Manager D',
    kind: 'current',
    fromDate: '2026-11-01',
    toDate: '2027-01-31',
    note: 'UI designer needed for desktop tool palettes.',
    status: RESOURCE_REQUEST_STATUS.FORWARDED_TO_HR,
    ownerNote: 'Approved. Check if Tanvi Kulkarni has bandwidth.',
    hrAction: HR_ACTION.ASSIGN_INTERNAL,
    hrNote: 'Checking internal schedule with Tanvi.',
    lines: [
      { id: 'reql-4', skillId: 'skl-20', skillName: 'UI/UX Design', peopleCount: 1, percent: 50 },
    ],
    events: [
      { id: 'ev-4', action: 'Created by Manager', userName: 'Manager D', at: '2026-10-28 09:00' },
      { id: 'ev-5', action: 'Forwarded to HR by Owner', userName: 'Test Owner', at: '2026-10-29 14:30' },
    ],
  },
  {
    id: 'req-5',
    projectId: 'proj-1',
    projectName: 'BMC Control-M',
    managerId: 'emp-mgr-1',
    managerName: 'Durgadas Barhate',
    kind: 'current',
    fromDate: '2026-10-01',
    toDate: '2026-12-31',
    note: 'Database performance specialist.',
    status: RESOURCE_REQUEST_STATUS.FULFILLED,
    ownerNote: 'Approved for internal allocation.',
    hrAction: HR_ACTION.ASSIGN_INTERNAL,
    hrNote: 'Assigned Sneha Patel at 80% allocation.',
    lines: [
      { id: 'reql-5', skillId: 'skl-5', skillName: 'PostgreSQL', peopleCount: 1, percent: 80 },
    ],
    events: [
      { id: 'ev-6', action: 'Created', userName: 'Durgadas Barhate', at: '2026-09-25 10:00' },
      { id: 'ev-7', action: 'Forwarded to HR', userName: 'Test Owner', at: '2026-09-26 12:00' },
      { id: 'ev-8', action: 'Fulfilled by HR', userName: 'Test HR', at: '2026-10-01 16:00' },
    ],
  },
];

