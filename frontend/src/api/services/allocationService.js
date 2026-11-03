import { axiosClient } from '../axiosClient';
import { ENDPOINTS } from '../endpoints';
import { mockDelay } from '../../mocks';
import { MOCK_ALLOCATIONS } from '../../mocks/allocations';
import { checkAllocation } from '../../utils/allocationRules';

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';

let inMemoryAllocations = [...MOCK_ALLOCATIONS];

export function normalizeAllocation(raw) {
  if (!raw) return null;
  return {
    id: raw.id,
    employeeId: raw.employee_id || raw.employeeId,
    employeeName: raw.employee_name || raw.employeeName,
    projectId: raw.project_id || raw.projectId,
    projectName: raw.project_name || raw.projectName,
    role: raw.role || 'Contributor',
    percent: Number(raw.percent || 0),
    fromDate: raw.from_date || raw.fromDate,
    toDate: raw.to_date || raw.toDate,
    kind: raw.kind || 'planned',
    managerName: raw.manager_name || raw.managerName || 'Manager',
  };
}

export async function getAllocations(filters = {}) {
  if (USE_MOCK) {
    let list = inMemoryAllocations;
    if (filters.employeeId) {
      list = list.filter((a) => a.employeeId === filters.employeeId);
    }
    if (filters.projectId) {
      list = list.filter((a) => a.projectId === filters.projectId);
    }
    return mockDelay(list.map(normalizeAllocation));
  }

  const { data } = await axiosClient.get(ENDPOINTS.allocations.list, { params: filters });
  const list = Array.isArray(data) ? data : data.allocations || [];
  return list.map(normalizeAllocation);
}

export async function createAllocation(proposed) {
  if (USE_MOCK) {
    // 100% rule validation on mock
    const existing = inMemoryAllocations.filter((a) => a.employeeId === proposed.employeeId);
    const ruleCheck = checkAllocation(existing, proposed);

    if (!ruleCheck.valid) {
      const err = new Error(ruleCheck.message);
      err.code = 'ALLOCATION_EXCEEDS_100';
      err.status = 400;
      err.date = ruleCheck.date;
      err.total = ruleCheck.total;
      throw err;
    }

    const newAlloc = {
      id: `alloc-${Date.now()}`,
      employeeId: proposed.employeeId,
      employeeName: proposed.employeeName || 'Team Member',
      projectId: proposed.projectId,
      projectName: proposed.projectName || 'Project',
      role: proposed.role || 'Developer',
      percent: Number(proposed.percent),
      fromDate: proposed.fromDate,
      toDate: proposed.toDate,
      kind: proposed.kind || 'planned',
      managerName: proposed.managerName || 'Durgadas Barhate',
    };

    inMemoryAllocations.push(newAlloc);
    return mockDelay(normalizeAllocation(newAlloc), 350);
  }

  const { data } = await axiosClient.post(ENDPOINTS.allocations.create, proposed);
  return normalizeAllocation(data.allocation || data);
}

export async function updateAllocation(id, patch) {
  if (USE_MOCK) {
    const idx = inMemoryAllocations.findIndex((a) => a.id === id);
    if (idx !== -1) {
      inMemoryAllocations[idx] = { ...inMemoryAllocations[idx], ...patch };
      return mockDelay(normalizeAllocation(inMemoryAllocations[idx]));
    }
    return mockDelay(null);
  }

  const { data } = await axiosClient.patch(ENDPOINTS.allocations.update(id), patch);
  return normalizeAllocation(data.allocation || data);
}

export async function deleteAllocation(id) {
  if (USE_MOCK) {
    inMemoryAllocations = inMemoryAllocations.filter((a) => a.id !== id);
    return mockDelay({ success: true });
  }
  const { data } = await axiosClient.delete(ENDPOINTS.allocations.delete(id));
  return data;
}

