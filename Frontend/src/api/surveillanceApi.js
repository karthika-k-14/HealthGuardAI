import apiClient from './axios';

function getAshaWorkerContext() {
  try {
    const raw = localStorage.getItem('hg_user') || localStorage.getItem('user');
    if (raw) {
      const u = JSON.parse(raw);
      return {
        ashaWorkerId: u.ashaWorkerId || null,
        userId: u.id || u.userId || localStorage.getItem('userId') || null,
        email: u.email || localStorage.getItem('email') || null,
        role: u.role || localStorage.getItem('role') || null,
      };
    }
  } catch (e) {}
  return {
    ashaWorkerId: null,
    userId: localStorage.getItem('userId') || null,
    email: localStorage.getItem('email') || null,
    role: localStorage.getItem('role') || null,
  };
}

export async function fetchSurveillanceReports(filters = {}) {
  try {
    const ctx = getAshaWorkerContext();
    const params = {
      ...filters,
      ...(ctx.ashaWorkerId ? { ashaWorkerId: ctx.ashaWorkerId } : {}),
    };
    const headers = {};
    if (ctx.userId) headers['X-User-Id'] = String(ctx.userId);
    if (ctx.email) headers['X-User-Email'] = ctx.email;
    if (ctx.role) headers['X-User-Role'] = ctx.role;

    const { data } = await apiClient.get('/api/asha/surveillance/reports', { params, headers });
    const list = data?.data || data;
    if (Array.isArray(list)) return list;
    return [];
  } catch (e) {
    return [];
  }
}

export async function submitSurveillanceReport(payload) {
  const ctx = getAshaWorkerContext();
  const todayDate = new Date().toISOString().slice(0, 10);
  const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const headers = {};
  if (ctx.userId) headers['X-User-Id'] = String(ctx.userId);
  if (ctx.email) headers['X-User-Email'] = ctx.email;
  if (ctx.role) headers['X-User-Role'] = ctx.role;

  const reqPayload = {
    citizenId: payload.citizenId ? Number(payload.citizenId) : 100,
    familyId: payload.familyId ? Number(payload.familyId) : null,
    ashaWorkerId: payload.ashaWorkerId ? Number(payload.ashaWorkerId) : (ctx.ashaWorkerId ? Number(ctx.ashaWorkerId) : (ctx.userId ? Number(ctx.userId) : 10)),
    citizenName: payload.citizenName || 'Citizen',
    village: payload.village || 'Coimbatore Village',
    address: payload.address || '',
    phoneNumber: payload.phoneNumber || '',
    reportDate: payload.reportDate || todayDate,
    reportTime: payload.reportTime || currentTime,
    disease: payload.disease || 'Fever',
    otherDiseaseName: payload.otherDiseaseName || null,
    severity: payload.severity || 'Medium',
    symptoms: Array.isArray(payload.symptoms) ? payload.symptoms : [],
    otherSymptoms: payload.otherSymptoms || null,

    temperature: payload.temperature ? Number(payload.temperature) : null,
    bloodPressure: payload.bloodPressure || null,
    pulseRate: payload.pulseRate ? Number(payload.pulseRate) : null,
    spo2: payload.spo2 ? Number(payload.spo2) : null,

    observations: payload.observations || '',
    photoBase64: payload.photoBase64 || null,
    attachmentName: payload.attachmentName || null,
    emergencyReferral: Boolean(payload.emergencyReferral),

    affectedPersonId: payload.affectedPersonId ? Number(payload.affectedPersonId) : null,
    affectedPersonName: payload.affectedPersonName || payload.citizenName || 'Citizen',
    relationship: payload.relationship || 'Head of Household',
    age: payload.age ? Number(payload.age) : null,
    gender: payload.gender || null,
  };

  const { data } = await apiClient.post('/api/asha/surveillance/reports', reqPayload, { headers });
  return data?.data || data;
}

export async function fetchSurveillanceStatistics(params = {}) {
  try {
    const ctx = getAshaWorkerContext();
    const queryParams = {
      ...params,
      ...(ctx.ashaWorkerId ? { ashaWorkerId: ctx.ashaWorkerId } : {}),
    };
    const headers = {};
    if (ctx.userId) headers['X-User-Id'] = String(ctx.userId);
    if (ctx.email) headers['X-User-Email'] = ctx.email;
    if (ctx.role) headers['X-User-Role'] = ctx.role;

    const { data } = await apiClient.get('/api/asha/surveillance/statistics', { params: queryParams, headers });
    return data?.data || data || {};
  } catch (e) {
    return {
      totalReports: 0,
      pendingReviews: 0,
      highCriticalCases: 0,
      activeOutbreaks: 0,
      resolvedCases: 0,
      diseaseTrends: {},
      villageCases: {},
      outbreakAlerts: [],
    };
  }
}

export async function fetchOfficerSurveillanceReports(params = {}) {
  try {
    const { data } = await apiClient.get('/api/officer/surveillance/reports', { params });
    const list = data?.data || data;
    if (Array.isArray(list)) return list;
    return [];
  } catch (e) {
    return [];
  }
}

export async function fetchOfficerReportCounts() {
  try {
    const { data } = await apiClient.get('/api/officer/surveillance/reports/counts');
    return data?.data || data || { all: 0, pending: 0, verified: 0, escalated: 0, rejected: 0 };
  } catch (e) {
    return { all: 0, pending: 0, verified: 0, escalated: 0, rejected: 0 };
  }
}

export async function updateOfficerReportStatus(reportId, payload) {
  let currentUser = {};
  try {
    currentUser = JSON.parse(localStorage.getItem('hg_user') || localStorage.getItem('user') || '{}');
  } catch (e) {}

  const officerName = payload.reviewedBy || currentUser.fullName || currentUser.name || currentUser.email || 'Health Officer';
  const reqPayload = {
    status: payload.status,
    healthOfficerNotes: payload.healthOfficerNotes || null,
    reviewedBy: officerName,
  };

  const headers = {};
  if (currentUser.id || currentUser.userId) headers['X-User-Id'] = String(currentUser.id || currentUser.userId);
  if (currentUser.email) headers['X-User-Email'] = currentUser.email;
  if (currentUser.role) headers['X-User-Role'] = currentUser.role;
  headers['X-User-Name'] = officerName;

  const { data } = await apiClient.put(`/api/officer/surveillance/reports/${reportId}/status`, reqPayload, { headers });
  return data?.data || data;
}

export async function escalateReportToPhc(reportId, payload = {}) {
  let currentUser = {};
  try {
    currentUser = JSON.parse(localStorage.getItem('hg_user') || localStorage.getItem('user') || '{}');
  } catch (e) {}

  const officerName = payload.reviewedBy || currentUser.fullName || currentUser.name || currentUser.email || 'Health Officer';
  const reqPayload = {
    status: 'ESCALATED',
    healthOfficerNotes: payload.healthOfficerNotes || 'Escalated to PHC for urgent medical review.',
    reviewedBy: officerName,
  };

  const headers = {};
  if (currentUser.id || currentUser.userId) headers['X-User-Id'] = String(currentUser.id || currentUser.userId);
  if (currentUser.email) headers['X-User-Email'] = currentUser.email;
  if (currentUser.role) headers['X-User-Role'] = currentUser.role;
  headers['X-User-Name'] = officerName;

  const { data } = await apiClient.put(`/api/officer/surveillance/reports/${reportId}/status`, reqPayload, { headers });
  return data?.data || data;
}

export async function fetchPhcAlerts() {
  try {
    const { data } = await apiClient.get('/api/officer/phc-alerts');
    const list = data?.data || data;
    if (Array.isArray(list)) return list;
    return [];
  } catch (e) {
    return [];
  }
}

export async function fetchReferralStats() {
  try {
    const { data } = await apiClient.get('/api/officer/referral-stats');
    return data?.data || data || { totalEscalatedCases: 0, alertSent: 0, acknowledged: 0, inTreatment: 0, closed: 0 };
  } catch (e) {
    return { totalEscalatedCases: 0, alertSent: 0, acknowledged: 0, inTreatment: 0, closed: 0 };
  }
}

export async function updateReferralStatus(alertId, status) {
  const { data } = await apiClient.put(`/api/officer/referrals/${alertId}/status`, { status });
  return data?.data || data;
}

export async function deleteSurveillanceReport(reportId) {
  const ctx = getAshaWorkerContext();
  const params = {
    ...(ctx.ashaWorkerId ? { ashaWorkerId: ctx.ashaWorkerId } : {}),
  };
  const headers = {};
  if (ctx.userId) headers['X-User-Id'] = String(ctx.userId);
  if (ctx.email) headers['X-User-Email'] = ctx.email;
  if (ctx.role) headers['X-User-Role'] = ctx.role;

  const { data } = await apiClient.delete(`/api/asha/surveillance/reports/${reportId}`, { params, headers });
  return data?.data || data;
}

