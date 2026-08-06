import apiClient from './axios';

/**
 * Helper to strip empty/null/undefined query parameters before sending request
 */
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

/**
 * Daily Activity & Health Summary Report
 * GET /reports/daily
 */
export async function getDailyReport(filters = {}) {
  const { data } = await apiClient.get('/reports/daily', { params: cleanParams(filters) });
  return data;
}

/**
 * Weekly Health & Operational Performance Report
 * GET /reports/weekly
 */
export async function getWeeklyReport(filters = {}) {
  const { data } = await apiClient.get('/reports/weekly', { params: cleanParams(filters) });
  return data;
}

/**
 * Monthly Comprehensive Health Analytics Report
 * GET /reports/monthly
 */
export async function getMonthlyReport(filters = {}) {
  const { data } = await apiClient.get('/reports/monthly', { params: cleanParams(filters) });
  return data;
}

/**
 * Annual Health System Performance Report
 * GET /reports/yearly
 */
export async function getYearlyReport(filters = {}) {
  const { data } = await apiClient.get('/reports/yearly', { params: cleanParams(filters) });
  return data;
}

/**
 * Epidemiological & Disease Surveillance Report
 * GET /reports/disease
 */
export async function getDiseaseReport(filters = {}) {
  const { data } = await apiClient.get('/reports/disease', { params: cleanParams(filters) });
  return data;
}

/**
 * Pharmaceutical Inventory & Supply Chain Report
 * GET /reports/medicine
 */
export async function getMedicineReport(filters = {}) {
  const { data } = await apiClient.get('/reports/medicine', { params: cleanParams(filters) });
  return data;
}

/**
 * Demographic & Population Health Report
 * GET /reports/citizen
 */
export async function getCitizenReport(filters = {}) {
  const { data } = await apiClient.get('/reports/citizen', { params: cleanParams(filters) });
  return data;
}

/**
 * Hospital Infrastructure & Facility Report
 * GET /reports/hospital
 */
export async function getHospitalReport(filters = {}) {
  const { data } = await apiClient.get('/reports/hospital', { params: cleanParams(filters) });
  return data;
}

/**
 * Primary Health Centre (PHC) Assessment Report
 * GET /reports/phc
 */
export async function getPhcReport(filters = {}) {
  const { data } = await apiClient.get('/reports/phc', { params: cleanParams(filters) });
  return data;
}

/**
 * Public Health Outreach & Campaign Performance Report
 * GET /reports/campaign
 */
export async function getCampaignReport(filters = {}) {
  const { data } = await apiClient.get('/reports/campaign', { params: cleanParams(filters) });
  return data;
}

/**
 * Generic Report Fetcher routing by report type key
 */
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
      return getDiseaseReport(filters);
    case 'medicine':
    case 'inventory':
    case 'stock':
    case 'expiry':
    case 'sales':
      return getMedicineReport(filters);
    case 'citizen':
    case 'user':
    case 'activity':
      return getCitizenReport(filters);
    case 'hospital':
      return getHospitalReport(filters);
    case 'phc':
    case 'vaccination':
    case 'district':
      return getPhcReport(filters);
    case 'campaign':
      return getCampaignReport(filters);
    default:
      return getDailyReport(filters);
  }
}
