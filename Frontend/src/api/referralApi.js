import apiClient from './axios';

/**
 * Health Officer PHC Referral Verification & Workflow API
 * Completely owned by Health Officer module.
 */

export async function fetchReferrals(params = {}) {
  try {
    const { data } = await apiClient.get('/api/officer/referrals', { params });
    return data?.data || data || [];
  } catch (error) {
    console.error('Error fetching officer referrals:', error);
    throw error;
  }
}

export async function fetchReferralById(id) {
  try {
    const { data } = await apiClient.get(`/api/officer/referrals/${id}`);
    return data?.data || data;
  } catch (error) {
    console.error(`Error fetching referral #${id}:`, error);
    throw error;
  }
}

export async function approveReferral(id, data = {}) {
  try {
    const payload = typeof data === 'string' ? { remarks: data } : data;
    const response = await apiClient.put(`/api/officer/referrals/${id}/approve`, payload);
    return response?.data?.data || response?.data;
  } catch (error) {
    console.error(`Error approving referral #${id}:`, error);
    throw error;
  }
}

export async function rejectReferral(id, data = {}) {
  try {
    const payload = typeof data === 'string' ? { remarks: data } : data;
    const response = await apiClient.put(`/api/officer/referrals/${id}/reject`, payload);
    return response?.data?.data || response?.data;
  } catch (error) {
    console.error(`Error rejecting referral #${id}:`, error);
    throw error;
  }
}

export async function setReferralUnderReview(id, data = {}) {
  try {
    const payload = typeof data === 'string' ? { remarks: data } : data;
    const response = await apiClient.put(`/api/officer/referrals/${id}/review`, payload);
    return response?.data?.data || response?.data;
  } catch (error) {
    console.error(`Error setting referral #${id} under review:`, error);
    throw error;
  }
}

export async function fetchReferralStatistics() {
  try {
    const { data } = await apiClient.get('/api/officer/referrals/statistics');
    return data?.data || data;
  } catch (error) {
    console.error('Error fetching referral statistics:', error);
    throw error;
  }
}
