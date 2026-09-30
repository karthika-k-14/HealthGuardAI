import apiClient from './axios';

// --- Dashboard overview & Records ------------------------------------

export async function fetchCitizenHealthSummary() {
  try {
    const { data } = await apiClient.get('/api/citizens');
    const citizens = data?.data || data || [];
    return {
      totalRecords: citizens.length,
      healthStatus: 'Good',
    };
  } catch (err) {
    return { totalRecords: 0, healthStatus: 'Good' };
  }
}

export async function fetchAwarenessFeed() {
  try {
    const { data } = await apiClient.get('/api/articles');
    return data?.data || data || [];
  } catch (err) {
    return [];
  }
}

export async function fetchHealthTips() {
  return [
    { id: '1', title: 'Stay Hydrated', description: 'Drink at least 2.5L of water daily.' },
    { id: '2', title: 'Regular Walking', description: 'Take a 30-minute daily walk for cardiovascular health.' },
  ];
}

export async function fetchRecentActivity() {
  try {
    const user = JSON.parse(localStorage.getItem('hg_user') || '{}');
    const userId = user.id;
    if (!userId) return [];
    const { data } = await apiClient.get(`/api/notifications/user/${userId}`);
    const notifs = Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : []);
    return notifs.slice(0, 5).map((n) => ({
      id: n.id || `notif_${Math.random()}`,
      title: n.title || n.message || 'HealthGuard Notification',
      timestamp: n.createdAt || new Date().toISOString(),
      type: (n.type || 'healthscore').toLowerCase(),
    }));
  } catch (err) {
    return [];
  }
}

export async function fetchWellnessTip() {
  return { id: 'w1', title: 'Daily Wellness', tip: 'Maintain a consistent sleep routine of 7-8 hours per night.' };
}

import { assessSymptoms } from './symptomApi';

export async function runSymptomCheck({ symptoms = [], age, gender }) {
  try {
    const user = JSON.parse(localStorage.getItem('hg_user') || '{}');
    const userId = user.id;
    const result = await assessSymptoms({ userId, symptoms });
    if (!result) return null;

    return {
      possibleDiseases: [{ name: result.prediction, likelihood: 100 }],
      diseaseCategory: 'General Clinical Assessment',
      riskLevel: result.riskLevel || 'MODERATE',
      homeCareTips: [result.recommendation],
      recommendedDoctor: 'Healthcare Professional',
      emergencyWarning: (result.riskLevel === 'HIGH' || result.riskLevel === 'EMERGENCY' || result.riskLevel === 'CRITICAL')
        ? 'Seek immediate medical attention if symptoms worsen rapidly.'
        : null,
      inputSummary: { symptoms, age, gender },
    };
  } catch (err) {
    return null;
  }
}

export async function computeHealthScore() { return { score: 85, risk: 'Low', bmi: 22.5, suggestions: [] }; }
export async function fetchDailyChallenge() { return { title: '10k Steps', completed: false }; }
export async function fetchMoodData() { return { options: [], history: [] }; }
export async function logMood() { return { success: true }; }
export async function fetchWaterIntake() { return { current: 2.0, target: 2.5, unit: 'L' }; }
export async function logWaterIntake() { return { success: true }; }
export async function fetchStepCount() { return { current: 6500, target: 8000 }; }
export async function fetchNutritionTip() { return 'Include green leafy vegetables in your lunch.'; }
export async function fetchBadges() { return []; }
export async function fetchWeeklyReport() { return { summary: 'Weekly health report generated.', highlights: [] }; }
export async function fetchHealthCalendar() { return []; }
export async function fetchHealthStreak() { return { currentStreak: 7 }; }
