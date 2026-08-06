import apiClient from './axios';
import { mockRequest } from './mockClient';
import analyticsFixture from '../data/healthAnalytics.json';

/**
 * Dashboard Summary
 * GET /analytics/dashboard-summary
 */
export async function getDashboardSummary() {
  const { data } = await apiClient.get('/analytics/dashboard-summary');
  return data;
}

/**
 * Totals
 */
export async function getTotalCitizens() {
  const { data } = await apiClient.get('/analytics/total-citizens');
  return data;
}

export async function getTotalAshaWorkers() {
  const { data } = await apiClient.get('/analytics/total-asha-workers');
  return data;
}

export async function getTotalHealthOfficers() {
  const { data } = await apiClient.get('/analytics/total-health-officers');
  return data;
}

export async function getTotalPharmacists() {
  const { data } = await apiClient.get('/analytics/total-pharmacists');
  return data;
}

export async function getTotalHospitals() {
  const { data } = await apiClient.get('/analytics/total-hospitals');
  return data;
}

export async function getTotalPhcs() {
  const { data } = await apiClient.get('/analytics/total-phcs');
  return data;
}

export async function getTotalVillages() {
  const { data } = await apiClient.get('/analytics/total-villages');
  return data;
}

export async function getTotalMedicines() {
  const { data } = await apiClient.get('/analytics/total-medicines');
  return data;
}

export async function getTotalPrescriptions() {
  const { data } = await apiClient.get('/analytics/total-prescriptions');
  return data;
}

export async function getTotalCampaigns() {
  const { data } = await apiClient.get('/analytics/total-campaigns');
  return data;
}

export async function getTotalNotifications() {
  const { data } = await apiClient.get('/analytics/total-notifications');
  return data;
}

/**
 * Statistics
 */
export async function getCitizenStatistics() {
  const { data } = await apiClient.get('/analytics/citizen-statistics');
  return data;
}

export async function getMedicineStatistics() {
  const { data } = await apiClient.get('/analytics/medicine-statistics');
  return data;
}

export async function getDiseaseStatistics() {
  const { data } = await apiClient.get('/analytics/disease-statistics');
  return data;
}

export async function getHospitalStatistics() {
  const { data } = await apiClient.get('/analytics/hospital-statistics');
  return data;
}

export async function getCampaignStatistics() {
  const { data } = await apiClient.get('/analytics/campaign-statistics');
  return data;
}

/**
 * Reports
 */
export async function getDailyReport() {
  const { data } = await apiClient.get('/analytics/reports/daily');
  return data;
}

export async function getWeeklyReport() {
  const { data } = await apiClient.get('/analytics/reports/weekly');
  return data;
}

export async function getMonthlyReport() {
  const { data } = await apiClient.get('/analytics/reports/monthly');
  return data;
}

// Named Aliases
export const fetchDashboardSummary = getDashboardSummary;
export const fetchCitizenStatistics = getCitizenStatistics;
export const fetchMedicineStatistics = getMedicineStatistics;
export const fetchDiseaseStatistics = getDiseaseStatistics;
export const fetchHospitalStatistics = getHospitalStatistics;
export const fetchCampaignStatistics = getCampaignStatistics;
export const fetchDailyReport = getDailyReport;
export const fetchWeeklyReport = getWeeklyReport;
export const fetchMonthlyReport = getMonthlyReport;

/**
 * Citizen Health Analytics (legacy/demo helper)
 */
export async function fetchHealthAnalytics() {
  try {
    const summary = await getDashboardSummary();
    if (summary) {
      return {
        ...analyticsFixture,
        summary,
      };
    }
  } catch (e) {
    // fallback to fixture if unauthenticated or network error
  }
  return mockRequest(analyticsFixture);
}

function average(list, key) {
  return list.reduce((sum, item) => sum + item[key], 0) / list.length;
}

export async function fetchHealthReport() {
  return mockRequest(() => {
    const latestBmi = analyticsFixture.bmi[analyticsFixture.bmi.length - 1].value;
    const avgWater = average(analyticsFixture.water, 'liters');
    const avgSleep = average(analyticsFixture.sleep, 'hours');
    const avgSteps = average(analyticsFixture.steps, 'count');

    let score = 100;
    if (latestBmi < 18.5 || latestBmi > 25) score -= 10;
    if (avgWater < 2) score -= 10;
    if (avgSleep < 7) score -= 12;
    if (avgSteps < 8000) score -= 10;
    score = Math.max(40, Math.min(100, Math.round(score)));

    const suggestions = [];
    if (avgWater < 2) suggestions.push('Increase daily water intake — aim for at least 2.5 liters.');
    if (avgSleep < 7) suggestions.push('Your average sleep is below 7 hours — try an earlier wind-down routine.');
    if (avgSteps < 8000) suggestions.push('Step count is below the 8,000/day target — a short evening walk can help.');
    if (latestBmi > 25) suggestions.push('BMI is slightly above the healthy range — consider a balanced diet review.');
    if (suggestions.length === 0) suggestions.push('Great work — your recent metrics are within healthy ranges. Keep it up!');

    return {
      healthScore: score,
      bmi: latestBmi,
      avgWaterLiters: Math.round(avgWater * 10) / 10,
      avgSleepHours: Math.round(avgSleep * 10) / 10,
      avgSteps: Math.round(avgSteps),
      aiSuggestions: suggestions,
      generatedAt: new Date().toISOString(),
    };
  }, { latency: 700 });
}
