import apiClient from './axios';

/**
 * Fetch Health Officer notification preferences from backend.
 * @param {string|number} userId
 */
export async function getHealthOfficerPreferences(userId) {
  const resolvedUserId = userId || 27;
  const { data } = await apiClient.get(`/api/health-officer/preferences/${resolvedUserId}`);
  return data?.data || data;
}

/**
 * Update Health Officer notification preferences.
 * @param {string|number} userId
 * @param {Object} preferences
 */
export async function updateHealthOfficerPreferences(userId, preferences) {
  const resolvedUserId = userId || 27;
  const { data } = await apiClient.put(`/api/health-officer/preferences/${resolvedUserId}`, preferences);
  return data?.data || data;
}
