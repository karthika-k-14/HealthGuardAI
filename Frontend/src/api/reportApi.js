import apiClient from './axios';

function cleanParams(params = {}) {
  const cleaned = {};
  Object.keys(params).forEach((key) => {
    const val = params[key];
    if (val !== undefined && val !== null && val !== '') {
      cleaned[key] = val;
    }
  });
  return cleaned;
}

function getAuthContext() {
  try {
    const user = JSON.parse(localStorage.getItem('hg_user') || '{}');
    return {
      ashaWorkerId: user.ashaWorkerId || user.id,
      userId: user.id,
      email: user.email,
      role: user.role,
    };
  } catch {
    return {};
  }
}

async function fetchDynamicReport(endpoint, filters = {}) {
  const auth = getAuthContext();
  const params = cleanParams({
    ...filters,
    ashaWorkerId: auth.ashaWorkerId,
  });

  const headers = {};
  if (auth.userId) headers['X-User-Id'] = String(auth.userId);
  if (auth.email) headers['X-User-Email'] = auth.email;
  if (auth.role) headers['X-User-Role'] = auth.role;

  try {
    const { data } = await apiClient.get(endpoint, {
      params,
      headers,
      silent: true,
    });
    const res = data?.data || data;
    if (res && typeof res === 'object') return res;
  } catch (e) {
    // If route has prefix mismatch, attempt alternative
    try {
      const altEndpoint = endpoint.startsWith('/api') ? endpoint.replace('/api', '') : `/api${endpoint}`;
      const { data } = await apiClient.get(altEndpoint, {
        params,
        headers,
        silent: true,
      });
      const res = data?.data || data;
      if (res && typeof res === 'object') return res;
    } catch (e2) {
      // Return empty report structure if network fails; NEVER mock or fake
      return {
        reportType: endpoint.split('/').pop()?.toUpperCase() || 'REPORT',
        reportTitle: 'Report',
        reportPeriod: 'Selected Period',
        isEmpty: true,
        metrics: {},
        records: [],
      };
    }
  }

  return {
    reportType: endpoint.split('/').pop()?.toUpperCase() || 'REPORT',
    reportTitle: 'Report',
    reportPeriod: 'Selected Period',
    isEmpty: true,
    metrics: {},
    records: [],
  };
}

export async function getDailyReport(filters = {}) {
  return fetchDynamicReport('/api/asha/reports/daily', filters);
}

export async function getWeeklyReport(filters = {}) {
  return fetchDynamicReport('/api/asha/reports/weekly', filters);
}

export async function getMonthlyReport(filters = {}) {
  return fetchDynamicReport('/api/asha/reports/monthly', filters);
}

export async function getYearlyReport(filters = {}) {
  return fetchDynamicReport('/api/asha/reports/yearly', filters);
}

export async function getDiseaseReport(filters = {}) {
  return fetchDynamicReport('/api/asha/reports/disease', filters);
}

export async function getCitizenReport(filters = {}) {
  return fetchDynamicReport('/api/asha/reports/citizen', filters);
}

export async function getVaccinationReport(filters = {}) {
  return fetchDynamicReport('/api/asha/reports/vaccination', filters);
}

export async function getHomeVisitReport(filters = {}) {
  return fetchDynamicReport('/api/asha/reports/home-visit', filters);
}

export async function getPharmacistReport(type, filters = {}) {
  return fetchDynamicReport(`/api/pharmacist/reports/${type}`, filters);
}

export async function fetchReportByType(type, filters = {}) {
  const normalizedKey = (type || '').toLowerCase();
  switch (normalizedKey) {
    case 'daily':
      return getDailyReport(filters);
    case 'weekly':
      return getWeeklyReport(filters);
    case 'monthly':
      return getMonthlyReport(filters);
    case 'yearly':
    case 'annual':
      return getYearlyReport(filters);
    case 'disease':
    case 'surveillance':
      return getDiseaseReport(filters);
    case 'citizen':
    case 'citizens':
    case 'family':
    case 'demographic':
      return getCitizenReport(filters);
    case 'vaccination':
    case 'phc':
    case 'immunization':
      return getVaccinationReport(filters);
    case 'home-visit':
    case 'visit':
    case 'visits':
      return getHomeVisitReport(filters);
    default:
      return getDailyReport(filters);
  }
}
