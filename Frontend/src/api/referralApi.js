import apiClient from './axios';

/**
 * Referral CRUD - calls the real Spring Boot backend (ReferralController,
 * "/admin/referrals"). Tracks a citizen being referred from one
 * facility/worker to another (e.g. ASHA -> PHC, PHC -> Hospital).
 */

export async function fetchReferrals() {
  const { data } = await apiClient.get('/admin/referrals');
  return data;
}

export async function fetchReferralById(referralId) {
  const { data } = await apiClient.get(`/admin/referrals/${referralId}`);
  return data;
}

export async function createReferral(referral) {
  const { data } = await apiClient.post('/admin/referrals', referral);
  return data;
}

export async function updateReferral(referralId, referral) {
  const { data } = await apiClient.put(`/admin/referrals/${referralId}`, referral);
  return data;
}

export async function deleteReferral(referralId) {
  await apiClient.delete(`/admin/referrals/${referralId}`);
  return { id: referralId, deleted: true };
}
