import apiClient from './axios';

/**
 * Wraps the real Campaign backend (CampaignController: /campaigns/** for
 * reads, /admin/campaigns/** for writes). Talks to the real backend over
 * HTTP via the shared apiClient (Bearer token attached automatically),
 * mirroring the citizenProfileApi.js pattern.
 */

function mapCampaign(data) {
  if (!data) return null;
  return {
    id: data.id,
    uuid: data.uuid,
    title: data.title,
    type: data.type,
    status: (data.status || '').toLowerCase(),
    district: data.district,
    startDate: data.startDate,
    endDate: data.endDate,
    reach: data.reach ?? 0,
    progress: data.progress ?? 0,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
}

function toStatusPayload(status) {
  return status ? status.toUpperCase() : undefined;
}

// ---- List / Details --------------------------------------------------

export async function fetchCampaigns() {
  const { data } = await apiClient.get('/campaigns');
  return (data || []).map(mapCampaign);
}

export async function fetchCampaignById(id) {
  const { data } = await apiClient.get(`/campaigns/${id}`);
  return mapCampaign(data);
}

// ---- Create ------------------------------------------------------

export async function addCampaign(campaign) {
  const { data } = await apiClient.post('/admin/campaigns', {
    title: campaign.title,
    type: campaign.type || null,
    status: toStatusPayload(campaign.status) || 'DRAFT',
    district: campaign.district || null,
    startDate: campaign.startDate || null,
    endDate: campaign.endDate || null,
    reach: campaign.reach ?? 0,
    progress: campaign.progress ?? 0,
  });
  return mapCampaign(data);
}

// ---- Update (also backs publish/schedule below) -----------------------

export async function updateCampaign(id, changes = {}) {
  const current = await fetchCampaignById(id);
  const merged = { ...current, ...changes };
  const { data } = await apiClient.put(`/admin/campaigns/${id}`, {
    title: merged.title,
    type: merged.type || null,
    status: toStatusPayload(merged.status),
    district: merged.district || null,
    startDate: merged.startDate || null,
    endDate: merged.endDate || null,
    reach: merged.reach ?? 0,
    progress: merged.progress ?? 0,
  });
  return mapCampaign(data);
}

// ---- Delete ------------------------------------------------------

export async function deleteCampaign(id) {
  await apiClient.delete(`/admin/campaigns/${id}`);
  return { id, deleted: true };
}

// ---- Convenience wrappers used by AdminCampaignManagement.jsx ---------

export async function publishCampaign(id) {
  return updateCampaign(id, { status: 'active' });
}

export async function scheduleCampaign(id, startDate) {
  return updateCampaign(id, { status: 'scheduled', startDate });
}
