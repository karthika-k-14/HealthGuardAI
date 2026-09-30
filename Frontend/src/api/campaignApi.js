import apiClient from './axios';

function formatStatus(status) {
  if (!status) return 'Active';
  const s = String(status).trim().toLowerCase();
  if (s === 'scheduled') return 'Scheduled';
  if (s === 'completed') return 'Completed';
  return 'Active';
}

function mapCampaign(data) {
  if (!data) return null;
  const name = data.campaignName || data.title || 'Untitled Campaign';
  const type = data.campaignType || data.type || 'Awareness';
  const status = formatStatus(data.status);
  const progress = Number(data.progressPercentage ?? data.progress ?? 0);
  const reach = data.peopleReached ?? data.reach ?? 0;
  const village = data.villageName || data.village_name || data.village || data.district || '';

  return {
    id: data.id,
    campaignName: name,
    title: name,
    campaignType: type,
    type,
    status,
    progressPercentage: progress,
    progress,
    startDate: data.startDate || data.start_date || '',
    endDate: data.endDate || data.end_date || '',
    peopleReached: reach,
    reach,
    villageName: village,
    village,
    district: data.district || '',
    description: data.description || '',
    createdAt: data.createdAt || data.created_at,
  };
}


export async function fetchCampaigns() {
  try {
    const { data } = await apiClient.get('/api/campaigns');
    const list = data?.data || data || [];
    if (Array.isArray(list)) {
      return list.map(mapCampaign);
    }
  } catch (err) {
    console.warn('Failed to fetch from /api/campaigns, trying /api/officer/campaigns:', err?.message);
  }

  try {
    const { data } = await apiClient.get('/api/officer/campaigns');
    const list = data?.data || data || [];
    return Array.isArray(list) ? list.map(mapCampaign) : [];
  } catch (err) {
    console.error('Failed to fetch campaigns from backend:', err);
    return [];
  }
}

export async function fetchCampaignById(id) {
  const { data } = await apiClient.get(`/api/campaigns/${id}`);
  return mapCampaign(data?.data || data);
}

export async function addCampaign(campaign) {
  console.log('[campaignApi] addCampaign payload:', campaign);
  console.log('[campaignApi] villageName in payload:', campaign.villageName);
  const { data } = await apiClient.post('/api/campaigns', campaign);
  console.log('[campaignApi] addCampaign response:', data?.data || data);
  return mapCampaign(data?.data || data);
}

export async function updateCampaign(id, changes = {}) {
  const { data } = await apiClient.put(`/api/campaigns/${id}`, changes);
  return mapCampaign(data?.data || data);
}

export async function deleteCampaign(id) {
  await apiClient.delete(`/api/campaigns/${id}`);
  return { id, deleted: true };
}

export async function publishCampaign(id) {
  return updateCampaign(id, { status: 'ACTIVE' });
}

export async function scheduleCampaign(id, startDate) {
  return updateCampaign(id, { status: 'SCHEDULED', startDate });
}
