import apiClient from './axios';

/**
 * AI Symptom Assessment API
 * Connects directly to backend /api/ai/symptoms endpoint.
 */
export async function assessSymptoms({ userId = null, symptoms = [] }) {
  const symptomsText = Array.isArray(symptoms) ? symptoms.join(', ') : symptoms;
  if (!symptomsText || !symptomsText.trim()) {
    return null;
  }

  const currentUserId = userId || JSON.parse(localStorage.getItem('user') || '{}').userId || JSON.parse(localStorage.getItem('user') || '{}').id;

  try {
    const payload = {
      userId: currentUserId,
      symptoms: symptomsText
    };

    const response = await apiClient.post('/api/ai/symptoms', payload);
    if (response?.data?.data) {
      return response.data.data;
    }
  } catch (err) {
    console.warn('Backend /api/ai/symptoms call failed:', err?.message || err);
  }
  return null;
}

export async function fetchSymptomHistory(userId = null, requesterUserId = null, page = null, size = 20) {
  try {
    const params = {};

    if (requesterUserId) params.requesterUserId = requesterUserId;
    if (page !== null) {
      params.page = page;
      params.size = size;
    }
    const response = await apiClient.get(`/api/ai/symptoms/${userId}`, { params });
    return response?.data?.data || [];
  } catch (err) {
    console.error('Failed to fetch symptom history:', err);
    return [];
  }
}

export async function deleteSymptomAssessment(id, requesterUserId = null) {
  try {
    const params = requesterUserId ? { requesterUserId } : {};
    const response = await apiClient.delete(`/api/ai/symptoms/${id}`, { params });
    return response?.data?.success || true;
  } catch (err) {
    console.error('Failed to delete symptom assessment:', err);
    throw err;
  }
}

export async function searchSymptomAssessments(keyword, page = 0, size = 20) {
  try {
    const response = await apiClient.get('/api/ai/symptoms/search', {
      params: { keyword, page, size }
    });
    return response?.data?.data || { content: [], totalPages: 1 };
  } catch (err) {
    console.error('Failed to search symptom assessments:', err);
    return { content: [], totalPages: 1 };
  }
}

