import { api } from './api';
import { API_ENDPOINTS } from '../config/api';

/**
 * AI & Triage Microservice Client interfacing via API Gateway (port 8080)
 */
export const aiService = {
  /**
   * Send chat message to AI assistant
   * @param {string} message 
   * @param {string} conversationId 
   * @param {object} context 
   */
  async chat(message, conversationId = null, context = {}) {
    const response = await api.post(API_ENDPOINTS.AI.CHAT, {
      message,
      conversationId,
      context,
    });
    return response.data;
  },

  /**
   * Analyze symptoms for AI Triage Assessment
   * @param {object} symptomData 
   */
  async analyzeSymptoms(symptomData) {
    const response = await api.post(API_ENDPOINTS.AI.ANALYZE_SYMPTOMS, symptomData);
    return response.data;
  },

  /**
   * Classify disease / medical images or clinical data
   * @param {object|FormData} payload 
   */
  async classify(payload) {
    const isFormData = payload instanceof FormData;
    const config = isFormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {};
    const response = await api.post(API_ENDPOINTS.AI.CLASSIFY, payload, config);
    return response.data;
  },
};

export default aiService;
