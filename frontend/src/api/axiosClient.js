import axios from 'axios';
import { getToken, clearToken } from '../utils/token';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

export const axiosClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor: add Bearer token
axiosClient.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: error normalization and auth redirection
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response ? error.response.status : null;
    const data = error.response?.data || {};

    const normalizedError = {
      status,
      code: data.code || (status === 403 && data.message?.includes('inactive') ? 'USER_INACTIVE' : 'UNKNOWN_ERROR'),
      message: data.message || data.error?.message || error.message || 'An unexpected error occurred',
      details: data.details || null,
      date: data.date,
      total: data.total,
    };

    if (status === 401) {
      clearToken();
      // Only redirect if not already on login page
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
        const returnUrl = encodeURIComponent(window.location.pathname + window.location.search);
        window.location.href = `/login?sessionExpired=true&returnTo=${returnUrl}`;
      }
    } else if (status === 403 && normalizedError.code !== 'USER_INACTIVE') {
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/403')) {
        window.location.href = '/403';
      }
    }

    return Promise.reject(normalizedError);
  }
);

export default axiosClient;

