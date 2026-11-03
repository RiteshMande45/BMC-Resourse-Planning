import { ROLES } from './roles';

export const DRAWER_WIDTH = 260;

export const NAV_GROUPS = {
  DASHBOARDS: 'DASHBOARDS',
};

export const DASHBOARD_NAV_ITEMS = [
  {
    title: 'Owner',
    subtitle: 'Consolidated view',
    path: '/owner',
    role: ROLES.OWNER,
  },
  {
    title: 'Sales',
    subtitle: 'Projects & revenue',
    path: '/sales',
    role: ROLES.SALES,
  },
  {
    title: 'Manager / TL',
    subtitle: 'Plan & allocate',
    path: '/manager',
    role: ROLES.MANAGER,
  },
  {
    title: 'Employee',
    subtitle: 'Tasks & timesheet',
    path: '/employee',
    role: ROLES.EMPLOYEE,
  },
  {
    title: 'HR',
    subtitle: 'People & leave',
    path: '/hr',
    role: ROLES.HR,
  },
];

