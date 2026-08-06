import axios from 'axios';
import toast from 'react-hot-toast';
import { STORAGE_KEYS } from '../constants/storageKeys';
import { getItem } from '../utils/storage';

// Base URL points at the real Spring Boot backend, overridable via
// VITE_API_BASE_URL (see .env). authApi.js and profileApi-style calls
// go through this client and hit real HTTP endpoints; modules that
// still have no backend counterpart (see README notes) continue to
// resolve against local mock JSON until those endpoints exist.
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = getItem(STORAGE_KEYS.TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const message =
      error?.response?.data?.message ||
      error?.message ||
      'Something went wrong. Please try again.';

    if (status === 401) {
      toast.error('Your session has expired. Please sign in again.');
    } else if (status === 403) {
      toast.error("You don't have permission to do that.");
    } else if (status >= 500) {
      toast.error('Server error. Our team has been notified.');
    } else if (status !== undefined) {
      toast.error(message);
    }
    // Network errors (status === undefined) are left for callers to
    // handle explicitly, since mock-mode intentionally never calls
    // this transport layer yet.

    return Promise.reject(error);
  }
);

export default apiClient;
