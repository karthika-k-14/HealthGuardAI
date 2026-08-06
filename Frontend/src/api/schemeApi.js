import apiClient from './axios';

/**
 * Government Scheme - calls the real Spring Boot backend
 * (SchemeController). Reads hit "/schemes/**" (any authenticated role);
 * writes hit "/admin/schemes/**" (ROLE_ADMIN).
 */

export async function fetchSchemes() {
  const { data } = await apiClient.get('/schemes');
  return data;
}

export async function fetchSchemeById(id) {
  const { data } = await apiClient.get(`/schemes/${id}`);
  return data;
}

export async function searchSchemes({ query, category } = {}) {
  const { data } = await apiClient.get('/schemes/search', { params: { query, category } });
  return data;
}

export async function createScheme(scheme) {
  const { data } = await apiClient.post('/admin/schemes', scheme);
  return data;
}

export async function updateScheme(id, scheme) {
  const { data } = await apiClient.put(`/admin/schemes/${id}`, scheme);
  return data;
}

export async function deleteScheme(id) {
  await apiClient.delete(`/admin/schemes/${id}`);
  return { id, deleted: true };
}

/**
 * Scheme Beneficiary Management - citizen side
 * (SchemeApplicationController, "/citizen/scheme-applications/**").
 */

export async function applyForScheme(schemeId) {
  const { data } = await apiClient.post('/citizen/scheme-applications', { schemeId });
  return data;
}

export async function fetchMySchemeApplications() {
  const { data } = await apiClient.get('/citizen/scheme-applications');
  return data;
}
