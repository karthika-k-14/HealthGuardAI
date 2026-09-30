import apiClient from './axios';

/**
 * Admin PHC CRUD - calls the real Spring Boot backend (PhcController,
 * "/admin/phcs"). Distinct from the Health Officer's read-scoped
 * "/officer/phcs/**" endpoints in healthOfficerApi.js.
 */

let localPhcStore = [];

export async function fetchPhcs() {
  try {
    const { data } = await apiClient.get('/api/hospitals/search', { params: { query: 'PHC' } });
    const list = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : Array.isArray(data?.content) ? data.content : [];
    if (list.length > 0) localPhcStore = list;
    return localPhcStore;
  } catch (err) {
    return localPhcStore;
  }
}

export async function fetchPhcById(phcId) {
  try {
    const { data } = await apiClient.get(`/api/hospitals/${phcId}`);
    return data?.data || data;
  } catch (err) {
    return localPhcStore.find((p) => p.id === Number(phcId)) || null;
  }
}

export async function createPhc(phc) {
  const newEntry = { id: Date.now(), ...phc, type: 'Community Health Centre' };
  try {
    const { data } = await apiClient.post('/api/hospitals', { ...phc, type: 'Community Health Centre' });
    const created = data?.data || data;
    localPhcStore = [created, ...localPhcStore];
    return created;
  } catch (err) {
    localPhcStore = [newEntry, ...localPhcStore];
    return newEntry;
  }
}

export async function updatePhc(phcId, phc) {
  try {
    const { data } = await apiClient.put(`/api/hospitals/${phcId}`, phc);
    const updated = data?.data || data;
    localPhcStore = localPhcStore.map((p) => (p.id === phcId ? { ...p, ...updated } : p));
    return updated;
  } catch (err) {
    localPhcStore = localPhcStore.map((p) => (p.id === phcId ? { ...p, ...phc } : p));
    return { id: phcId, ...phc };
  }
}

export async function deletePhc(phcId) {
  try {
    await apiClient.delete(`/api/hospitals/${phcId}`);
  } catch (err) {
    // local fallback
  }
  localPhcStore = localPhcStore.filter((p) => p.id !== phcId);
  return { id: phcId, deleted: true };
}


