import { api } from './api';
import { API_ENDPOINTS } from '../config/api';

/**
 * Citizen Management Service connecting exclusively to API Gateway (port 8080)
 */
export const citizenService = {
  /**
   * List/Get all citizens
   * @param {object} params 
   */
  async listCitizens(params = {}) {
    const response = await api.get(API_ENDPOINTS.CITIZENS.BASE, { params });
    return response.data;
  },

  /**
   * Get single citizen by ID
   * @param {string|number} id 
   */
  async getCitizenById(id) {
    const response = await api.get(API_ENDPOINTS.CITIZENS.BY_ID(id));
    return response.data;
  },

  /**
   * Get logged-in citizen profile
   */
  async getCitizenProfile() {
    const response = await api.get(API_ENDPOINTS.CITIZENS.PROFILE);
    return response.data;
  },

  /**
   * Create a new citizen record
   * @param {object} citizenData 
   */
  async createCitizen(citizenData) {
    const response = await api.post(API_ENDPOINTS.CITIZENS.BASE, citizenData);
    return response.data;
  },

  /**
   * Update an existing citizen record
   * @param {string|number} id 
   * @param {object} citizenData 
   */
  async updateCitizen(id, citizenData) {
    const response = await api.put(API_ENDPOINTS.CITIZENS.UPDATE(id), citizenData);
    return response.data;
  },

  /**
   * Delete a citizen record
   * @param {string|number} id 
   */
  async deleteCitizen(id) {
    const response = await api.delete(API_ENDPOINTS.CITIZENS.DELETE(id));
    return response.data;
  },
};

export default citizenService;
