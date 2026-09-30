import apiClient from './axios';

export async function fetchAshaVisits() {
  const currentUser = JSON.parse(localStorage.getItem('hg_user') || '{}');
  const ashaWorkerId = currentUser.ashaWorkerId || currentUser.id || 10;
  const { data } = await apiClient.get('/api/asha/visits', {
    params: { ashaWorkerId },
  });
  const list = data?.data || data;
  return Array.isArray(list) ? list : [];
}

export async function scheduleHomeVisit(payload) {
  const currentUser = JSON.parse(localStorage.getItem('hg_user') || '{}');
  const reqPayload = {
    citizenId: payload.citizenId,
    familyId: payload.familyId || null,
    ashaWorkerId: currentUser.ashaWorkerId || currentUser.id || 10,
    citizenName: payload.citizenName,
    village: payload.village || 'Coimbatore Village',
    visitType: payload.visitType || 'Routine Checkup',
    visitDate: payload.visitDate || new Date().toISOString().slice(0, 10),
    notes: payload.notes || 'Scheduled home visit.',
  };

  const { data } = await apiClient.post('/api/asha/visits', reqPayload);
  return data?.data || data;
}

export async function completeHomeVisit(visitId, payload) {
  const reqPayload = {
    observations: payload.observations || 'Regular health observations recorded.',
    symptoms: payload.symptoms || 'None',
    bloodPressure: payload.bloodPressure || '',
    weight: payload.weight ? Number(payload.weight) : null,
    temperature: payload.temperature ? Number(payload.temperature) : null,
    recommendations: payload.recommendations || '',
    followUpRequired: Boolean(payload.followUpRequired),
    nextVisitDate: payload.nextVisitDate || new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
    riskLevel: payload.riskLevel || 'Low',
    notes: payload.notes || '',

    // Findings checklists (Requirement 9)
    bpChecked: Boolean(payload.bpChecked),
    immunizationVerified: Boolean(payload.immunizationVerified),
    pregnancyFollowUp: Boolean(payload.pregnancyFollowUp),
    symptomsFound: Boolean(payload.symptomsFound),
    referralRequired: Boolean(payload.referralRequired),
  };

  const { data } = await apiClient.post(`/api/asha/visits/${visitId}/complete`, reqPayload);
  return data?.data || data;
}

export async function fetchVisitStatistics() {
  const currentUser = JSON.parse(localStorage.getItem('hg_user') || '{}');
  const ashaWorkerId = currentUser.ashaWorkerId || currentUser.id || 10;
  const { data } = await apiClient.get('/api/asha/visits/statistics', {
    params: { ashaWorkerId },
  });
  const stats = data?.data || data;
  return stats || {
    totalVisits: 0,
    scheduledVisits: 0,
    completedVisits: 0,
    missedVisits: 0,
  };
}

export async function fetchOfficerVisitReports() {
  const { data } = await apiClient.get('/api/officer/visits');
  const list = data?.data || data;
  return Array.isArray(list) ? list : [];
}

