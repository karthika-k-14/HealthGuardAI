import apiClient from './axios';

/**
 * Wraps the SOS Request backend (SosRequestController: /sos/**). Talks to
 * the real backend over HTTP via the shared apiClient (Bearer token
 * attached automatically), mirroring the citizenProfileApi.js pattern.
 */

function mapSosRequest(data) {
  if (!data) return null;
  return {
    id: data.id,
    uuid: data.uuid,
    citizenId: data.citizenId,
    citizenName: data.citizenName,
    citizenPhone: data.citizenPhone,
    emergencyType: data.emergencyType,
    description: data.description,
    latitude: data.latitude,
    longitude: data.longitude,
    status: data.status,
    respondedByName: data.respondedByName,
    respondedByRole: data.respondedByRole,
    statusNote: data.statusNote,
    resolvedAt: data.resolvedAt,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
}

// ---- Create ------------------------------------------------------

export async function createSosRequest({ emergencyType, description, latitude, longitude }) {
  const { data } = await apiClient.post('/sos', {
    emergencyType,
    description: description || null,
    latitude: latitude ?? null,
    longitude: longitude ?? null,
  });
  return mapSosRequest(data);
}

// ---- View ----------------------------------------------------------

export async function fetchSosRequest(sosId) {
  const { data } = await apiClient.get(`/sos/${sosId}`);
  return mapSosRequest(data);
}

// ---- History (authenticated citizen's own SOS requests) ------------

export async function fetchSosHistory() {
  const { data } = await apiClient.get('/sos/history');
  return (data || []).map(mapSosRequest);
}

// ---- Responding-staff views ------------------------------------------

export async function fetchAllSosRequests() {
  const { data } = await apiClient.get('/sos');
  return (data || []).map(mapSosRequest);
}

export async function fetchActiveSosRequests() {
  const { data } = await apiClient.get('/sos/active');
  return (data || []).map(mapSosRequest);
}

// ---- Update status ---------------------------------------------------

export async function updateSosStatus(sosId, status, note) {
  const { data } = await apiClient.put(`/sos/${sosId}/status`, {
    status,
    note: note || null,
  });
  return mapSosRequest(data);
}
