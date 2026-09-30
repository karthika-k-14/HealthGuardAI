import apiClient from './axios';

/**
 * Read-only admin village listing - calls the real Spring Boot backend
 * (VillageController, "GET /admin/villages"). Exists to populate the
 * Broadcast Notification "Send to Village" target picker. This is
 * separate from the mock-backed village analytics helpers in
 * villageApi.js (fetchVillageAnalytics / fetchVillageOptions), which are
 * for the AI Public Health Intelligence widgets, not this admin listing.
 */
export async function fetchAdminVillages() {
  try {
    const { data } = await apiClient.get('/api/officer/villages');
    const list = data?.data || data;
    if (Array.isArray(list)) return list;
  } catch (e) {
    console.warn('Failed to fetch admin villages:', e?.message || e);
  }

  return [];
}
