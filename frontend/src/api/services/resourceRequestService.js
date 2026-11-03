import { axiosClient } from '../axiosClient';
import { ENDPOINTS } from '../endpoints';
import { mockDelay } from '../../mocks';
import { MOCK_RESOURCE_REQUESTS } from '../../mocks/resourceRequests';
import { RESOURCE_REQUEST_STATUS } from '../../constants/statuses';

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';

let inMemoryRequests = [...MOCK_RESOURCE_REQUESTS];

export function normalizeResourceRequest(raw) {
  if (!raw) return null;
  return {
    id: raw.id,
    projectId: raw.project_id || raw.projectId,
    projectName: raw.project_name || raw.projectName || 'Project',
    managerId: raw.manager_id || raw.managerId,
    managerName: raw.manager_name || raw.managerName || 'Manager',
    kind: raw.kind || 'current',
    fromDate: raw.from_date || raw.fromDate,
    toDate: raw.to_date || raw.toDate,
    note: raw.note || '',
    status: raw.status || RESOURCE_REQUEST_STATUS.SENT_TO_OWNER,
    ownerNote: raw.owner_note || raw.ownerNote || null,
    hrAction: raw.hr_action || raw.hrAction || null,
    hrNote: raw.hr_note || raw.hrNote || null,
    lines: raw.lines || [],
    events: raw.events || [],
  };
}

export async function getResourceRequests(filters = {}) {
  if (USE_MOCK) {
    let list = inMemoryRequests;
    if (filters.status) {
      list = list.filter((r) => r.status === filters.status);
    }
    if (filters.managerId) {
      list = list.filter((r) => r.managerId === filters.managerId);
    }
    return mockDelay(list.map(normalizeResourceRequest));
  }

  const { data } = await axiosClient.get(ENDPOINTS.resourceRequests.list, { params: filters });
  const list = Array.isArray(data) ? data : data.requests || [];
  return list.map(normalizeResourceRequest);
}

export async function createResourceRequest(reqData) {
  if (USE_MOCK) {
    const newReq = {
      id: `req-${Date.now()}`,
      projectId: reqData.projectId,
      projectName: reqData.projectName || 'BMC Control-M',
      managerId: reqData.managerId || 'emp-mgr-1',
      managerName: reqData.managerName || 'Durgadas Barhate',
      kind: reqData.kind || 'current',
      fromDate: reqData.fromDate,
      toDate: reqData.toDate,
      note: reqData.note || '',
      status: RESOURCE_REQUEST_STATUS.SENT_TO_OWNER,
      ownerNote: null,
      hrAction: null,
      hrNote: null,
      lines: reqData.lines || [],
      events: [
        {
          id: `ev-${Date.now()}`,
          action: 'Created by Manager',
          userName: reqData.managerName || 'Durgadas Barhate',
          at: new Date().toISOString().replace('T', ' ').slice(0, 16),
        },
      ],
    };
    inMemoryRequests.unshift(newReq);
    return mockDelay(normalizeResourceRequest(newReq), 350);
  }

  const { data } = await axiosClient.post(ENDPOINTS.resourceRequests.create, reqData);
  return normalizeResourceRequest(data.request || data);
}

export async function forwardToHr(id, ownerNote = '') {
  if (USE_MOCK) {
    const req = inMemoryRequests.find((r) => r.id === id);
    if (req) {
      req.status = RESOURCE_REQUEST_STATUS.FORWARDED_TO_HR;
      req.ownerNote = ownerNote;
      req.events.push({
        id: `ev-${Date.now()}`,
        action: 'Forwarded to HR by Owner',
        userName: 'Test Owner',
        at: new Date().toISOString().replace('T', ' ').slice(0, 16),
      });
    }
    return mockDelay(normalizeResourceRequest(req), 300);
  }

  const { data } = await axiosClient.post(ENDPOINTS.resourceRequests.forward(id), { ownerNote });
  return normalizeResourceRequest(data.request || data);
}

export async function returnToManager(id, note) {
  if (!note || note.trim().length < 5) {
    throw new Error('A return reason note is required to return a request to manager.');
  }

  if (USE_MOCK) {
    const req = inMemoryRequests.find((r) => r.id === id);
    if (req) {
      req.status = RESOURCE_REQUEST_STATUS.RETURNED_TO_MANAGER;
      req.ownerNote = note;
      req.events.push({
        id: `ev-${Date.now()}`,
        action: 'Returned to Manager with note',
        userName: 'Test Owner',
        at: new Date().toISOString().replace('T', ' ').slice(0, 16),
      });
    }
    return mockDelay(normalizeResourceRequest(req), 300);
  }

  const { data } = await axiosClient.post(ENDPOINTS.resourceRequests.return(id), { note });
  return normalizeResourceRequest(data.request || data);
}

export async function updateResourceRequest(id, patch) {
  if (USE_MOCK) {
    const req = inMemoryRequests.find((r) => r.id === id);
    if (req) {
      Object.assign(req, patch);
      if (patch.status === RESOURCE_REQUEST_STATUS.FULFILLED && !patch.hrNote) {
        throw new Error('An HR note naming who was assigned/trained/hired is required to fulfill.');
      }
      req.events.push({
        id: `ev-${Date.now()}`,
        action: `Updated by HR (${patch.status || 'Action updated'})`,
        userName: 'Test HR',
        at: new Date().toISOString().replace('T', ' ').slice(0, 16),
      });
    }
    return mockDelay(normalizeResourceRequest(req), 300);
  }

  const { data } = await axiosClient.patch(ENDPOINTS.resourceRequests.update(id), patch);
  return normalizeResourceRequest(data.request || data);
}

