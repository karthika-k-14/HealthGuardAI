import { api } from './api';
import { API_ENDPOINTS } from '../config/api';

/**
 * Admin Management Microservice Client interfacing via API Gateway (port 8080)
 */
export const adminService = {
  /**
   * Get all registered users for admin management
   * @param {object} params 
   */
  async getUsers(params = {}) {
    const response = await api.get(API_ENDPOINTS.ADMIN.USERS, { params });
    return response.data;
  },

  /**
   * Get single user by ID
   * @param {string|number} id 
   */
  async getUserById(id) {
    const response = await api.get(API_ENDPOINTS.ADMIN.USER_BY_ID(id));
    return response.data;
  },

  /**
   * Update user details or account status
   * @param {string|number} id 
   * @param {object} userData 
   */
  async updateUser(id, userData) {
    const response = await api.put(API_ENDPOINTS.ADMIN.USER_BY_ID(id), userData);
    return response.data;
  },

  /**
   * Delete user account
   * @param {string|number} id 
   */
  async deleteUser(id) {
    const response = await api.delete(API_ENDPOINTS.ADMIN.USER_BY_ID(id));
    return response.data;
  },

  /**
   * Get system & microservices actuator health status via Gateway
   */
  async getSystemHealth() {
    const response = await api.get(API_ENDPOINTS.ADMIN.SYSTEM_HEALTH);
    return response.data;
  },
};

export default adminService;
