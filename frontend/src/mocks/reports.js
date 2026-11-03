export const MOCK_OWNER_KPIS = [
  { label: 'ACTIVE PROJECTS', value: 4, caption: '1 upcoming', tone: 'neutral' },
  { label: 'RESOURCES', value: 40, caption: 'Employees, interns, part-time', tone: 'neutral' },
  { label: 'PLANNED ALLOCATION', value: '81%', caption: 'Today', tone: 'neutral' },
  { label: 'ACTUAL UTILISATION', value: '76%', caption: 'Last 4 weeks', tone: 'neutral' },
  { label: 'ON BENCH', value: 3, caption: 'Free ≥ 40%', tone: 'neutral' },
  { label: 'CONTRACT VALUE', value: null, caption: 'Sample', tone: 'neutral' }, // Formats to ₹—
  { label: 'INVOICED', value: null, caption: 'Sample', tone: 'neutral' }, // Formats to ₹—
  { label: 'REQUESTS WAITING', value: 3, caption: 'In inbox', tone: 'warning' },
];

export const MOCK_NEEDS_ATTENTION = [
  {
    type: 'delayed',
    chipLabel: 'Delayed',
    chipTone: 'danger',
    text: 'ElliotAI behind plan',
    targetTab: 0,
  },
  {
    type: 'over_allocated',
    chipLabel: 'Over-allocated',
    chipTone: 'warning',
    text: '2 people above 100%',
    targetTab: 2,
  },
  {
    type: 'blocked',
    chipLabel: 'Blocked',
    chipTone: 'warning',
    text: '1 task blocked',
    targetTab: 0,
  },
  {
    type: 'skills',
    chipLabel: 'Skills',
    chipTone: 'neutral',
    text: '21 skills forms missing',
    targetTab: 4,
  },
];

export const MOCK_MONTHLY_UTILISATION = [
  { month: 'Jun', planned: 78, actual: 70 },
  { month: 'Jul', planned: 80, actual: 74 },
  { month: 'Aug', planned: 82, actual: 76 },
  { month: 'Sep', planned: 81, actual: 73 },
  { month: 'Oct', planned: 79, actual: 75 },
  { month: 'Nov', planned: 81, actual: 76 },
];

export const MOCK_AUDIT_LOG = [
  {
    id: 'aud-1',
    when: '2026-11-02 11:20',
    user: 'Test Owner',
    table: 'resource_requests',
    action: 'UPDATE',
    record: 'req-4',
    before: { status: 'sent_to_owner' },
    after: { status: 'forwarded_to_hr', owner_note: 'Approved. Check if Tanvi has bandwidth.' },
  },
  {
    id: 'aud-2',
    when: '2026-11-01 16:45',
    user: 'Durgadas Barhate',
    table: 'allocations',
    action: 'INSERT',
    record: 'alloc-4',
    before: null,
    after: { employee_id: 'emp-rao', project_id: 'proj-1', percent: 40 },
  },
  {
    id: 'aud-3',
    when: '2026-11-01 10:15',
    user: 'Test HR',
    table: 'certificates',
    action: 'UPDATE',
    record: 'cert-1',
    before: { status: 'self_reported' },
    after: { status: 'verified', verified_by: 'usr-5' },
  },
];

