import apiClient from './axios';

export async function fetchVillageAnalytics() {
  try {
    const { data } = await apiClient.get('/api/surveillance/statistics');
    const stats = data?.data || data || {};
    const vCases = stats.villageCases || {};

    const villages = Object.entries(vCases).map(([name, count]) => ({
      name,
      riskLevel: count >= 5 ? 'High' : count >= 2 ? 'Medium' : 'Low',
      totalAssessments: count,
      highRiskCases: count >= 3 ? Math.floor(count / 2) : 0,
      criticalCases: count >= 5 ? 1 : 0,
      topDisease: stats.diseaseTrends ? Object.keys(stats.diseaseTrends)[0] || 'General' : 'General',
    }));

    return {
      district: stats.district || '',
      state: stats.state || '',
      villages,
    };
  } catch {
    return {
      district: '',
      state: '',
      villages: [],
    };
  }
}

export async function fetchVillageList() {
  const analytics = await fetchVillageAnalytics();
  return analytics.villages.map((v) => v.name);
}
