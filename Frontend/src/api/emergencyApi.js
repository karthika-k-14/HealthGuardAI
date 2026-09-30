import apiClient from './axios';
import { fetchNearbyBloodBanks, calculateHaversineDistance } from './locationApi';

/**
 * ============================================================================
 * HEALTHGUARD AI - PRODUCTION EMERGENCY ALERT API
 * Fully backend database-driven API connecting to /api/emergency-alerts/**
 * ============================================================================
 */

/**
 * Analyze symptoms using backend classification engine.
 */
export async function analyzeSymptomUrgency({ symptoms, diseaseCategory = '', urgencyScore = 0 }) {
  try {
    const { data } = await apiClient.post('/api/emergency-alerts/analyze', {
      symptoms,
      diseaseCategory,
      urgencyScore,
    });
    return data?.data || null;
  } catch (err) {
    console.warn('[emergencyApi] analyzeSymptomUrgency error:', err?.message || err);
    return null;
  }
}

/**
 * Automatically create an Emergency Alert in the database.
 * Routes strictly to the citizen's assigned ASHA worker from citizen_assignment.
 */
export async function createEmergencyAlert(alertPayload) {
  try {
    const userObj = JSON.parse(localStorage.getItem('user') || '{}');
    const citizenId = alertPayload.citizenId || userObj.userId || userObj.id;
    const citizenName = alertPayload.citizenName || userObj.fullName || userObj.name || 'Citizen';

    const payload = {
      citizenId,
      citizenName,
      symptoms: alertPayload.symptoms || '',
      diseaseCategory: alertPayload.diseaseCategory || 'General Emergency',
      urgencyLevel: alertPayload.urgencyLevel || 'HIGH',
      urgencyScore: alertPayload.urgencyScore || 0.75,
      village: alertPayload.village || userObj.village || '',
      district: alertPayload.district || 'Coimbatore',
      notes: alertPayload.notes || '',
    };

    const { data } = await apiClient.post('/api/emergency-alerts/create', payload);
    return data?.data || null;
  } catch (err) {
    console.error('[emergencyApi] createEmergencyAlert error:', err?.message || err);
    throw err;
  }
}

/**
 * Fetch emergency alerts assigned to a specific ASHA worker.
 */
export async function fetchAshaEmergencyAlerts(ashaId) {
  try {
    const effectiveAshaId = ashaId || JSON.parse(localStorage.getItem('user') || '{}').workerId || JSON.parse(localStorage.getItem('user') || '{}').id;
    const { data } = await apiClient.get(`/api/emergency-alerts/asha/${effectiveAshaId || 0}`);
    return Array.isArray(data?.data) ? data.data : [];
  } catch (err) {
    console.error('[emergencyApi] fetchAshaEmergencyAlerts error:', err?.message || err);
    return [];
  }
}

/**
 * Fetch emergency alerts for Health Officer monitoring feed.
 */
export async function fetchOfficerEmergencyAlerts() {
  try {
    const { data } = await apiClient.get('/api/emergency-alerts/officer');
    return Array.isArray(data?.data) ? data.data : [];
  } catch (err) {
    console.error('[emergencyApi] fetchOfficerEmergencyAlerts error:', err?.message || err);
    return [];
  }
}

/**
 * Fetch single emergency alert details with timeline.
 */
export async function fetchEmergencyAlertById(id) {
  try {
    const { data } = await apiClient.get(`/api/emergency-alerts/${id}`);
    return data?.data || null;
  } catch (err) {
    console.error('[emergencyApi] fetchEmergencyAlertById error:', err?.message || err);
    return null;
  }
}

/**
 * Update alert status (PENDING, CONTACTED, VISIT_SCHEDULED, VISITED, ESCALATED, RESOLVED).
 */
export async function updateEmergencyAlertStatus(id, { status, notes = '', performedBy = '', performedRole = '' }) {
  try {
    const userObj = JSON.parse(localStorage.getItem('user') || '{}');
    const { data } = await apiClient.put(`/api/emergency-alerts/${id}/status`, {
      status,
      notes,
      performedBy: performedBy || userObj.fullName || userObj.name || 'ASHA Worker',
      performedRole: performedRole || userObj.role || 'ASHA_WORKER',
    });
    return data?.data || null;
  } catch (err) {
    console.error('[emergencyApi] updateEmergencyAlertStatus error:', err?.message || err);
    throw err;
  }
}

/**
 * Escalate emergency alert to Health Officer.
 */
export async function escalateEmergencyAlert(id, { reason = '', performedBy = '', performedRole = '' }) {
  try {
    const userObj = JSON.parse(localStorage.getItem('user') || '{}');
    const { data } = await apiClient.put(`/api/emergency-alerts/${id}/escalate`, {
      reason,
      performedBy: performedBy || userObj.fullName || userObj.name || 'ASHA Worker',
      performedRole: performedRole || userObj.role || 'ASHA_WORKER',
    });
    return data?.data || null;
  } catch (err) {
    console.error('[emergencyApi] escalateEmergencyAlert error:', err?.message || err);
    throw err;
  }
}

/**
 * Resolve emergency alert case.
 */
export async function resolveEmergencyAlert(id, notes = '', performedBy = '') {
  try {
    const userObj = JSON.parse(localStorage.getItem('user') || '{}');
    const { data } = await apiClient.put(`/api/emergency-alerts/${id}/resolve`, null, {
      params: {
        notes,
        performedBy: performedBy || userObj.fullName || userObj.name || 'ASHA Worker',
      },
    });
    return data?.data || null;
  } catch (err) {
    console.error('[emergencyApi] resolveEmergencyAlert error:', err?.message || err);
    throw err;
  }
}

/**
 * Fetch emergency response statistics for Health Officer widgets.
 */
export async function fetchEmergencyStatistics() {
  try {
    const { data } = await apiClient.get('/api/emergency-alerts/statistics');
    return data?.data || null;
  } catch (err) {
    console.error('[emergencyApi] fetchEmergencyStatistics error:', err?.message || err);
    return null;
  }
}

/**
 * ============================================================================
 * RETAINED REAL EMERGENCY REFERENCE & LOCATION DATA
 * ============================================================================
 */

export async function fetchEmergencyServices() {
  try {
    const { data } = await apiClient.get('/api/hospitals');
    const hospitals = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : Array.isArray(data?.content) ? data.content : [];
    return hospitals.map((h) => ({
      id: h.id,
      name: h.name,
      type: h.type || 'Hospital / Emergency Center',
      phone: h.contactPhone || '108',
      district: h.district,
      source: 'DATABASE',
    }));
  } catch (err) {
    console.warn('[emergencyApi] fetchEmergencyServices failed:', err.message);
    return [];
  }
}

export async function fetchBloodBanks(lat = 11.0168, lon = 76.9558) {
  try {
    const [osmResult, dbHospitalsRes] = await Promise.all([
      fetchNearbyBloodBanks(lat, lon).catch((e) => ({ status: 'API_ERROR', bloodBanks: [], error: e.message })),
      apiClient.get('/api/hospitals').catch(() => ({ data: [] }))
    ]);

    const dbData = dbHospitalsRes?.data?.data || dbHospitalsRes?.data || [];
    const dbBloodBanks = (Array.isArray(dbData) ? dbData : [])
      .filter(h => (h.name || '').toLowerCase().includes('blood') || (h.type || '').toLowerCase().includes('blood'))
      .map((h) => {
        const hLat = h.latitude || lat;
        const hLon = h.longitude || lon;
        const dist = calculateHaversineDistance(lat, lon, hLat, hLon);
        return {
          id: `db_bb_${h.id}`,
          name: h.name,
          phone: h.contactPhone || '108',
          distanceKm: dist > 0 ? dist : (h.distanceKm || 0),
          stock: 'Available',
          source: 'DATABASE',
        };
      });

    const combinedMap = new Map();
    [...(osmResult?.bloodBanks || []), ...dbBloodBanks].forEach((bb) => {
      const key = (bb.name || '').trim().toLowerCase();
      if (key && !combinedMap.has(key)) {
        combinedMap.set(key, bb);
      }
    });

    const combinedList = Array.from(combinedMap.values()).sort((a, b) => (a.distanceKm || 0) - (b.distanceKm || 0));

    return {
      status: osmResult?.status === 'TIMEOUT' || osmResult?.status === 'API_ERROR' 
        ? (combinedList.length > 0 ? 'SUCCESS_WITH_DATA' : osmResult.status)
        : (combinedList.length > 0 ? 'SUCCESS_WITH_DATA' : 'SUCCESS_WITH_NO_DATA'),
      data: combinedList,
      error: osmResult?.error || null,
    };
  } catch (err) {
    console.error('[emergencyApi] fetchBloodBanks error:', err);
    return {
      status: 'API_ERROR',
      data: [],
      error: err.message,
    };
  }
}

export async function fetchCitizenEmergencyAlerts(citizenId = null) {
  try {
    const userObj = JSON.parse(localStorage.getItem('user') || '{}');
    const targetCitizenId = citizenId || userObj.citizenId || userObj.userId || userObj.id;
    const { data } = await apiClient.get('/api/emergency-alerts', {
      params: { citizenId: targetCitizenId }
    });
    return Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : []);
  } catch (err) {
    console.error('[emergencyApi] fetchCitizenEmergencyAlerts error:', err?.message || err);
    return [];
  }
}

export async function fetchFacilitiesHospitals(district = '') {
  try {
    const { data } = await apiClient.get('/api/facilities/hospitals', { params: district ? { district } : {} });
    return Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : []);
  } catch (err) {
    console.error('Failed to fetch hospitals:', err);
    return [];
  }
}

export async function fetchFacilitiesPHCs(district = '') {
  try {
    const { data } = await apiClient.get('/api/facilities/phcs', { params: district ? { district } : {} });
    return Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : []);
  } catch (err) {
    console.error('Failed to fetch PHCs:', err);
    return [];
  }
}

export async function fetchFacilitiesBloodBanks(district = '') {
  try {
    const { data } = await apiClient.get('/api/facilities/bloodbanks', { params: district ? { district } : {} });
    return Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : []);
  } catch (err) {
    console.error('Failed to fetch blood banks:', err);
    return [];
  }
}

