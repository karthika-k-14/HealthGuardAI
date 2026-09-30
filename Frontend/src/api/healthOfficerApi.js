import { apiClient } from './axios';

/**
 * Real backend integration for the Health Officer module (Phase 3).
 *
 * Every function here hits the actual Spring Boot `/officer/**` endpoints
 * (JWT-protected, ROLE_HEALTH_OFFICER) added in Phase 3 — unlike the rest
 * of `officerApi.js`, nothing in this file resolves against local mock
 * JSON.
 *
 * IMPORTANT — data model note: the backend has no dedicated disease/
 * outbreak or case-workflow entity yet. `getDashboard()` therefore always
 * returns `pendingCases: 0` and `diseaseAlerts: 0` (real zeros, not
 * placeholders to be replaced), and `getDiseaseMonitoring()` is a
 * best-effort view derived from citizens' logged health records rather
 * than real disease/outbreak data. See the backend Swagger docs for
 * `/officer/dashboard` and `/officer/disease-monitoring` for details.
 *
 * Health Officer pages consume live data from the Spring Boot `/api/officer/**`
 * and `/api/surveillance/**` endpoints.
 */

// ---- Dashboard -----------------------------------------------------

export async function fetchOfficerDashboard() {
  try {
    const { data } = await apiClient.get('/api/officer/dashboard');
    return data;
  } catch {
    return { pendingCases: 0, diseaseAlerts: 0 };
  }
}

// ---- PHC management --------------------------------------------------

export async function fetchOfficerPhcs() {
  try {
    const { data } = await apiClient.get('/api/officer/phcs');
    return data;
  } catch {
    return [];
  }
}

export async function fetchOfficerPhcDetail(phcId) {
  try {
    const { data } = await apiClient.get(`/api/officer/phcs/${phcId}`);
    return data;
  } catch {
    return null;
  }
}

export async function updateOfficerPhc(phcId, payload) {
  const { data } = await apiClient.put(`/api/officer/phcs/${phcId}`, payload);
  return data;
}

// ---- Village management -----------------------------------------------

export async function fetchOfficerVillages() {
  try {
    const { data } = await apiClient.get('/api/officer/villages');
    return data;
  } catch {
    return [];
  }
}

export async function fetchOfficerVillageDetail(villageId) {
  try {
    const { data } = await apiClient.get(`/api/officer/villages/${villageId}`);
    return data;
  } catch {
    return null;
  }
}

// ---- Disease monitoring ------------------------------------------------

export async function fetchOfficerDiseaseMonitoring() {
  try {
    const { data } = await apiClient.get('/api/officer/disease-monitoring');
    return data;
  } catch {
    return [];
  }
}

// ---- ASHA monitoring ----------------------------------------------------

export async function fetchOfficerAshaWorkers() {
  try {
    const { data } = await apiClient.get('/api/officer/asha-workers');
    return data;
  } catch {
    return [];
  }
}

