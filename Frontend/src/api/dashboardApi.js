import apiClient from './axios';

/**
 * Real Production Citizen Dashboard API
 * Connected directly to PostgreSQL tables via citizen-service:
 * - citizens, citizen_health_profiles
 * - medicine_reminders, medication_history
 * - ai_analysis
 * - emergency_alerts
 * - notifications
 */

export async function fetchDashboardSummary(citizenId = null) {
  try {
    const params = citizenId ? { citizenId } : {};
    const response = await apiClient.get('/api/dashboard/summary', { params });
    return response?.data?.data || null;
  } catch (err) {
    console.error('[dashboardApi] Error fetching summary:', err);
    return null;
  }
}

export async function fetchDashboardActivity(citizenId = null) {
  try {
    const params = citizenId ? { citizenId } : {};
    const response = await apiClient.get('/api/dashboard/activity', { params });
    return Array.isArray(response?.data?.data) ? response.data.data : [];
  } catch (err) {
    console.error('[dashboardApi] Error fetching activity feed:', err);
    return [];
  }
}

export async function fetchDashboardInsights(citizenId = null) {
  try {
    const params = citizenId ? { citizenId } : {};
    const response = await apiClient.get('/api/dashboard/insights', { params });
    return Array.isArray(response?.data?.data) ? response.data.data : [];
  } catch (err) {
    console.error('[dashboardApi] Error fetching insights:', err);
    return [];
  }
}

export async function fetchUpcomingActions(citizenId = null) {
  try {
    const params = citizenId ? { citizenId } : {};
    const response = await apiClient.get('/api/dashboard/upcoming-actions', { params });
    return Array.isArray(response?.data?.data) ? response.data.data : [];
  } catch (err) {
    console.error('[dashboardApi] Error fetching upcoming actions:', err);
    return [];
  }
}
