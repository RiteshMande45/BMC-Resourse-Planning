import { axiosClient } from '../axiosClient';
import { ENDPOINTS } from '../endpoints';
import { mockDelay } from '../../mocks';
import { MOCK_PROJECTS } from '../../mocks/projects';
import { MOCK_EMPLOYEES } from '../../mocks/employees';
import { matchScore } from '../../utils/calculations';

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';

let inMemoryProjects = [...MOCK_PROJECTS];

export function normalizeProject(raw) {
  if (!raw) return null;
  return {
    id: raw.id,
    name: raw.name,
    client: raw.client_name || raw.client,
    clientId: raw.client_id || raw.clientId,
    managerId: raw.manager_id || raw.managerId,
    managerName: raw.manager_name || raw.managerName || 'Unassigned',
    status: raw.status,
    startDate: raw.start_date || raw.startDate,
    dueDate: raw.due_date || raw.dueDate,
    budget: raw.budget,
    contractValue: raw.contract_value || raw.contractValue,
    invoiced: raw.invoiced,
    teamCount: Number(raw.team_count || raw.teamCount || 0),
    workPercent: Number(raw.work_percent || raw.workPercent || 0),
    timePercent: Number(raw.time_percent || raw.timePercent || 0),
    health: raw.health || 'on_track',
    technologies: raw.technologies || raw.skills || [],
    description: raw.description || '',
    documents: raw.documents || [],
  };
}

export async function getProjects() {
  if (USE_MOCK) {
    return mockDelay(inMemoryProjects.map(normalizeProject));
  }
  const { data } = await axiosClient.get(ENDPOINTS.projects.list);
  const list = Array.isArray(data) ? data : data.projects || [];
  return list.map(normalizeProject);
}

export async function getProjectById(id) {
  if (USE_MOCK) {
    const found = inMemoryProjects.find((p) => p.id === id);
    return mockDelay(found ? normalizeProject(found) : null);
  }
  const { data } = await axiosClient.get(ENDPOINTS.projects.detail(id));
  return normalizeProject(data.project || data);
}

export async function createProject(projectData) {
  if (USE_MOCK) {
    const newProj = {
      id: `proj-${Date.now()}`,
      name: projectData.name,
      client: projectData.clientName || 'Client',
      clientId: projectData.clientId || 'cli-new',
      managerId: projectData.managerId || null,
      managerName: projectData.managerName || 'Unassigned',
      status: 'new',
      startDate: projectData.startDate,
      dueDate: projectData.dueDate,
      budget: projectData.budget || null,
      contractValue: projectData.budget || null,
      invoiced: null,
      teamCount: 0,
      workPercent: 0,
      timePercent: 0,
      health: 'on_track',
      technologies: projectData.technologies || [],
      description: projectData.description || '',
      documents: projectData.documents || [],
    };
    inMemoryProjects.unshift(newProj);
    return mockDelay(normalizeProject(newProj), 400);
  }

  const { data } = await axiosClient.post(ENDPOINTS.projects.create, projectData);
  return normalizeProject(data.project || data);
}

export async function updateProject(id, updateData) {
  if (USE_MOCK) {
    const idx = inMemoryProjects.findIndex((p) => p.id === id);
    if (idx !== -1) {
      inMemoryProjects[idx] = { ...inMemoryProjects[idx], ...updateData };
      return mockDelay(normalizeProject(inMemoryProjects[idx]), 300);
    }
    return mockDelay(null);
  }
  const { data } = await axiosClient.patch(ENDPOINTS.projects.update(id), updateData);
  return normalizeProject(data.project || data);
}

export async function uploadDocument(projectId, fileData) {
  if (USE_MOCK) {
    const doc = {
      id: `doc-${Date.now()}`,
      type: fileData.type || 'Other',
      name: fileData.file?.name || fileData.name || 'document.pdf',
      url: '#',
    };
    const proj = inMemoryProjects.find((p) => p.id === projectId);
    if (proj) {
      proj.documents = proj.documents || [];
      proj.documents.push(doc);
    }
    return mockDelay(doc, 350);
  }

  const formData = new FormData();
  formData.append('file', fileData.file);
  formData.append('type', fileData.type);
  const { data } = await axiosClient.post(ENDPOINTS.projects.documents(projectId), formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

export async function getProjectMatches(projectId) {
  if (USE_MOCK) {
    // Generate matches according to Section 10.3 table:
    // S. Iyer 80% skill, 100% free -> 88
    // K. Desai 70% skill, 100% free -> 82
    // A. Rao 90% skill, 60% free -> 78
    // P. Nair 100% skill, 40% free -> 76
    // R. Joshi 60% skill, 20% free -> 44
    const candidates = [
      { id: 'emp-iyer', name: 'S. Iyer', designation: 'Developer', skillMatch: 80, freeOnStart: 100, availability: 'available' },
      { id: 'emp-desai', name: 'K. Desai', designation: 'Developer', skillMatch: 70, freeOnStart: 100, availability: 'available' },
      { id: 'emp-rao', name: 'A. Rao', designation: 'Developer', skillMatch: 90, freeOnStart: 60, availability: 'partially_available' },
      { id: 'emp-nair', name: 'P. Nair', designation: 'QA', skillMatch: 100, freeOnStart: 40, availability: 'partially_available' },
      { id: 'emp-joshi', name: 'R. Joshi', designation: 'Developer', skillMatch: 60, freeOnStart: 20, availability: 'fully_allocated' },
    ];

    const withScore = candidates.map((c) => ({
      ...c,
      score: matchScore(c.skillMatch, c.freeOnStart),
    }));

    withScore.sort((a, b) => b.score - a.score);
    return mockDelay(withScore);
  }

  const { data } = await axiosClient.get(ENDPOINTS.projects.matches(projectId));
  return data;
}

export async function getProjectStaffing(projectId) {
  if (USE_MOCK) {
    // Coverage per required skill
    const staffing = [
      { skill: 'Control-M', coveredBy: ['S. Iyer', 'Durgadas Barhate'], freeCount: 1, status: 'Covered' },
      { skill: 'Python', coveredBy: ['S. Iyer', 'K. Desai', 'A. Rao'], freeCount: 2, status: 'Covered' },
      { skill: 'React', coveredBy: ['A. Rao'], freeCount: 0, status: 'Gap' },
      { skill: 'PostgreSQL', coveredBy: ['K. Desai', 'Sneha Patel'], freeCount: 1, status: 'Covered' },
      { skill: 'AWS', coveredBy: [], freeCount: 0, status: 'Gap' },
    ];
    return mockDelay(staffing);
  }
  const { data } = await axiosClient.get(ENDPOINTS.projects.staffing(projectId));
  return data;
}

