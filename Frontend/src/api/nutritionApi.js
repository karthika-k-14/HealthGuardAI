import apiClient from './axios';

/**
 * AI Nutrition Planner API
 * Connected to condition-aware Clinical Nutrition Engine:
 * Generates visibly distinct meal plans for:
 * - Fever (Hydration, ORS, Soups, Vitamin C)
 * - Diabetes (Low GI foods, High Fiber, Sugar Restriction)
 * - Hypertension (DASH Diet, Low Sodium, Potassium Rich Foods)
 * - Anemia (Iron Rich Foods, Vitamin C Pairing)
 * - Malnutrition (High Calorie, High Protein, Recovery Diet)
 */

export async function generateNutritionPlan({
  userId = null,
  citizenId = null,
  condition = '',
  disease = '',
  symptoms = [],
  riskLevel = 'LOW',
  possibleConditions = [],
  age = null,
  gender = null,
  height = null,
  weight = null,
  allergies = null,
  medicalHistory = null,
  healthProfile = '',
  language = 'en'
}) {
  const normalizedRisk = (riskLevel || 'LOW').toUpperCase();
  const userObj = JSON.parse(localStorage.getItem('user') || '{}');
  const targetCitizenId = citizenId || userId || userObj.citizenId || userObj.userId || userObj.id || 1;

  const targetCondition = condition || disease || (possibleConditions && possibleConditions[0]) || '';

  const payload = {
    userId: targetCitizenId,
    citizenId: targetCitizenId,
    condition: targetCondition,
    disease: targetCondition,
    symptoms: Array.isArray(symptoms) ? symptoms : [symptoms].filter(Boolean),
    riskLevel: normalizedRisk,
    age: age ? Number(age) : null,
    gender,
    height: height ? Number(height) : null,
    weight: weight ? Number(weight) : null,
    allergies: Array.isArray(allergies) ? allergies.join(', ') : allergies,
    medicalHistory: Array.isArray(medicalHistory) ? medicalHistory.join(', ') : medicalHistory,
    healthProfile,
    language
  };

  try {
    const response = await apiClient.post('/api/nutrition/generate', payload);
    if (response?.data?.data) {
      return response.data.data;
    }
  } catch (err) {
    console.warn('/api/nutrition/generate call failed, trying /api/ai/nutrition/generate:', err?.message || err);
    try {
      const response = await apiClient.post('/api/ai/nutrition/generate', payload);
      if (response?.data?.data) return response.data.data;
    } catch (fallbackErr) {
      console.error('All nutrition endpoints failed:', fallbackErr);
      throw fallbackErr;
    }
  }

  return null;
}

export async function fetchNutritionHistory(userId = null, requesterUserId = null, page = null, size = 20) {
  try {
    const userObj = JSON.parse(localStorage.getItem('user') || '{}');
    const targetUserId = userId || userObj.citizenId || userObj.userId || userObj.id || 1;
    const params = {};
    if (requesterUserId) params.requesterUserId = requesterUserId;
    if (page !== null) { params.page = page; params.size = size; }
    const response = await apiClient.get(`/api/ai/nutrition/history/${targetUserId}`, { params });
    if (response?.data?.data) {
      return response.data.data;
    }
  } catch (err) {
    console.warn('Backend /api/ai/nutrition/history call failed:', err?.message || err);
  }
  return [];
}

export async function fetchLatestNutritionPlan(userId = null, requesterUserId = null) {
  try {
    const userObj = JSON.parse(localStorage.getItem('user') || '{}');
    const targetUserId = userId || userObj.citizenId || userObj.userId || userObj.id || 1;
    const params = requesterUserId ? { requesterUserId } : {};
    const response = await apiClient.get(`/api/ai/nutrition/latest/${targetUserId}`, { params });
    if (response?.data?.data) {
      return response.data.data;
    }
  } catch (err) {
    console.warn('Backend /api/ai/nutrition/latest call failed:', err?.message || err);
  }
  return null;
}

export async function deleteNutritionPlan(id, requesterUserId = null) {
  try {
    const params = requesterUserId ? { requesterUserId } : {};
    const response = await apiClient.delete(`/api/ai/nutrition/${id}`, { params });
    return response?.data?.success || true;
  } catch (err) {
    console.error('Failed to delete nutrition plan:', err);
    throw err;
  }
}
