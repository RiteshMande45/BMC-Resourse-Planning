import { axiosClient } from '../axiosClient';
import { ENDPOINTS } from '../endpoints';
import { mockDelay } from '../../mocks';
import {
  MOCK_OWNER_KPIS,
  MOCK_NEEDS_ATTENTION,
  MOCK_MONTHLY_UTILISATION,
  MOCK_AUDIT_LOG,
} from '../../mocks/reports';
import { MOCK_USERS } from '../../mocks/users';

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';

let inMemoryUsers = [...MOCK_USERS];
let inMemorySettings = {
  defaultWeeklyHoursFullTime: 40,
  defaultWeeklyHoursPartTime: 20,
  thresholdOnTrack: 8,
  thresholdAtRisk: 20,
  reminderDays: [30, 14, 7, 0],
};

export async function getPortfolio() {
  if (USE_MOCK) {
    return mockDelay({
      kpis: MOCK_OWNER_KPIS,
      needsAttention: MOCK_NEEDS_ATTENTION,
    });
  }
  const { data } = await axiosClient.get(ENDPOINTS.reports.portfolio);
  return data;
}

export async function getUtilisation() {
  if (USE_MOCK) {
    return mockDelay(MOCK_MONTHLY_UTILISATION);
  }
  const { data } = await axiosClient.get(ENDPOINTS.reports.utilisation);
  return data;
}

export async function getRevenue() {
  if (USE_MOCK) {
    const revenueData = [
      { project: 'BMC Control-M', client: 'BMC Software', contractValue: 12500000, invoiced: 7500000 },
      { project: 'BMC ITSM', client: 'BMC Software', contractValue: 8000000, invoiced: 4000000 },
      { project: 'Elliot Corel', client: 'Corel', contractValue: 6200000, invoiced: 4100000 },
      { project: 'MistPlay', client: 'MistPlay', contractValue: 4500000, invoiced: 0 },
    ];
    return mockDelay(revenueData);
  }
  const { data } = await axiosClient.get(ENDPOINTS.reports.revenue);
  return data;
}

export async function getAuditLog() {
  if (USE_MOCK) {
    return mockDelay(MOCK_AUDIT_LOG);
  }
  const { data } = await axiosClient.get(ENDPOINTS.auditLog.list);
  return data;
}

export async function getUsers() {
  if (USE_MOCK) {
    return mockDelay(inMemoryUsers);
  }
  const { data } = await axiosClient.get(ENDPOINTS.users.list);
  return data;
}

export async function updateUserRole(userId, newRole) {
  if (USE_MOCK) {
    const u = inMemoryUsers.find((x) => x.id === userId);
    if (u) u.role = newRole;
    return mockDelay(u);
  }
  const { data } = await axiosClient.patch(ENDPOINTS.users.updateRole(userId), { role: newRole });
  return data;
}

export async function toggleUserActive(userId) {
  if (USE_MOCK) {
    const u = inMemoryUsers.find((x) => x.id === userId);
    if (u) u.isActive = !u.isActive;
    return mockDelay(u);
  }
  const { data } = await axiosClient.patch(ENDPOINTS.users.toggleActive(userId));
  return data;
}

export async function getSettings() {
  if (USE_MOCK) {
    return mockDelay(inMemorySettings);
  }
  const { data } = await axiosClient.get(ENDPOINTS.users.settings);
  return data;
}

export async function updateSettings(newSettings) {
  if (USE_MOCK) {
    inMemorySettings = { ...inMemorySettings, ...newSettings };
    return mockDelay(inMemorySettings, 300);
  }
  const { data } = await axiosClient.post(ENDPOINTS.users.settings, newSettings);
  return data;
}

