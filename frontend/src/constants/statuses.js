export const PROJECT_STATUS = {
  NEW: 'new',
  PLANNING: 'planning',
  PLANNED: 'planned',
  ACTIVE: 'active',
  ON_HOLD: 'on_hold',
  COMPLETED: 'completed',
};

export const TASK_STATUS = {
  TODO: 'todo',
  IN_PROGRESS: 'in_progress',
  BLOCKED: 'blocked',
  DONE: 'done',
};

export const TIMESHEET_STATUS = {
  DRAFT: 'draft',
  SUBMITTED: 'submitted',
  APPROVED: 'approved',
  RETURNED: 'returned',
};

export const RESOURCE_REQUEST_STATUS = {
  SENT_TO_OWNER: 'sent_to_owner',
  FORWARDED_TO_HR: 'forwarded_to_hr',
  RETURNED_TO_MANAGER: 'returned_to_manager',
  HR_WORKING: 'hr_working',
  FULFILLED: 'fulfilled',
};

export const HR_ACTION = {
  ASSIGN_INTERNAL: 'assign_internal',
  TRAIN: 'train',
  HIRE: 'hire',
  CONTRACTOR: 'contractor',
};

export const EMPLOYEE_TYPE = {
  EMPLOYEE: 'employee',
  INTERN: 'intern',
  INTERN_UNPAID: 'intern_unpaid',
  PART_TIME: 'part_time',
};

export const SKILL_LEVEL = {
  1: 'Beginner',
  2: 'Intermediate',
  3: 'Expert',
};

export const CERTIFICATE_STATUS = {
  SELF_REPORTED: 'self_reported',
  VERIFIED: 'verified',
  REJECTED: 'rejected',
};

export const DOCUMENT_TYPE = {
  PRD: 'PRD',
  MOM: 'MOM',
  SOW: 'SOW',
  OTHER: 'Other',
};

export const LEAVE_STATUS = {
  APPLIED: 'applied',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  CANCELLED: 'cancelled',
};

export const ALLOCATION_KIND = {
  PLANNED: 'planned',
  SHORT_TERM: 'short_term',
};

export const HEALTH_STATUS = {
  ON_TRACK: 'on_track',
  AT_RISK: 'at_risk',
  DELAYED: 'delayed',
};

export const AVAILABILITY_STATUS = {
  AVAILABLE: 'available',
  PARTIALLY_AVAILABLE: 'partially_available',
  FULLY_ALLOCATED: 'fully_allocated',
};

// Central mapping of enums to human-friendly display label and chip variant/color tone
// Tone options: 'success' | 'warning' | 'danger' | 'neutral'
export const STATUS_CONFIG = {
  // Projects
  [PROJECT_STATUS.NEW]: { label: 'New', tone: 'neutral' },
  [PROJECT_STATUS.PLANNING]: { label: 'Planning', tone: 'warning' },
  [PROJECT_STATUS.PLANNED]: { label: 'Planned', tone: 'neutral' },
  [PROJECT_STATUS.ACTIVE]: { label: 'Active', tone: 'success' },
  [PROJECT_STATUS.ON_HOLD]: { label: 'On Hold', tone: 'warning' },
  [PROJECT_STATUS.COMPLETED]: { label: 'Completed', tone: 'neutral' },

  // Health
  [HEALTH_STATUS.ON_TRACK]: { label: 'On track', tone: 'success' },
  [HEALTH_STATUS.AT_RISK]: { label: 'At risk', tone: 'warning' },
  [HEALTH_STATUS.DELAYED]: { label: 'Delayed', tone: 'danger' },

  // Tasks
  [TASK_STATUS.TODO]: { label: 'To Do', tone: 'neutral' },
  [TASK_STATUS.IN_PROGRESS]: { label: 'In Progress', tone: 'warning' },
  [TASK_STATUS.BLOCKED]: { label: 'Blocked', tone: 'danger' },
  [TASK_STATUS.DONE]: { label: 'Done', tone: 'success' },

  // Timesheets
  [TIMESHEET_STATUS.DRAFT]: { label: 'Draft', tone: 'neutral' },
  [TIMESHEET_STATUS.SUBMITTED]: { label: 'Submitted', tone: 'warning' },
  [TIMESHEET_STATUS.APPROVED]: { label: 'Approved', tone: 'success' },
  [TIMESHEET_STATUS.RETURNED]: { label: 'Returned', tone: 'danger' },

  // Resource Requests
  [RESOURCE_REQUEST_STATUS.SENT_TO_OWNER]: { label: 'Sent to Owner', tone: 'warning' },
  [RESOURCE_REQUEST_STATUS.FORWARDED_TO_HR]: { label: 'Forwarded to HR', tone: 'warning' },
  [RESOURCE_REQUEST_STATUS.RETURNED_TO_MANAGER]: { label: 'Returned to Manager', tone: 'danger' },
  [RESOURCE_REQUEST_STATUS.HR_WORKING]: { label: 'HR Working on It', tone: 'neutral' },
  [RESOURCE_REQUEST_STATUS.FULFILLED]: { label: 'Fulfilled', tone: 'success' },

  // HR Action
  [HR_ACTION.ASSIGN_INTERNAL]: { label: 'Assign Internal', tone: 'success' },
  [HR_ACTION.TRAIN]: { label: 'Train', tone: 'neutral' },
  [HR_ACTION.HIRE]: { label: 'Hire', tone: 'warning' },
  [HR_ACTION.CONTRACTOR]: { label: 'Contractor', tone: 'warning' },

  // Certificates
  [CERTIFICATE_STATUS.SELF_REPORTED]: { label: 'Self Reported', tone: 'neutral' },
  [CERTIFICATE_STATUS.VERIFIED]: { label: 'Verified', tone: 'success' },
  [CERTIFICATE_STATUS.REJECTED]: { label: 'Rejected', tone: 'danger' },

  // Leaves
  [LEAVE_STATUS.APPLIED]: { label: 'Applied', tone: 'warning' },
  [LEAVE_STATUS.APPROVED]: { label: 'Approved', tone: 'success' },
  [LEAVE_STATUS.REJECTED]: { label: 'Rejected', tone: 'danger' },
  [LEAVE_STATUS.CANCELLED]: { label: 'Cancelled', tone: 'neutral' },

  // Availability
  [AVAILABILITY_STATUS.AVAILABLE]: { label: 'Available', tone: 'success' },
  [AVAILABILITY_STATUS.PARTIALLY_AVAILABLE]: { label: 'Partially available', tone: 'warning' },
  [AVAILABILITY_STATUS.FULLY_ALLOCATED]: { label: 'Fully allocated', tone: 'danger' },
};

export function getStatusConfig(statusKey) {
  if (!statusKey) return { label: '—', tone: 'neutral' };
  const lower = String(statusKey).toLowerCase();
  return (
    STATUS_CONFIG[lower] || {
      label: statusKey.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      tone: 'neutral',
    }
  );
}

