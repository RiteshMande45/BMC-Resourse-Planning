/**
 * Central API Endpoints definition.
 * Paths are relative to VITE_API_BASE_URL.
 */
export const ENDPOINTS = {
  // Auth
  auth: {
    login: '/auth/login',
    logout: '/auth/logout',
    me: '/me',
  },

  // Projects
  projects: {
    list: '/projects',
    create: '/projects',
    detail: (id) => `/projects/${id}`,
    update: (id) => `/projects/${id}`,
    documents: (id) => `/projects/${id}/documents`,
    matches: (id) => `/projects/${id}/matches`,
    staffing: (id) => `/projects/${id}/staffing`,
    tasks: (id) => `/projects/${id}/tasks`,
  },

  // Employees & Skills
  employees: {
    list: '/employees',
    detail: (id) => `/employees/${id}`,
    availability: (id) => `/employees/${id}/availability`,
  },

  // Allocations
  allocations: {
    create: '/allocations',
    update: (id) => `/allocations/${id}`,
    delete: (id) => `/allocations/${id}`,
    list: '/allocations',
  },

  // Tasks & Timesheets
  tasks: {
    detail: (id) => `/tasks/${id}`,
    update: (id) => `/tasks/${id}`,
    subtasks: (id) => `/tasks/${id}/subtasks`,
  },
  timeEntries: {
    create: '/time-entries',
  },
  timesheets: {
    submit: (week) => `/timesheets/${week}/submit`,
    approve: (id) => `/timesheets/${id}/approve`,
    return: (id) => `/timesheets/${id}/return`,
  },

  // Resource Requests
  resourceRequests: {
    create: '/resource-requests',
    list: '/resource-requests',
    forward: (id) => `/resource-requests/${id}/forward`,
    return: (id) => `/resource-requests/${id}/return`,
    update: (id) => `/resource-requests/${id}`,
  },

  // Reports
  reports: {
    portfolio: '/reports/portfolio',
    utilisation: '/reports/utilisation',
    revenue: '/reports/revenue',
  },

  // ─────────────────────────────────────────────────────────────
  // PROPOSED — confirm with backend team
  // ─────────────────────────────────────────────────────────────
  skills: {
    list: '/skills',
  },
  certificates: {
    list: '/certificates',
    verify: (id) => `/certificates/${id}/verify`,
    reject: (id) => `/certificates/${id}/reject`,
    upload: '/certificates',
  },
  leaves: {
    list: '/leaves',
    sync: '/leaves/sync',
  },
  deals: {
    list: '/deals',
    create: '/deals',
    update: (id) => `/deals/${id}`,
  },
  clients: {
    list: '/clients',
    create: '/clients',
  },
  users: {
    list: '/users',
    updateRole: (id) => `/users/${id}/role`,
    toggleActive: (id) => `/users/${id}/active`,
    settings: '/settings',
  },
  auditLog: {
    list: '/audit-log',
  },
  notifications: {
    list: '/notifications',
    markRead: (id) => `/notifications/${id}/read`,
  },
};

