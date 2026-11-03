import { axiosClient } from '../axiosClient';
import { ENDPOINTS } from '../endpoints';
import { ROLES } from '../../constants/roles';
import { mockDelay } from '../../mocks';
import { findMockUserByEmail, generateUserToken, MOCK_PASSWORD } from '../../mocks/users';

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';

// TODO(integration): confirm JWT response format with Ritesh
export function normalizeLoginResponse(raw) {
  if (!raw) return null;
  const token = raw.token || raw.access_token || raw.jwt;
  const user = normalizeUser(raw.user || raw.data?.user || raw);
  return { token, user };
}

export function normalizeUser(raw) {
  if (!raw) return null;
  const role = String(raw.role || '').toLowerCase();
  const validRole = Object.values(ROLES).includes(role) ? role : ROLES.EMPLOYEE;

  return {
    id: raw.id || raw.userId || raw.user_id,
    name: raw.name || raw.fullName || raw.full_name || 'User',
    email: raw.email || '',
    role: validRole,
    isActive: raw.is_active !== undefined ? raw.is_active : raw.isActive !== false,
  };
}

export async function login(email, password) {
  if (USE_MOCK) {
    await mockDelay(null, 250);
    const mockUser = findMockUserByEmail(email);

    if (!mockUser || password !== MOCK_PASSWORD) {
      const err = new Error('Invalid email or password');
      err.status = 401;
      err.code = 'INVALID_CREDENTIALS';
      throw err;
    }

    if (!mockUser.isActive) {
      const err = new Error('Your account is inactive. Contact HR or the Owner.');
      err.status = 403;
      err.code = 'USER_INACTIVE';
      throw err;
    }

    const token = generateUserToken(mockUser);
    return { token, user: mockUser };
  }

  const { data } = await axiosClient.post(ENDPOINTS.auth.login, { email, password });
  return normalizeLoginResponse(data);
}

export async function logout() {
  if (USE_MOCK) {
    return mockDelay({ success: true }, 100);
  }
  try {
    const { data } = await axiosClient.post(ENDPOINTS.auth.logout);
    return data;
  } catch {
    // Ignore logout failure on backend
    return { success: true };
  }
}

export async function getCurrentUser() {
  if (USE_MOCK) {
    // In mock mode, token payload in sessionStorage can reconstruct the user
    return mockDelay(null, 100);
  }
  const { data } = await axiosClient.get(ENDPOINTS.auth.me);
  return normalizeUser(data.user || data);
}

