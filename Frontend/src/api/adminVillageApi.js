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
  const { data } = await apiClient.get('/admin/villages');
  return data;
}
