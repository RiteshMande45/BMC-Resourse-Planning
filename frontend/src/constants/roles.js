export const ROLES = {
  OWNER: 'owner',
  SALES: 'sales',
  MANAGER: 'manager',
  EMPLOYEE: 'employee',
  HR: 'hr',
};

export const ROLE_HOME = {
  [ROLES.OWNER]: '/owner',
  [ROLES.SALES]: '/sales',
  [ROLES.MANAGER]: '/manager',
  [ROLES.EMPLOYEE]: '/employee',
  [ROLES.HR]: '/hr',
};

export const ROLE_LABELS = {
  [ROLES.OWNER]: 'Owner',
  [ROLES.SALES]: 'Sales',
  [ROLES.MANAGER]: 'Manager / Team Lead',
  [ROLES.EMPLOYEE]: 'Employee',
  [ROLES.HR]: 'HR',
};

export const ALL_ROLES = Object.values(ROLES);

