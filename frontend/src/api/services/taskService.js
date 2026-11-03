import { axiosClient } from '../axiosClient';
import { ENDPOINTS } from '../endpoints';
import { mockDelay } from '../../mocks';
import { MOCK_TASKS } from '../../mocks/tasks';

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';

let inMemoryTasks = [...MOCK_TASKS];

export function normalizeTask(raw) {
  if (!raw) return null;
  return {
    id: raw.id,
    title: raw.title,
    projectId: raw.project_id || raw.projectId,
    projectName: raw.project_name || raw.projectName || 'Project',
    assigneeId: raw.assignee_id || raw.assigneeId,
    assigneeName: raw.assignee_name || raw.assigneeName || 'Unassigned',
    estimateHrs: Number(raw.estimate_hrs || raw.estimateHrs || 0),
    loggedHrs: Number(raw.logged_hrs || raw.loggedHrs || 0),
    dueDate: raw.due_date || raw.dueDate,
    status: raw.status || 'todo',
    blockedReason: raw.blocked_reason || raw.blockedReason || null,
    isMilestone: Boolean(raw.is_milestone || raw.isMilestone),
    completedAt: raw.completed_at || raw.completedAt || null,
    blockedReportedDaysAgo: raw.blockedReportedDaysAgo,
  };
}

export async function getTasks(filters = {}) {
  if (USE_MOCK) {
    let list = inMemoryTasks;
    if (filters.assigneeId) {
      list = list.filter((t) => t.assigneeId === filters.assigneeId);
    }
    if (filters.projectId) {
      list = list.filter((t) => t.projectId === filters.projectId);
    }
    return mockDelay(list.map(normalizeTask));
  }

  const { data } = await axiosClient.get(ENDPOINTS.projects.tasks(filters.projectId || 'all'), {
    params: filters,
  });
  const list = Array.isArray(data) ? data : data.tasks || [];
  return list.map(normalizeTask);
}

export async function updateTask(id, updates) {
  if (USE_MOCK) {
    const idx = inMemoryTasks.findIndex((t) => t.id === id);
    if (idx !== -1) {
      inMemoryTasks[idx] = { ...inMemoryTasks[idx], ...updates };
      return mockDelay(normalizeTask(inMemoryTasks[idx]));
    }
    return mockDelay(null);
  }

  const { data } = await axiosClient.patch(ENDPOINTS.tasks.update(id), updates);
  return normalizeTask(data.task || data);
}

export async function createTask(taskData) {
  if (USE_MOCK) {
    const newTask = {
      id: `tsk-${Date.now()}`,
      title: taskData.title,
      projectId: taskData.projectId,
      projectName: taskData.projectName || 'BMC Control-M',
      assigneeId: taskData.assigneeId || 'emp-4',
      assigneeName: taskData.assigneeName || 'Test Employee',
      estimateHrs: Number(taskData.estimateHrs || 8),
      loggedHrs: 0,
      dueDate: taskData.dueDate,
      status: 'todo',
      isMilestone: Boolean(taskData.isMilestone),
    };
    inMemoryTasks.unshift(newTask);
    return mockDelay(normalizeTask(newTask), 300);
  }

  const { data } = await axiosClient.post(ENDPOINTS.projects.tasks(taskData.projectId), taskData);
  return normalizeTask(data.task || data);
}

export async function createSubtask(parentTaskId, subtaskData) {
  if (USE_MOCK) {
    const sub = {
      id: `sub-${Date.now()}`,
      parentId: parentTaskId,
      title: subtaskData.title,
      status: 'todo',
    };
    return mockDelay(sub, 200);
  }

  const { data } = await axiosClient.post(ENDPOINTS.tasks.subtasks(parentTaskId), subtaskData);
  return data;
}

