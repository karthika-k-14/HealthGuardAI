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
    id: data.id,
    uuid: data.uuid,
    name: data.name,
    category: data.category,
    manufacturer: data.manufacturer,
    batchNumber: data.batchNumber,
    quantity: data.quantity,
    unit: data.unit,
    price: data.price,
    expiryDate: data.expiryDate,
    description: data.description,
    minStockThreshold: data.minStockThreshold,
    stockStatus: data.stockStatus,
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
    todaysPrescriptions: data.todaysPrescriptions ?? 0,
    medicinesDispensedToday: data.medicinesDispensedToday ?? 0,
    pendingPrescriptionRequests: data.pendingPrescriptionRequests ?? 0,
  };
}

// ---- Dashboard -----------------------------------------------------

export async function fetchPharmacistDashboard() {
  const { data } = await apiClient.get('/pharmacist/dashboard');
  return mapDashboard(data);
}

// ---- Medicine inventory ---------------------------------------------

const AVAILABILITY_BY_STATUS = {
  'In Stock': 'IN_STOCK',
  'Low Stock': 'LOW_STOCK',
  'Out of Stock': 'OUT_OF_STOCK',
  Expired: 'EXPIRED',
};

export async function fetchMedicines({ search, category, manufacturer, stockStatus } = {}) {
  const params = {};
  if (search) params.search = search;
  if (category && category !== 'All') params.category = category;
  if (manufacturer) params.manufacturer = manufacturer;
  if (stockStatus && stockStatus !== 'All') params.availability = AVAILABILITY_BY_STATUS[stockStatus] || stockStatus;
  const { data } = await apiClient.get('/pharmacist/medicines', { params });
  return (data || []).map(mapMedicine);
}

export async function fetchMedicineCategories() {
  const medicines = await fetchMedicines();
  return ['All', ...new Set(medicines.map((m) => m.category).filter(Boolean))];
}

export async function addMedicine(item) {
  const { data } = await apiClient.post('/pharmacist/medicines', item);
  return mapMedicine(data);
}

export async function updateMedicine(id, changes) {
  const { data } = await apiClient.put(`/pharmacist/medicines/${id}`, changes);
  return mapMedicine(data);
}

export async function deleteMedicine(id) {
  await apiClient.delete(`/pharmacist/medicines/${id}`);
  return { id, deleted: true };
}

// ---- Stock management -------------------------------------------------

export async function stockIn({ medicineId, quantity, reason }) {
  const { data } = await apiClient.post('/pharmacist/stock/in', { medicineId, quantity, reason });
  return mapMedicine(data);
}

export async function stockOut({ medicineId, quantity, reason }) {
  const { data } = await apiClient.post('/pharmacist/stock/out', { medicineId, quantity, reason });
  return mapMedicine(data);
}

export async function fetchLowStockMedicines() {
  const { data } = await apiClient.get('/pharmacist/stock/low');
  return (data || []).map(mapMedicine);
}

/**
 * Low Stock + Out of Stock combined, matching the shape the dashboard's
 * "Low Stock Summary" widget has always shown (pharmacyApi.js's
 * fetchLowStockSummary filtered inventory to both statuses).
 */
export async function fetchLowStockSummary() {
  const [low, outOfStock] = await Promise.all([fetchLowStockMedicines(), fetchOutOfStockMedicines()]);
  return [...low, ...outOfStock];
}

export async function fetchOutOfStockMedicines() {
  const { data } = await apiClient.get('/pharmacist/stock/out-of-stock');
  return (data || []).map(mapMedicine);
}

export async function fetchExpiredMedicines() {
  const { data } = await apiClient.get('/pharmacist/stock/expired');
  return (data || []).map(mapMedicine);
}

export async function fetchExpiringMedicines() {
  const { data } = await apiClient.get('/pharmacist/stock/expiring');
  return (data || []).map(mapMedicine);
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
  const { data } = await apiClient.patch(`/pharmacist/prescriptions/${id}/verify`, { notes });
  return mapPrescription(data);
}

export async function dispensePrescription(id, notes) {
  const { data } = await apiClient.patch(`/pharmacist/prescriptions/${id}/dispense`, { notes });
  return mapPrescription(data);
}

export async function rejectPrescription(id, notes) {
  const { data } = await apiClient.patch(`/pharmacist/prescriptions/${id}/reject`, { notes });
  return mapPrescription(data);
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
