import { ROLES } from '../constants/roles';

function createMockJwt(user) {
  // Mock JWT with 7-day expiration
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const exp = Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60;
  const payload = btoa(
    JSON.stringify({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      exp,
    })
  );
  const signature = btoa('mock-signature');
  return `${header}.${payload}.${signature}`;
}

export const MOCK_USERS = [
  {
    id: 'usr-1',
    name: 'Test Owner',
    email: 'owner@test.com',
    role: ROLES.OWNER,
    isActive: true,
  },
  {
    id: 'usr-2',
    name: 'Test Sales',
    email: 'sales@test.com',
    role: ROLES.SALES,
    isActive: true,
  },
  {
    id: 'usr-3',
    name: 'Durgadas Barhate', // Test Manager
    email: 'manager@test.com',
    role: ROLES.MANAGER,
    isActive: true,
  },
  {
    id: 'usr-4',
    name: 'Test Employee',
    email: 'employee@test.com',
    role: ROLES.EMPLOYEE,
    isActive: true,
  },
  {
    id: 'usr-5',
    name: 'Test HR',
    email: 'hr@test.com',
    role: ROLES.HR,
    isActive: true,
  },
  {
    id: 'usr-6',
    name: 'Inactive User',
    email: 'inactive@test.com',
    role: ROLES.EMPLOYEE,
    isActive: false,
  },
];

export const MOCK_PASSWORD = 'Test@1234';

export function findMockUserByEmail(email) {
  return MOCK_USERS.find((u) => u.email.toLowerCase() === (email || '').toLowerCase());
}

export function generateUserToken(user) {
  return createMockJwt(user);
}

