import { axiosClient } from '../axiosClient';
import { ENDPOINTS } from '../endpoints';
import { mockDelay } from '../../mocks';
import { MOCK_CLIENTS, MOCK_DEALS } from '../../mocks/deals';
import { MOCK_PROJECTS } from '../../mocks/projects';

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';

let inMemoryClients = [...MOCK_CLIENTS];
let inMemoryDeals = [...MOCK_DEALS];

export async function getClients() {
  if (USE_MOCK) {
    return mockDelay(inMemoryClients);
  }
  const { data } = await axiosClient.get(ENDPOINTS.clients.list);
  return data;
}

export async function createClient(client) {
  if (USE_MOCK) {
    const newClient = {
      id: `cli-${Date.now()}`,
      name: client.name,
      contactName: client.contactName,
      contactEmail: client.contactEmail,
      contactPhone: client.contactPhone,
      projectsCount: 0,
    };
    inMemoryClients.push(newClient);
    return mockDelay(newClient, 300);
  }
  const { data } = await axiosClient.post(ENDPOINTS.clients.create, client);
  return data;
}

export async function getDeals() {
  if (USE_MOCK) {
    return mockDelay(inMemoryDeals);
  }
  const { data } = await axiosClient.get(ENDPOINTS.deals.list);
  return data;
}

export async function createDeal(deal) {
  if (USE_MOCK) {
    const newDeal = {
      id: `deal-${Date.now()}`,
      name: deal.name,
      clientId: deal.clientId,
      clientName: deal.clientName || 'Client',
      stage: deal.stage || 'Discovery',
      winProbability: Number(deal.winProbability || 50),
      value: Number(deal.value || 0),
      expectedStart: deal.expectedStart,
      contactName: deal.contactName,
      contactEmail: deal.contactEmail,
    };
    inMemoryDeals.unshift(newDeal);
    return mockDelay(newDeal, 300);
  }
  const { data } = await axiosClient.post(ENDPOINTS.deals.create, deal);
  return data;
}

export async function updateDeal(id, updates) {
  if (USE_MOCK) {
    const idx = inMemoryDeals.findIndex((d) => d.id === id);
    if (idx !== -1) {
      inMemoryDeals[idx] = { ...inMemoryDeals[idx], ...updates };
      return mockDelay(inMemoryDeals[idx]);
    }
    return mockDelay(null);
  }
  const { data } = await axiosClient.patch(ENDPOINTS.deals.update(id), updates);
  return data;
}

export async function recordSignOff(projectId, signOffData) {
  if (USE_MOCK) {
    return mockDelay({ success: true, projectId, signedAt: new Date().toISOString() });
  }
  const { data } = await axiosClient.post(`/projects/${projectId}/signoff`, signOffData);
  return data;
}

export async function postponeDueDate(projectId, { newDueDate, reason }) {
  if (!newDueDate || !reason || reason.trim().length < 5) {
    throw new Error('New due date and reason are required.');
  }
  if (USE_MOCK) {
    const proj = MOCK_PROJECTS.find((p) => p.id === projectId);
    if (proj) {
      proj.dueDate = newDueDate;
      proj.postponeReason = reason;
    }
    return mockDelay({ success: true, projectId, newDueDate, reason });
  }
  const { data } = await axiosClient.post(`/projects/${projectId}/postpone`, { newDueDate, reason });
  return data;
}

