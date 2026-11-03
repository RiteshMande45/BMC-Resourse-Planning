import axios from 'axios';

const API = axios.create({
    baseURL: 'http://localhost:8000/api',
});

// Projects API
export const getProjects = () => API.get('/projects');
export const createProject = (projectData) => API.post('/projects', projectData);
export const updateProject = (id, projectData) => API.put(`/projects/${id}`, projectData);
export const deleteProject = (id) => API.delete(`/projects/${id}`);

// Tasks API
export const getTasks = (projectId) => API.get(`/tasks${projectId ? `?project_id=${projectId}` : ''}`);
export const createTask = (taskData) => API.post('/tasks', taskData);
export const updateTask = (id, taskData) => API.put(`/tasks/${id}`, taskData);
export const deleteTask = (id) => API.delete(`/tasks/${id}`);

// Allocations API
export const getAllocations = (projectId) => API.get(`/allocations${projectId ? `?project_id=${projectId}` : ''}`);
export const createAllocation = (allocData) => API.post('/allocations', allocData);
export const deleteAllocation = (id) => API.delete(`/allocations/${id}`);

export default API;
