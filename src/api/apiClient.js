import axios from 'axios';
import { API_BASE_URL } from '../config/env';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// ---------------------------------------
// Request interceptor
// - Attach JWT access token to all requests
//   except /api/auth/login
// ---------------------------------------
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');

    const url = (config?.url || '').toLowerCase();
    const isAuthLogin = url.includes('/api/auth/login');

    if (token && !isAuthLogin) {
      config.headers = config.headers || {};
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ---------------------------------------
// Response interceptor
// - Handle expired / invalid JWT (401)
// - Force logout and redirect to /login
// ---------------------------------------
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('accessToken');

      // Hard redirect to login (safe everywhere)
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

