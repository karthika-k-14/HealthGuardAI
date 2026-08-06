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
 * None of the existing Health Officer pages (OfficerDashboard,
 * ReferralMonitoring, DistrictAnalytics, DiseaseMonitoring) consume a
 * shape compatible with these endpoints — see the Phase 3 handoff notes
 * for why they remain on mock data. Reports.jsx is the one screen wired
 * to this file, since its UI renders whatever summary object it's given.
 */

// ---- Dashboard -----------------------------------------------------

export async function fetchOfficerDashboard() {
  const { data } = await apiClient.get('/officer/dashboard');
  return data;
}

// ---- PHC management --------------------------------------------------

export async function fetchOfficerPhcs() {
  const { data } = await apiClient.get('/officer/phcs');
  return data;
}

export async function fetchOfficerPhcDetail(phcId) {
  const { data } = await apiClient.get(`/officer/phcs/${phcId}`);
  return data;
}

export async function updateOfficerPhc(phcId, payload) {
  const { data } = await apiClient.put(`/officer/phcs/${phcId}`, payload);
  return data;
}

// ---- Village management -----------------------------------------------

export async function fetchOfficerVillages() {
  const { data } = await apiClient.get('/officer/villages');
  return data;
}

export async function fetchOfficerVillageDetail(villageId) {
  const { data } = await apiClient.get(`/officer/villages/${villageId}`);
  return data;
}

// ---- Disease monitoring ------------------------------------------------

export async function fetchOfficerDiseaseMonitoring() {
  const { data } = await apiClient.get('/officer/disease-monitoring');
  return data;
}

// ---- ASHA monitoring ----------------------------------------------------

export async function fetchOfficerAshaWorkers() {
  const { data } = await apiClient.get('/officer/asha-workers');
  return data;
}

// ---- Health reports -----------------------------------------------------

// reportType: 'daily' | 'weekly' | 'monthly'
export async function fetchOfficerHealthReport(reportType) {
  const { data } = await apiClient.get(`/officer/reports/${reportType}`);
  return data;
}

// Triggers a CSV download of the given report type via the browser.
export async function exportOfficerHealthReport(reportType) {
  const response = await apiClient.get(`/officer/reports/${reportType}/export`, {
    responseType: 'blob',
  });
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${reportType}-health-report.csv`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}
