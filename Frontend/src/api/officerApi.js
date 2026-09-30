import apiClient from './axios';
import { sendChatMessage } from './chatbotApi';

// ---- Dashboard & Overview -----------------------------------------

export async function fetchDistrictOverview() {
  try {
    const { data } = await apiClient.get('/api/officer/dashboard');
    const res = data?.data || data || {};
    return {
      totalPopulation: res.totalRegisteredCitizensInDistrict ?? 0,
      activeCases: res.pendingCases ?? 0,
      recoveredCases: res.todaysReportsCount ?? 0,
      ashaWorkers: res.totalAshaWorkersInDistrict ?? 0,
      highRiskAreas: res.highRiskPatientsCount ?? 0,
    };
  } catch {
    return {
      totalPopulation: 0,
      activeCases: 0,
      recoveredCases: 0,
      ashaWorkers: 0,
      highRiskAreas: 0,
    };
  }
}

export async function fetchTodaysAlerts() {
  try {
    const { data } = await apiClient.get('/api/surveillance/statistics');
    const stats = data?.data || data || {};
    const alerts = stats.outbreakAlerts || [];
    return alerts.map((a) => ({
      id: a.alertId || a.id,
      label: a.message || `${a.disease} outbreak in ${a.village}`,
      severity: a.severity || 'High',
    }));
  } catch {
    return [];
  }
}

export async function fetchRecentActivities() {
  try {
    const { data } = await apiClient.get('/api/officer/surveillance/reports');
    const reports = data?.data || data || [];
    return reports.slice(0, 5).map((r) => ({
      id: r.reportId || r.id,
      label: `Report for ${r.citizenName || 'Citizen'} (${r.disease || 'General'}) - Status: ${r.status || 'Reported'}`,
      date: r.reportDate || r.createdAt,
    }));
  } catch {
    return [];
  }
}

// ---- Surveillance & Analytics -------------------------------------

export async function fetchDistrictSurveillance() {
  try {
    const { data } = await apiClient.get('/api/surveillance/statistics');
    return data?.data || data || {};
  } catch {
    return {};
  }
}

export async function fetchDistrictAnalytics() {
  return fetchDistrictOverview();
}

export async function fetchDiseaseMonitoring() {
  try {
    const { data } = await apiClient.get('/api/surveillance/reports');
    const reports = data?.data || data || [];
    const grouped = {};
    reports.forEach((r) => {
      const d = r.disease || 'Other';
      grouped[d] = (grouped[d] || 0) + 1;
    });
    return Object.entries(grouped).map(([name, count]) => ({
      name,
      activeCases: count,
      trend: 'Active',
    }));
  } catch {
    return [];
  }
}

// fetchHealthMapData is now replaced by forecastingApi.getOfficerHealthMap()
// which calls GET /api/ai/health/officer/health-map on the ML service directly.
// Kept as an empty stub for backwards-compatibility only.
export async function fetchHealthMapData() {
  return { zones: [], facilities: [] };
}

export async function fetchReferralMonitoring() {
  try {
    const { data } = await apiClient.get('/api/officer/visits');
    const visits = data?.data || data || [];
    return visits
      .filter((v) => v.referralRequired || v.visitType?.toLowerCase().includes('referral') || v.riskLevel === 'High' || v.riskLevel === 'Critical')
      .map((v) => ({
        id: v.visitId || v.id,
        citizenName: v.citizenName,
        village: v.village,
        visitType: v.visitType,
        status: v.status,
        riskLevel: v.riskLevel,
      }));
  } catch {
    return [];
  }
}

export async function fetchVaccinationMonitor() {
  try {
    const { data } = await apiClient.get('/api/officer/dashboard');
    const res = data?.data || data || {};
    return {
      coverage: res.vaccinationCoverage ?? 0,
      missedVaccinations: res.missedVaccinations ?? 0,
      populationByAgeGroup: res.populationByAgeGroup || [],
      upcomingDrives: res.upcomingDrives || [],
    };
  } catch {
    return {
      coverage: 0,
      missedVaccinations: 0,
      populationByAgeGroup: [],
      upcomingDrives: [],
    };
  }
}

export async function fetchEmergencyCenter() {
  try {
    const { data } = await apiClient.get('/api/surveillance/statistics');
    const stats = data?.data || data || {};
    return {
      outbreakAlerts: stats.outbreakAlerts || [],
      ambulanceRequests: stats.ambulanceRequests || [],
      medicineShortages: stats.medicineShortages || [],
      disasterAlerts: stats.disasterAlerts || [],
    };
  } catch {
    return {
      outbreakAlerts: [],
      ambulanceRequests: [],
      medicineShortages: [],
      disasterAlerts: [],
    };
  }
}


export async function fetchOfficerProfile() {
  try {
    const { data } = await apiClient.get('/api/auth/profile');
    return data?.data || data || {};
  } catch {
    return {};
  }
}

export async function sendHealthInsightQuery(params) {
  return sendChatMessage(params);
}

export async function fetchEmergencyPrediction() {
  try {
    const { data } = await apiClient.get('/api/surveillance/statistics');
    const stats = data?.data || data || {};
    const criticalCount = stats.highCriticalCases || 0;
    const likelihood = Math.min(100, criticalCount * 15);
    return {
      likelihoodPercent: likelihood,
      riskLevel: likelihood > 60 ? 'High' : likelihood > 30 ? 'Medium' : 'Low',
      window: 'Next 48 hours',
      recommendation: likelihood > 50 ? 'Urgent surveillance & bed allocation required.' : 'Continue routine surveillance monitoring.',
      factors: [
        { label: 'Critical Cases', value: criticalCount.toString() },
        { label: 'Active Outbreaks', value: (stats.activeOutbreaks || 0).toString() },
      ],
    };
  } catch {
    return {
      likelihoodPercent: 0,
      riskLevel: 'Low',
      window: 'Next 48 hours',
      recommendation: 'Surveillance system active.',
      factors: [],
    };
  }
}

export async function fetchAIPipelineAnalytics() {
  try {
    const { data } = await apiClient.get('/api/surveillance/statistics');
    const stats = data?.data || data || {};
    return {
      totalAICases: stats.totalReports || 0,
      diseaseCategoryBreakdown: stats.diseaseCategoryBreakdown || [],
      wardTrends: stats.wardTrends || [],
      urgencyDistribution: stats.urgencyDistribution || [
        { level: 'High', count: stats.highCriticalCases || 0 },
        { level: 'Low', count: Math.max(0, (stats.totalReports || 0) - (stats.highCriticalCases || 0)) },
      ],
      escalationAnalytics: stats.escalationAnalytics || {
        criticalEscalations: stats.highCriticalCases || 0,
        highEscalations: stats.highCriticalCases || 0,
        criticalEscalationRate: stats.totalReports ? Math.round(((stats.highCriticalCases || 0) / stats.totalReports) * 100) : 0,
      },
    };
  } catch {
    return {
      totalAICases: 0,
      diseaseCategoryBreakdown: [],
      wardTrends: [],
      urgencyDistribution: [],
      escalationAnalytics: { criticalEscalations: 0, highEscalations: 0, criticalEscalationRate: 0 },
    };
  }
}

export async function fetchDistrictHealthScore() { return { score: 0, breakdown: [] }; }
export async function fetchEmergencyResponseTimeline() { return []; }
export async function fetchAIDecisionSupport() { return []; }

export async function fetchMedicineDemandPrediction() {
  try {
    const { data } = await apiClient.get('/api/officer/medicine-demand');
    return data?.data || data || [];
  } catch {
    return [];
  }
}


export async function fetchOutbreakPrediction() {
  try {
    const { data } = await apiClient.get('/api/officer/outbreak-predictions');
    const list = data?.data || data || [];
    if (Array.isArray(list) && list.length > 0) return list;

    const alt = await apiClient.get('/api/officer/outbreak-prediction');
    return alt?.data?.data || alt?.data || [];
  } catch {
    try {
      const alt = await apiClient.get('/api/officer/outbreak-prediction');
      return alt?.data?.data || alt?.data || [];
    } catch {
      return [];
    }
  }
}

export async function fetchModelMetrics() {
  try {
    const { data } = await apiClient.get('/api/officer/model-metrics');
    return data?.data || data || [];
  } catch {
    return [];
  }
}

export async function fetchShapExplanation(medicineId) {
  try {
    const { data } = await apiClient.get(`/api/pharmacist/forecast/explanation/${medicineId}`);
    return data?.data || data || null;
  } catch {
    return null;
  }
}

export async function fetchOfficerAnomalies() {
  try {
    const { data } = await apiClient.get('/api/officer/anomalies');
    return data?.data || data || [];
  } catch {
    return [];
  }
}

export async function fetchCampaignSuccessAnalytics() {
  try {
    const { data } = await apiClient.get('/api/officer/campaign-analytics');
    return data?.data || data || [];
  } catch {
    return [];
  }
}

// ---- Health Officer Referral Management & Verification APIS ----
export {
  fetchReferrals,
  fetchReferralById,
  approveReferral,
  rejectReferral,
  setReferralUnderReview,
  fetchReferralStatistics
} from './referralApi';

