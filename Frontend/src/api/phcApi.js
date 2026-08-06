import apiClient from './axios';

/**
 * Admin PHC CRUD - calls the real Spring Boot backend (PhcController,
 * "/admin/phcs"). Distinct from the Health Officer's read-scoped
 * "/officer/phcs/**" endpoints in healthOfficerApi.js.
 */

export async function fetchPhcs() {
  const { data } = await apiClient.get('/admin/phcs');
  return data;
}

export async function fetchPhcById(phcId) {
  const { data } = await apiClient.get(`/admin/phcs/${phcId}`);
  return data;
}

export async function createPhc(phc) {
  const { data } = await apiClient.post('/admin/phcs', phc);
  return data;
}

export async function updatePhc(phcId, phc) {
  const { data } = await apiClient.put(`/admin/phcs/${phcId}`, phc);
  return data;
}

export async function deletePhc(phcId) {
  await apiClient.delete(`/admin/phcs/${phcId}`);
  return { id: phcId, deleted: true };
}
