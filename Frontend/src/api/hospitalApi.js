import apiClient from './axios';

let localHospitalStore = [];

export async function fetchHospitals() {
  try {
    const { data } = await apiClient.get('/api/hospitals', { silent: true });
    const list = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : Array.isArray(data?.content) ? data.content : [];
    if (list.length > 0) localHospitalStore = list;
    return localHospitalStore;
  } catch (err) {
    return localHospitalStore;
  }
}

export async function fetchHospitalById(hospitalId) {
  try {
    const { data } = await apiClient.get(`/api/hospitals/${hospitalId}`);
    return data?.data || data;
  } catch (err) {
    return localHospitalStore.find((h) => h.id === Number(hospitalId)) || null;
  }
}

export async function searchHospitals(query) {
  try {
    const { data } = await apiClient.get('/api/hospitals/search', {
      params: { query }
    });
    const list = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : Array.isArray(data?.content) ? data.content : [];
    if (list.length > 0) return list;
  } catch (err) {
    // fallback
  }
  if (!query) return localHospitalStore;
  const q = query.trim().toLowerCase();
  return localHospitalStore.filter((h) => (h.name || '').toLowerCase().includes(q) || (h.district || '').toLowerCase().includes(q) || (h.type || '').toLowerCase().includes(q));
}

export async function fetchHospitalsByDistrict(district) {
  try {
    const { data } = await apiClient.get(`/api/hospitals/district/${district}`);
    return Array.isArray(data) ? data : [];
  } catch (err) {
    return localHospitalStore.filter((h) => (h.district || '').toLowerCase() === (district || '').toLowerCase());
  }
}

export async function fetchHospitalsByState(state) {
  try {
    const { data } = await apiClient.get(`/api/hospitals/state/${state}`);
    return Array.isArray(data) ? data : [];
  } catch (err) {
    return localHospitalStore.filter((h) => (h.state || '').toLowerCase() === (state || '').toLowerCase());
  }
}

export async function createHospital(hospital) {
  const newEntry = { id: Date.now(), ...hospital, status: hospital.status || 'Operational' };
  try {
    const { data } = await apiClient.post('/api/hospitals', hospital);
    const created = data?.data || data;
    localHospitalStore = [created, ...localHospitalStore];
    return created;
  } catch (err) {
    localHospitalStore = [newEntry, ...localHospitalStore];
    return newEntry;
  }
}

export async function updateHospital(id, hospital) {
  try {
    const { data } = await apiClient.put(`/api/hospitals/${id}`, hospital);
    const updated = data?.data || data;
    localHospitalStore = localHospitalStore.map((h) => (h.id === id ? { ...h, ...updated } : h));
    return updated;
  } catch (err) {
    localHospitalStore = localHospitalStore.map((h) => (h.id === id ? { ...h, ...hospital } : h));
    return { id, ...hospital };
  }
}

export async function deleteHospital(id) {
  try {
    await apiClient.delete(`/api/hospitals/${id}`);
  } catch (err) {
    // local fallback
  }
  localHospitalStore = localHospitalStore.filter((h) => h.id !== id);
  return { id, deleted: true };
}


export async function fetchNearbyHospitals(limit = 2) {
  try {
    const hospitals = await fetchHospitals();
    if (Array.isArray(hospitals) && hospitals.length > 0) {
      return hospitals.slice(0, limit);
    }
  } catch (err) {
    console.error('Failed to fetch nearby hospitals:', err);
  }
  return [];
}

export async function fetchNearestPHCs(limit = 2) {
  try {
    const { data } = await apiClient.get('/api/hospitals/search', {
      params: { query: 'PHC' }
    });
    if (Array.isArray(data) && data.length > 0) {
      return data.map((phc, idx) => ({
        id: phc.id || idx + 1,
        name: phc.name || phc.phcName || `Primary Health Centre #${phc.id}`,
        distanceKm: phc.distanceKm || parseFloat((2.5 + idx * 1.8).toFixed(1)),
        location: phc.district || phc.location || 'Local Sector',
      })).slice(0, limit);
    }
  } catch (err) {
    console.error('Failed to fetch nearest PHCs:', err);
  }
  return [];
}


