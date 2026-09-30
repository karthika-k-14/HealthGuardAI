import { api } from './api';
import { API_ENDPOINTS } from '../config/api';
import { STORAGE_KEYS } from '../constants/storageKeys';
import { isTokenExpired } from '../utils/jwt';

/**
 * Production Authentication Service interfacing with Auth Microservice via API Gateway
 */
export const authService = {
  /**
   * Login user with credentials
   * @param {string} email 
   * @param {string} password 
   * @returns {Promise<{token: string, userId: string, email: string, role: string, user: object}>}
   */
  async login(email, password) {
    const response = await api.post(API_ENDPOINTS.AUTH.LOGIN, { email, password });
    const rawData = response.data;
    const authData = rawData?.data || rawData;

    const token = authData.token || authData.accessToken || authData.jwt;
    const isProfileDone = Boolean(authData.profileCompleted);
    const user = {
      ...(authData.user || {}),
      id: authData.userId || authData.user?.id || '',
      userId: authData.userId || authData.user?.id || '',
      email: authData.email || authData.user?.email || email,
      role: authData.role || authData.user?.role || 'CITIZEN',
      firstName: authData.firstName || authData.user?.firstName || '',
      lastName: authData.lastName || authData.user?.lastName || '',
      profileCompleted: isProfileDone,
    };
    const role = authData.role || user.role || 'CITIZEN';
    const userId = authData.userId || user.id || '';
    const userEmail = authData.email || user.email || email;

    this.saveSession({ token, userId, email: userEmail, role, user });

    return { token, userId, email: userEmail, role, user };
  },

  /**
   * Register new user
   * @param {object} userData 
   * @returns {Promise<object>}
   */
  async register(userData) {
    const response = await api.post(API_ENDPOINTS.AUTH.REGISTER, userData);
    return response.data;
  },

  /**
   * Save session data to localStorage
   */
  saveSession({ token, userId, email, role, user }) {
    if (token) {
      localStorage.setItem(STORAGE_KEYS.TOKEN, token);
      localStorage.setItem('token', token);
    }
    if (role) {
      localStorage.setItem(STORAGE_KEYS.ROLE, role);
      localStorage.setItem('role', role);
    }
    if (userId) {
      localStorage.setItem('userId', String(userId));
    }
    if (email) {
      localStorage.setItem('email', email);
    }
    if (user) {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
      localStorage.setItem('user', JSON.stringify(user));
    }
  },

  /**
   * Clear user session and logout
   */
  logout() {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.ROLE);
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userId');
    localStorage.removeItem('email');
    localStorage.removeItem('user');
  },

  /**
   * Get stored JWT token
   */
  getToken() {
    return localStorage.getItem(STORAGE_KEYS.TOKEN) || localStorage.getItem('token');
  },

  /**
   * Get stored User object
   */
  getUser() {
    const raw = localStorage.getItem(STORAGE_KEYS.USER) || localStorage.getItem('user');
    try {
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  /**
   * Get stored User Role
   */
  getRole() {
    return localStorage.getItem(STORAGE_KEYS.ROLE) || localStorage.getItem('role');
  },

  /**
   * Get stored User ID
   */
  getUserId() {
    return localStorage.getItem('userId') || this.getUser()?.id || '';
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    const token = this.getToken();
    return Boolean(token && !isTokenExpired(token));
  },
};

export default authService;
