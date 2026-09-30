import axios from 'axios';
import toast from 'react-hot-toast';
import { API_BASE_URL } from '../config/api';
import { STORAGE_KEYS } from '../constants/storageKeys';
import { isTokenExpired } from '../utils/jwt';

/**
 * Reusable Centralized Axios Instance configured for API Gateway (port 8080)
 */
export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Automatically injects JWT Bearer token into Authorization header
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN) || localStorage.getItem('token');
    // Only attach Authorization header if a valid, non-expired token exists and is NOT a local guest token
    if (token && !token.startsWith('guest-local-')) {
      if (isTokenExpired(token)) {
        localStorage.removeItem(STORAGE_KEYS.TOKEN);
        localStorage.removeItem(STORAGE_KEYS.ROLE);
        localStorage.removeItem(STORAGE_KEYS.USER);
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('user');
      } else {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Centralized Error Handling & Session Expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const errorMessage =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      error?.message ||
      'An unexpected error occurred.';

    const currentPath = window.location.pathname;
    const isAuthRequest = error?.config?.url?.includes('/api/auth/');
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN) || localStorage.getItem('token');
    const isGuest = Boolean(token && token.startsWith('guest-local-'));
    const isPublicPath = currentPath === '/' || currentPath === '/login' || currentPath === '/register' || currentPath === '/unauthorized' || currentPath === '/server-error';

    if (status === 401 && !isAuthRequest && !isGuest && !isPublicPath) {
      // Session Expired or Invalid Token on protected pages
      localStorage.removeItem(STORAGE_KEYS.TOKEN);
      localStorage.removeItem(STORAGE_KEYS.ROLE);
      localStorage.removeItem(STORAGE_KEYS.USER);
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      toast.error('Session expired. Please sign in again.');

      if (currentPath !== '/login' && currentPath !== '/register') {
        window.location.href = '/login';
      }
    } else if (error?.config?.silent) {
      // Caller explicitly requested silent error handling (no global toast popup)
      return Promise.reject(error);
    } else if (status === 403) {
      toast.error('Access Denied: You do not have permission for this action.');
    } else if (status === 404) {
      console.warn('Requested resource was not found:', error?.config?.url);
    } else if (status >= 500) {
      toast.error('Internal Server Error. Please try again later.');
    } else if (errorMessage && !isAuthRequest && !isGuest) {
      toast.error(errorMessage);
    }

    return Promise.reject(error);
  }
);

export default api;
