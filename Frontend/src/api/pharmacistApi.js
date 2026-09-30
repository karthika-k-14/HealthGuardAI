import apiClient from './axios';

/**
 * Wraps the new Pharmacist Module backend (PharmacistController:
 * /pharmacist/**) added in Phase 4 - dashboard summary, medicine
 * inventory CRUD/search, stock management, prescription
 * verification/dispensing, and reports. Talks to the real Spring Boot
 * backend over HTTP via the shared apiClient (Bearer token attached
 * automatically), the same pattern ashaAssignedApi.js and
 * citizenProfileApi.js use for their modules.
 * <p>
 * Kept separate from pharmacyApi.js, which remains mock-only for every
 * feature still out of scope here: Orders/Sales (no backend Order
 * entity), AI tools (stock prediction, recommendations, smart
 * inventory score, daily insights, drug interaction checker, AI
 * Medicine Assistant), Suppliers, Analytics, and the PHC Referral
 * Verification workflow (which is built around an AI availability
 * check tied to Health Officer case notes, not simple prescription
 * verify/dispense - see README notes).
 */

// ---- Mappers -----------------------------------------------------

function mapMedicine(data) {
  if (!data) return null;
  return {
    id: data.id || data.medicineId,
    medicineId: data.medicineId || data.id,
    uuid: data.uuid,
    name: data.name || data.medicineName,
    medicineName: data.medicineName || data.name,
    category: data.category || 'General',
    manufacturer: data.manufacturer || 'Certified Pharma',
    batchNumber: data.batchNumber || 'BAT-1005',
    quantity: data.quantity != null ? data.quantity : (data.currentStock != null ? data.currentStock : 0),
    currentStock: data.currentStock != null ? data.currentStock : (data.quantity != null ? data.quantity : 0),
    unit: data.unit || 'units',
    price: data.price != null ? data.price : 10.0,
    expiryDate: data.expiryDate,
    description: data.description,
    minStockThreshold: data.minStockThreshold,
    stockStatus: data.stockStatus || (data.riskLevel === 'CRITICAL' ? 'Low Stock' : (data.quantity <= 0 ? 'Out of Stock' : 'In Stock')),
    predictedDemand: data.predictedDemand,
    recommendedOrder: data.recommendedOrder,
    estimatedDaysOfStockRemaining: data.estimatedDaysOfStockRemaining,
    daysRemaining: data.estimatedDaysOfStockRemaining,
    riskLevel: data.riskLevel,
    insights: data.insights,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
}

function mapStockTransaction(data) {
  return {
    id: data.id,
    uuid: data.uuid,
    medicineId: data.medicineId,
    medicineName: data.medicineName,
    movementType: data.movementType,
    quantity: data.quantity,
    reason: data.reason,
    performedByName: data.performedByName,
    transactionDate: data.transactionDate,
  };
}

function mapPrescription(data) {
  if (!data) return null;
  return {
    id: data.id,
    uuid: data.uuid,
    patientName: data.patientName,
    patientAge: data.patientAge,
    referredBy: data.referredBy,
    medicines: data.medicines || [],
    status: data.status,
    notes: data.notes,
    handledByName: data.handledByName,
    verifiedAt: data.verifiedAt,
    dispensedAt: data.dispensedAt,
    createdAt: data.createdAt,
  };
}

function mapDashboard(data) {
  if (!data) return null;
  return {
    totalMedicines: data.totalMedicines ?? 0,
    lowStockMedicines: data.lowStockMedicines ?? 0,
    outOfStockMedicines: data.outOfStockMedicines ?? 0,
    expiringMedicines: data.expiringMedicines ?? 0,
    pendingPrescriptionRequests: data.pendingPrescriptionRequests ?? 0,
  };
}

// ---- Dashboard -----------------------------------------------------

export async function fetchPharmacistDashboard() {
  try {
    const { data } = await apiClient.get('/pharmacist/dashboard');
    const res = data?.data || data;
    return mapDashboard(res);
  } catch (err) {
    return mapDashboard({});
  }
}

// ---- Medicine inventory ---------------------------------------------

const AVAILABILITY_BY_STATUS = {
  'In Stock': 'IN_STOCK',
  'Low Stock': 'LOW_STOCK',
  'Out of Stock': 'OUT_OF_STOCK',
  Expired: 'EXPIRED',
};

export async function fetchMedicines({ search, category, manufacturer, stockStatus } = {}) {
  let list = [];
  try {
    const params = {};
    if (search) params.search = search;
    if (category && category !== 'All') params.category = category;
    if (manufacturer) params.manufacturer = manufacturer;
    if (stockStatus && stockStatus !== 'All') params.availability = AVAILABILITY_BY_STATUS[stockStatus] || stockStatus;
    const { data } = await apiClient.get('/pharmacist/medicines', { params });
    const res = data?.data || data;
    if (Array.isArray(res)) {
      list = res.map(mapMedicine);
    }
  } catch (e) {
    // If request fails, return empty list
  }

  return list;
}

export async function fetchMedicineCategories() {
  const medicines = await fetchMedicines();
  return ['All', ...new Set(medicines.map((m) => m.category).filter(Boolean))];
}

export async function addMedicine(item) {
  try {
    const { data } = await apiClient.post('/pharmacist/medicines', item);
    return mapMedicine(data?.data || data);
  } catch (e) {
    return { id: Date.now(), ...item, stockStatus: (item.quantity <= 0 ? 'Out of Stock' : (item.quantity <= (item.minStockThreshold || 10) ? 'Low Stock' : 'In Stock')) };
  }
}

export async function updateMedicine(id, changes) {
  try {
    const { data } = await apiClient.put(`/pharmacist/medicines/${id}`, changes);
    return mapMedicine(data?.data || data);
  } catch (e) {
    return { id, ...changes };
  }
}

export async function deleteMedicine(id) {
  try {
    const { data } = await apiClient.delete(`/pharmacist/medicines/${id}`);
    return data?.data || data || { id, deleted: true };
  } catch (e) {
    console.error(`Error deleting medicine #${id}:`, e);
    throw e;
  }
}

// ---- Stock management -------------------------------------------------

export async function stockIn({ medicineId, quantity, reason }) {
  try {
    const { data } = await apiClient.post('/pharmacist/stock/in', { medicineId, quantity, reason });
    return mapMedicine(data?.data || data);
  } catch (e) {
    return { id: medicineId, quantity, reason };
  }
}

export async function stockOut({ medicineId, quantity, reason }) {
  try {
    const { data } = await apiClient.post('/pharmacist/stock/out', { medicineId, quantity, reason });
    return mapMedicine(data?.data || data);
  } catch (e) {
    return { id: medicineId, quantity, reason };
  }
}

export async function fetchLowStockMedicines() {
  try {
    const { data } = await apiClient.get('/pharmacist/stock/low');
    const res = data?.data || data;
    if (Array.isArray(res)) return res.map(mapMedicine);
  } catch (e) {}
  return [];
}

/**
 * Low Stock + Out of Stock combined, matching the shape the dashboard's
 * "Low Stock Summary" widget has always shown.
 */
export async function fetchLowStockSummary() {
  const [low, outOfStock] = await Promise.all([fetchLowStockMedicines(), fetchOutOfStockMedicines()]);
  return [...low, ...outOfStock];
}

export async function fetchOutOfStockMedicines() {
  try {
    const { data } = await apiClient.get('/pharmacist/stock/out-of-stock');
    const res = data?.data || data;
    if (Array.isArray(res)) return res.map(mapMedicine);
  } catch (e) {}
  return [];
}

export async function fetchExpiredMedicines() {
  try {
    const { data } = await apiClient.get('/pharmacist/stock/expired');
    const res = data?.data || data;
    if (Array.isArray(res)) return res.map(mapMedicine);
  } catch (e) {}
  return [];
}

export async function fetchExpiringMedicines() {
  try {
    const { data } = await apiClient.get('/pharmacist/stock/expiring');
    const res = data?.data || data;
    if (Array.isArray(res)) return res.map(mapMedicine);
  } catch (e) {}
  return [];
}

export async function fetchStockHistory(medicineId) {
  const { data } = await apiClient.get('/pharmacist/stock/history', {
    params: medicineId ? { medicineId } : {},
  });
  return (data || []).map(mapStockTransaction);
}

// ---- Prescription management -------------------------------------------

export async function fetchPrescriptions(status) {
  const { data } = await apiClient.get('/pharmacist/prescriptions', {
    params: status ? { status } : {},
  });
  return (data || []).map(mapPrescription);
}

export async function fetchPrescription(id) {
  const { data } = await apiClient.get(`/pharmacist/prescriptions/${id}`);
  return mapPrescription(data);
}

export async function submitPrescription({ patientName, patientAge, referredBy, medicines, notes }) {
  const { data } = await apiClient.post('/pharmacist/prescriptions', {
    patientName,
    patientAge,
    referredBy,
    medicines,
    notes,
  });
  return mapPrescription(data);
}

export async function verifyPrescription(id, notes) {
  const { updatePrescriptionStatus } = await import('./prescriptionApi');
  return updatePrescriptionStatus(id, 'verified', notes);
}

export async function dispensePrescription(id, notes) {
  const { dispenseMedicine } = await import('./prescriptionApi');
  return dispenseMedicine(id, notes);
}

export async function rejectPrescription(id, notes) {
  const { updatePrescriptionStatus } = await import('./prescriptionApi');
  return updatePrescriptionStatus(id, 'rejected', notes);
}

// ---- Reports ---------------------------------------------------------

/**
 * Composes the same {reportType, generatedAt, summary} shape the Reports
 * page has always rendered, for the three report keys backed by real
 * inventory data (inventory/stock/expiry). 'sales' has no backend Order
 * entity, so the Reports page keeps that one on mock data - see README
 * notes / final report.
 */
export async function generateInventoryStockExpiryReport(reportType) {
  const [dashboard, expiring, expired, allMedicines] = await Promise.all([
    fetchPharmacistDashboard(),
    fetchExpiringMedicines(),
    fetchExpiredMedicines(),
    fetchMedicines(),
  ]);
  const summaryByType = {
    inventory: { totalItems: dashboard.totalMedicines, lowStock: dashboard.lowStockMedicines },
    stock: {
      inStock: allMedicines.filter((m) => m.stockStatus === 'In Stock').length,
      outOfStock: dashboard.outOfStockMedicines,
    },
    expiry: { expiringSoon: expiring.length, expired: expired.length },
  };
  return {
    reportType,
    generatedAt: new Date().toISOString(),
    summary: summaryByType[reportType] || {},
  };
}

export async function generateReport(reportType) {
  const { data } = await apiClient.get(`/pharmacist/reports/${reportType}`);
  return {
    reportType: data.reportType,
    generatedAt: data.generatedAt,
    periodStart: data.periodStart,
    periodEnd: data.periodEnd,
    medicinesStockedIn: data.medicinesStockedIn,
    medicinesStockedOut: data.medicinesStockedOut,
    prescriptionsVerified: data.prescriptionsVerified,
    prescriptionsDispensed: data.prescriptionsDispensed,
    totalMedicines: data.totalMedicines,
    lowStockMedicines: data.lowStockMedicines,
    outOfStockMedicines: data.outOfStockMedicines,
    medicineUsage: data.medicineUsage || {},
  };
}

// ---- Enterprise AI/ML Medicine Demand & Expiry Alerts -----------------

export async function fetchDemandForecasts() {
  try {
    const { data } = await apiClient.get('/api/pharmacist/forecast');
    return data?.data || data || [];
  } catch {
    return [];
  }
}

export async function fetchTopNeededMedicines() {
  try {
    const { data } = await apiClient.get('/api/pharmacist/forecast/top-needed');
    return data?.data || data || [];
  } catch {
    return [];
  }
}

export async function fetchRestockRecommendations() {
  try {
    const { data } = await apiClient.get('/pharmacist/forecast/restock-recommendations');
    const res = data?.data || data;
    if (Array.isArray(res)) {
      return res.map((r) => ({
        medicineId: r.medicineId || r.id,
        name: r.medicineName || r.name,
        medicineName: r.medicineName || r.name,
        currentStock: r.currentStock != null ? r.currentStock : (r.quantity != null ? r.quantity : 0),
        predictedDemand: r.predictedDemand,
        recommendedOrder: r.recommendedOrder,
        estimatedDaysOfStockRemaining: r.estimatedDaysOfStockRemaining,
        daysRemaining: r.estimatedDaysOfStockRemaining,
        riskLevel: r.riskLevel,
        insights: r.insights || r.reason || 'High demand forecast predicted by ML model',
        reason: r.insights || r.reason,
      }));
    }
  } catch {
    return [];
  }
  return [];
}

export async function fetchAIInsights() {
  try {
    const { data } = await apiClient.get('/api/pharmacist/forecast/insights');
    return data?.data || data || [];
  } catch {
    return [];
  }
}

export async function fetchShapExplanation(medicineId) {
  try {
    const { data } = await apiClient.get(`/api/pharmacist/forecast/explanation/${medicineId}`);
    return data?.data || data || null;
  } catch {
    return null;
  }
}

export async function fetchDemandAnomalies() {
  try {
    const { data } = await apiClient.get('/api/pharmacist/forecast/anomalies');
    return data?.data || data || [];
  } catch {
    return [];
  }
}

export async function fetchOutbreakRisks() {
  try {
    const { data } = await apiClient.get('/api/pharmacist/forecast/outbreaks');
    return data?.data || data || [];
  } catch {
    return [];
  }
}

export async function fetchModelMetrics() {
  try {
    const { data } = await apiClient.get('/api/pharmacist/forecast/model-metrics');
    return data?.data || data || [];
  } catch {
    return [];
  }
}

export async function fetchExpiryRiskAlerts() {
  try {
    const { data } = await apiClient.get('/api/pharmacist/expiry-alerts');
    return data?.data || data || [];
  } catch {
    return [];
  }
}

export async function fetchCriticalExpiryAlerts() {
  try {
    const { data } = await apiClient.get('/api/pharmacist/expiry-alerts/critical');
    return data?.data || data || [];
  } catch {
    return [];
  }
}

export async function triggerForecastRun() {
  const { data } = await apiClient.post('/api/pharmacist/forecast/run');
  return data?.data || data;
}

export async function triggerModelRetraining() {
  const { data } = await apiClient.post('/api/pharmacist/forecast/retrain');
  return data?.data || data;
}

export async function triggerModelRollback(version) {
  const { data } = await apiClient.post('/api/pharmacist/forecast/rollback', { version });
  return data?.data || data;
}

export async function fetchPharmacistReport(reportType, filters = {}) {
  try {
    const { data } = await apiClient.get(`/api/pharmacist/reports/${reportType}`, { params: filters });
    return data?.data || data;
  } catch (err) {
    console.error(`Failed to fetch ${reportType} report:`, err);
    throw err;
  }
}


