import apiClient from './axios';

/**
 * Wraps the real Medicine backend (MedicineController / /medicines/**).
 * Talks to the real backend over HTTP via the shared apiClient (Bearer token attached automatically),
 * mirroring the campaignApi.js and awarenessApi.js pattern.
 */

function mapMedicine(data) {
  if (!data) return null;

  let sideEffects = data.sideEffects || [];
  if (typeof sideEffects === 'string') {
    sideEffects = sideEffects.split(',').map((s) => s.trim()).filter(Boolean);
  }

  let warnings = data.warnings || [];
  if (typeof warnings === 'string') {
    warnings = warnings.split(',').map((w) => w.trim()).filter(Boolean);
  }

  let alternatives = data.alternatives || [];
  if (typeof alternatives === 'string') {
    alternatives = alternatives.split(',').map((a) => a.trim()).filter(Boolean);
  }

  const availability = data.availability || data.stockStatus || 'IN_STOCK';

  return {
    id: data.id,
    uuid: data.uuid,
    name: data.name || '',
    category: data.category || '',
    uses: data.uses || data.description || '',
    dosage: data.dosage || '',
    sideEffects: sideEffects.length > 0 ? sideEffects : ['No major side effects reported'],
    warnings: warnings.length > 0 ? warnings : ['Use as directed by a healthcare professional'],
    alternatives: alternatives,
    storageInstructions: data.storageInstructions || 'Store in a cool, dry place.',
    manufacturer: data.manufacturer || '',
    batchNumber: data.batchNumber || '',
    quantity: data.quantity ?? 0,
    unit: data.unit || 'tablets',
    price: data.price ?? 0,
    expiryDate: data.expiryDate || '',
    availability: availability,
    stockStatus:
      data.stockStatus ||
      (availability === 'IN_STOCK'
        ? 'In Stock'
        : availability === 'LOW_STOCK'
        ? 'Low Stock'
        : availability === 'EXPIRED'
        ? 'Expired'
        : 'Out of Stock'),
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
}

// ---- List / Details --------------------------------------------------

export async function fetchMedicines(params = {}) {
  const options = typeof params === 'string' ? { search: params } : params || {};
  const queryParams = {};

  if (options.search) queryParams.search = options.search;
  if (options.category && options.category !== 'All') queryParams.category = options.category;
  if (options.availability && options.availability !== 'All') queryParams.availability = options.availability;
  if (options.stockStatus && options.stockStatus !== 'All') queryParams.stockStatus = options.stockStatus;
  if (options.expiry && options.expiry !== 'All') queryParams.expiry = options.expiry;

  let list = [];
  try {
    const { data } = await apiClient.get('/medicines', { params: queryParams });
    const res = data?.data || data;
    if (Array.isArray(res)) {
      list = res.map(mapMedicine);
    }
  } catch (err) {
    try {
      const { data } = await apiClient.get('/pharmacist/medicines', { params: queryParams });
      const res = data?.data || data;
      if (Array.isArray(res)) {
        list = res.map(mapMedicine);
      }
    } catch (e) {
      // Return empty list if both requests fail
    }
  }

  return list;
}

export async function getMedicines(params) {
  return fetchMedicines(params);
}

export async function fetchMedicineById(id) {
  try {
    const { data } = await apiClient.get(`/medicines/${id}`);
    return mapMedicine(data);
  } catch (err) {
    try {
      const { data } = await apiClient.get(`/pharmacist/medicines/${id}`);
      return mapMedicine(data);
    } catch (e) {
      throw err;
    }
  }
}

export async function fetchMedicineDetails(id) {
  return fetchMedicineById(id);
}

export async function getMedicineById(id) {
  return fetchMedicineById(id);
}

// ---- Search & Filters -----------------------------------------------

export async function searchMedicines(query, filters = {}) {
  const search = typeof query === 'string' ? query : query?.search || query?.query || '';
  try {
    const { data } = await apiClient.get('/medicines/search', {
      params: { query: search, search, ...filters },
    });
    return (data || []).map(mapMedicine);
  } catch (err) {
    return fetchMedicines({ search, ...filters });
  }
}

export async function filterMedicinesByCategory(category) {
  return fetchMedicines({ category });
}

export async function filterMedicinesByAvailability(availability) {
  return fetchMedicines({ availability });
}

export async function filterMedicinesByExpiry(expiry) {
  return fetchMedicines({ expiry });
}

export async function fetchExpiringMedicines() {
  try {
    const { data } = await apiClient.get('/medicines/expiring');
    return (data || []).map(mapMedicine);
  } catch (err) {
    return fetchMedicines({ expiry: 'expiring' });
  }
}

export async function fetchMedicineCategories() {
  try {
    const { data } = await apiClient.get('/medicines/categories');
    return ['All', ...(data || [])];
  } catch (err) {
    try {
      const list = await fetchMedicines();
      return ['All', ...new Set(list.map((m) => m.category).filter(Boolean))];
    } catch (e) {
      return [
        'All',
        'Pain relief / Fever',
        'Anti-inflammatory / Pain relief',
        'Rehydration',
        'Antibiotic',
        'Antihistamine',
      ];
    }
  }
}

// ---- Add / Edit / Delete ---------------------------------------------

export async function addMedicine(medicine) {
  const payload = {
    name: medicine.name,
    category: medicine.category || null,
    uses: medicine.uses || medicine.description || null,
    dosage: medicine.dosage || null,
    sideEffects: Array.isArray(medicine.sideEffects) ? medicine.sideEffects.join(', ') : medicine.sideEffects || null,
    warnings: Array.isArray(medicine.warnings) ? medicine.warnings.join(', ') : medicine.warnings || null,
    alternatives: Array.isArray(medicine.alternatives) ? medicine.alternatives.join(', ') : medicine.alternatives || null,
    storageInstructions: medicine.storageInstructions || null,
    manufacturer: medicine.manufacturer || null,
    batchNumber: medicine.batchNumber || null,
    quantity: medicine.quantity ?? 0,
    unit: medicine.unit || 'tablets',
    price: medicine.price ?? 0,
    expiryDate: medicine.expiryDate || null,
    availability: medicine.availability || medicine.stockStatus || 'IN_STOCK',
  };

  try {
    const { data } = await apiClient.post('/medicines', payload);
    return mapMedicine(data);
  } catch (err) {
    try {
      const { data } = await apiClient.post('/admin/medicines', payload);
      return mapMedicine(data);
    } catch (e) {
      const { data } = await apiClient.post('/pharmacist/medicines', payload);
      return mapMedicine(data);
    }
  }
}

export async function createMedicine(medicine) {
  return addMedicine(medicine);
}

export async function updateMedicine(id, changes = {}) {
  const payload = {
    name: changes.name,
    category: changes.category,
    uses: changes.uses || changes.description,
    dosage: changes.dosage,
    sideEffects: Array.isArray(changes.sideEffects) ? changes.sideEffects.join(', ') : changes.sideEffects,
    warnings: Array.isArray(changes.warnings) ? changes.warnings.join(', ') : changes.warnings,
    alternatives: Array.isArray(changes.alternatives) ? changes.alternatives.join(', ') : changes.alternatives,
    storageInstructions: changes.storageInstructions,
    manufacturer: changes.manufacturer,
    batchNumber: changes.batchNumber,
    quantity: changes.quantity,
    unit: changes.unit,
    price: changes.price,
    expiryDate: changes.expiryDate,
    availability: changes.availability || changes.stockStatus,
  };

  try {
    const { data } = await apiClient.put(`/medicines/${id}`, payload);
    return mapMedicine(data);
  } catch (err) {
    try {
      const { data } = await apiClient.put(`/admin/medicines/${id}`, payload);
      return mapMedicine(data);
    } catch (e) {
      const { data } = await apiClient.put(`/pharmacist/medicines/${id}`, payload);
      return mapMedicine(data);
    }
  }
}

export async function editMedicine(id, changes) {
  return updateMedicine(id, changes);
}

export async function deleteMedicine(id) {
  try {
    await apiClient.delete(`/medicines/${id}`);
    return { id, deleted: true };
  } catch (err) {
    try {
      await apiClient.delete(`/admin/medicines/${id}`);
      return { id, deleted: true };
    } catch (e) {
      await apiClient.delete(`/pharmacist/medicines/${id}`);
      return { id, deleted: true };
    }
  }
}
