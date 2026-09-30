import apiClient from './axios';

/**
 * AI/ML Medicine Demand Forecasting & Disease Intelligence API Client
 * Connects to HealthGuard AI backend / Gateway endpoints
 */

export const forecastingApi = {
  /**
   * Fetch production-grade AI/ML demand forecasts for Pharmacist domain.
   * Based strictly on validated approved surveillance records, usage history, and current inventory.
   */
  async getPharmacistDemandForecast() {
    const response = await apiClient.get('/api/ai/health/pharmacist/demand-forecast');
    return response.data;
  },

  /**
   * Fetch forecasting model metadata, champion parameters, versioning, and records audit trail.
   */
  async getForecastingMetadata() {
    const response = await apiClient.get('/api/ai/health/pharmacist/forecasting-metadata');
    return response.data;
  },

  /**
   * Fetch Disease Intelligence analytics for Health Officer domain.
   * Includes active validated cases, village distribution, and Outbreak Risk Score.
   */
  async getOfficerDiseaseIntelligence() {
    const response = await apiClient.get('/api/ai/health/officer/disease-intelligence');
    return response.data;
  },
  /**
   * Fetch Outbreak Predictions & Health Map analytics for Health Officer domain.
   * Calculates village risk scores from real PostgreSQL surveillance data.
   * Risk Score = (Total Cases × 1) + (Medium × 2) + (High × 3) + (Critical × 4) + (Escalated × 5)
   */
  async getOfficerHealthMap() {
    const response = await apiClient.get('/api/ai/health/officer/health-map');
    return response.data;
  }
};

export default forecastingApi;
