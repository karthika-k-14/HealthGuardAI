import { mockRequest } from './mockClient';
import diseaseStats from '../data/diseaseStats.json';
import statsFixture from '../data/pharmacyStats.json';
import inventoryFixture from '../data/inventory.json';
import ordersFixture from '../data/pharmacyOrders.json';
import prescriptionsFixture from '../data/prescriptions.json';
import suppliersFixture from '../data/suppliers.json';
import salesAnalyticsFixture from '../data/pharmacySalesAnalytics.json';
import profileFixture from '../data/pharmacistProfile.json';
import medicinesFixture from '../data/medicines.json';

// Consumed by the earlier disease-pattern-signal feature — kept as-is.
export async function fetchDiseasePatternSignal() {
  return mockRequest(diseaseStats.byDisease);
}

// ---- In-memory "mock database" for inventory ----
// Unlike read-only fixtures, inventory supports add/edit/delete from
// the UI, so it's kept as live module state seeded from the JSON
// fixture rather than re-imported fresh on every call.
let inventoryStore = inventoryFixture.map((item) => ({ ...item }));
let prescriptionsStore = prescriptionsFixture.map((item) => ({ ...item }));

// ---- Medicine availability tracking (feeds demand forecasting) ----
// Every time a PHC confirms a medicine is available for a referred
// citizen, it's logged here and the matching inventory item is
// decremented. This is availability/stock tracking for public-health
// planning purposes, not a retail sales ledger — the log exists so
// AI Module 6 (Medicine Demand Forecasting) has real historical
// consumption data to work from instead of only a static snapshot.
let dispenseHistoryStore = [];

/**
 * Records that `quantity` units of `medicineName` were confirmed
 * available / handed out at a PHC, decrements the matching inventory
 * item (best-effort case-insensitive match), and appends to the
 * availability history feed used by fetchMedicineDemandForecast().
 */
export async function recordMedicineAvailabilityUpdate({ medicineName, quantity = 1, ward = null }) {
  return mockRequest(() => {
    const item = inventoryStore.find((i) => i.name.toLowerCase() === (medicineName || '').toLowerCase());
    if (item) {
      item.quantity = Math.max(0, (item.quantity || 0) - quantity);
      item.stockStatus = computeStockStatus(item.quantity, item.expiryDate);
    }
    const entry = {
      id: `disp_${Date.now()}`,
      medicineName,
      quantity,
      ward,
      matchedInventoryId: item?.id || null,
      date: new Date().toISOString(),
    };
    dispenseHistoryStore.unshift(entry);
    return entry;
  });
}

export async function fetchMedicineAvailabilityHistory() {
  return mockRequest(() => dispenseHistoryStore);
}

function computeStockStatus(quantity, expiryDate) {
  const daysToExpiry = (new Date(expiryDate) - new Date()) / (1000 * 60 * 60 * 24);
  if (daysToExpiry < 0) return 'Expired';
  if (quantity <= 0) return 'Out of Stock';
  if (quantity <= 20) return 'Low Stock';
  return 'In Stock';
}

// ---- Dashboard ----

export async function fetchDashboardStats() {
  return mockRequest(statsFixture);
}

export async function fetchTodaysOrders() {
  return mockRequest(() => ordersFixture.new);
}

export async function fetchLowStockSummary() {
  return mockRequest(() => inventoryStore.filter((i) => i.stockStatus === 'Low Stock' || i.stockStatus === 'Out of Stock'));
}

export async function fetchExpiringMedicines() {
  return mockRequest(() => {
    const now = new Date();
    const in60Days = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000);
    return inventoryStore.filter((i) => {
      const exp = new Date(i.expiryDate);
      return exp >= now && exp <= in60Days;
    });
  });
}

export async function fetchRecentActivities() {
  return mockRequest(() => [
    ...ordersFixture.completed.slice(0, 3).map((o) => ({
      id: o.id,
      label: `Completed order for ${o.patient} (₹${o.total})`,
      date: o.date,
    })),
    { id: 'act_ext_1', label: 'Verified prescription for Meena Subramaniam', date: '2026-07-04' },
  ]);
}

// ---- Inventory management ----

export async function fetchInventory({ search, category, stockStatus } = {}) {
  return mockRequest(() => {
    let list = inventoryStore;
    if (category && category !== 'All') list = list.filter((i) => i.category === category);
    if (stockStatus && stockStatus !== 'All') list = list.filter((i) => i.stockStatus === stockStatus);
    if (search) {
      const q = search.trim().toLowerCase();
      list = list.filter((i) => i.name.toLowerCase().includes(q) || i.manufacturer.toLowerCase().includes(q));
    }
    return list;
  });
}

export async function fetchInventoryCategories() {
  return mockRequest(() => ['All', ...new Set(inventoryFixture.map((i) => i.category))]);
}

export async function addInventoryItem(item) {
  return mockRequest(() => {
    const newItem = {
      id: `inv_${Date.now()}`,
      quantity: 0,
      unit: 'units',
      price: 0,
      ...item,
      stockStatus: computeStockStatus(item.quantity ?? 0, item.expiryDate),
    };
    inventoryStore = [newItem, ...inventoryStore];
    return newItem;
  });
}

export async function updateInventoryItem(id, changes) {
  return mockRequest(() => {
    inventoryStore = inventoryStore.map((i) =>
      i.id === id
        ? {
            ...i,
            ...changes,
            stockStatus: computeStockStatus(changes.quantity ?? i.quantity, changes.expiryDate ?? i.expiryDate),
          }
        : i
    );
    return inventoryStore.find((i) => i.id === id);
  });
}

export async function deleteInventoryItem(id) {
  return mockRequest(() => {
    inventoryStore = inventoryStore.filter((i) => i.id !== id);
    return { id, deleted: true };
  });
}

// ---- PHC Referral Verification / Medicine Availability Verification ----
// A citizen's referring ASHA/Officer sends a recommended-medicines
// note; the pharmacist here verifies whether the PHC currently has
// those medicines available (an availability check), not whether a
// doctor's prescription is legitimate — there is no prescribing
// clinician role in this platform.

export async function fetchReferralVerifications() {
  return mockRequest(() => prescriptionsStore);
}

// Logs a manually-entered referral for AI-assisted availability
// verification against current PHC stock. `fileName`/upload UI is
// accepted for feedback only — no real file is processed.
export async function submitReferralForVerification({ patientName, patientAge, referredBy, medicines }) {
  return mockRequest(() => {
    const confidence = 70 + Math.round(Math.random() * 28);
    const flags = confidence < 85 ? ['Some medicine names partially unclear'] : [];
    const newEntry = {
      id: `refver_${Date.now()}`,
      patientName,
      patientAge: Number(patientAge) || null,
      referredBy,
      uploadedAt: new Date().toISOString(),
      medicines: medicines?.length ? medicines : ['Not specified'],
      status: 'pending',
      aiVerification: {
        confidence,
        result:
          confidence >= 85
            ? 'Referral details are clear and medicines are cross-checked against PHC stock.'
            : 'Some details are unclear — recommend manual availability check before confirming.',
        flags,
      },
    };
    prescriptionsStore = [newEntry, ...prescriptionsStore];
    return newEntry;
  }, { latency: 1100 });
}

/**
 * `status` is 'available' (PHC has stock — decrements inventory and
 * logs to the demand-forecasting availability history) or
 * 'unavailable' (flagged for procurement, no inventory change).
 */
export async function updateReferralVerificationStatus(id, status) {
  const entry = prescriptionsStore.find((p) => p.id === id);
  if (entry && status === 'available') {
    for (const medicineName of entry.medicines) {
      await recordMedicineAvailabilityUpdate({ medicineName, quantity: 1 });
    }
  }
  return mockRequest(() => {
    prescriptionsStore = prescriptionsStore.map((p) => (p.id === id ? { ...p, status } : p));
    return prescriptionsStore.find((p) => p.id === id);
  });
}

// ---- Supplier management ----

export async function fetchSuppliers() {
  return mockRequest(suppliersFixture);
}

// ---- Orders ----

export async function fetchOrders() {
  return mockRequest(ordersFixture);
}

// ---- Analytics ----

export async function fetchSalesAnalytics() {
  return mockRequest(salesAnalyticsFixture);
}

// ---- Reports ----

export async function generatePharmacyReport(reportType) {
  return mockRequest(() => {
    const base = {
      inventory: { totalItems: inventoryStore.length, lowStock: inventoryStore.filter((i) => i.stockStatus === 'Low Stock').length },
      sales: { totalRevenue: statsFixture.todaysRevenue, ordersProcessed: statsFixture.todaysOrders },
      stock: { inStock: inventoryStore.filter((i) => i.stockStatus === 'In Stock').length, outOfStock: inventoryStore.filter((i) => i.stockStatus === 'Out of Stock').length },
      expiry: { expiringSoon: inventoryStore.filter((i) => i.stockStatus !== 'Expired' && new Date(i.expiryDate) < new Date(Date.now() + 60 * 24 * 60 * 60 * 1000)).length, expired: inventoryStore.filter((i) => i.stockStatus === 'Expired').length },
    };
    return {
      reportType,
      generatedAt: new Date().toISOString(),
      summary: base[reportType] || {},
    };
  }, { latency: 700 });
}

// ---- Profile ----

export async function fetchPharmacistProfile() {
  return mockRequest(profileFixture);
}

// ---- Unique features ----

// AI Stock Prediction — estimates days-to-stockout per low/medium item
// from current quantity and a mocked average daily usage rate.
export async function fetchStockPrediction() {
  return mockRequest(() =>
    inventoryStore
      .filter((i) => i.stockStatus !== 'Expired')
      .map((i) => {
        const avgDailyUse = Math.max(1, Math.round((i.quantity || 1) / 18));
        const daysLeft = i.quantity > 0 ? Math.round(i.quantity / avgDailyUse) : 0;
        return { id: i.id, name: i.name, quantity: i.quantity, avgDailyUse, daysLeft };
      })
      .sort((a, b) => a.daysLeft - b.daysLeft)
      .slice(0, 6)
  );
}

// Medicine Recommendation Engine — suggests reorder/cross-sell items
// derived from top-selling medicines and current low stock.
export async function fetchMedicineRecommendations() {
  return mockRequest(() => {
    const lowStockNames = new Set(inventoryStore.filter((i) => i.stockStatus === 'Low Stock').map((i) => i.name));
    return salesAnalyticsFixture.topMedicines
      .filter((m) => lowStockNames.has(m.name) || m.unitsSold > 600)
      .map((m) => ({
        name: m.name,
        reason: lowStockNames.has(m.name) ? 'Running low and in high demand' : 'Consistently high seller',
      }));
  });
}

// Smart Inventory Score — composite 0-100 score from stock health.
export async function fetchSmartInventoryScore() {
  return mockRequest(() => {
    const total = inventoryStore.length || 1;
    const healthy = inventoryStore.filter((i) => i.stockStatus === 'In Stock').length;
    const problematic = inventoryStore.filter((i) => i.stockStatus === 'Out of Stock' || i.stockStatus === 'Expired').length;
    const score = Math.round(((healthy - problematic * 0.5) / total) * 100);
    return {
      score: Math.max(0, Math.min(100, score)),
      breakdown: [
        { label: 'Healthy stock', value: healthy },
        { label: 'Low stock', value: inventoryStore.filter((i) => i.stockStatus === 'Low Stock').length },
        { label: 'Out of stock', value: inventoryStore.filter((i) => i.stockStatus === 'Out of Stock').length },
        { label: 'Expired', value: inventoryStore.filter((i) => i.stockStatus === 'Expired').length },
      ],
    };
  });
}

// Daily Pharmacy Insights — short mock insight strings for the day.
export async function fetchDailyInsights() {
  return mockRequest(() => [
    `${statsFixture.todaysOrders} orders processed so far today.`,
    `${inventoryStore.filter((i) => i.stockStatus === 'Low Stock').length} items are running low — consider reordering.`,
    'Antibiotic sales are up 12% compared to last week.',
    'Peak order time today was between 10 AM and 12 PM.',
  ]);
}

// Drug Interaction Checker — looks up known interaction notes for the
// selected medicines from the shared medicine knowledge base.
export async function checkDrugInteractions(medicineNames) {
  return mockRequest(() => {
    const matches = medicinesFixture.filter((m) => medicineNames.includes(m.name));
    const interactions = matches.flatMap((m) => (m.interactions || []).map((note) => ({ medicine: m.name, note })));
    return {
      checked: medicineNames,
      interactions,
      hasWarnings: interactions.length > 0,
    };
  }, { latency: 600 });
}

// ---- AI Medicine Assistant ----

const ASSISTANT_TOPICS = {
  information: 'This medicine is commonly used as described in its label indication. Always verify the exact formulation and strength dispensed matches the prescription.',
  alternatives: 'Consider therapeutic alternatives within the same class if the exact brand is unavailable, subject to prescriber approval where required.',
  interactions: 'Check for interactions with anticoagulants, sedatives, and other medications the patient is currently taking before dispensing.',
  dosage: 'Confirm dosage against patient age, weight, and renal/hepatic function where relevant. Follow the prescribed frequency exactly.',
  sideEffects: 'Common side effects should be communicated to the patient, along with guidance on when to seek medical attention.',
  storage: 'Store in a cool, dry place away from direct sunlight unless otherwise specified. Refrigerate only if the label requires it.',
};

export async function sendMedicineAssistantMessage({ message, topic }) {
  return mockRequest(() => ({
    id: `pmsg_${Date.now()}`,
    role: 'assistant',
    content:
      ASSISTANT_TOPICS[topic] ||
      "I can help with medicine information, alternatives, drug interactions, dosage, side effects, and storage instructions. Ask about a specific medicine or select a topic.",
    inReplyTo: message,
  }), { latency: 850 });
}
