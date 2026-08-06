import { mockRequest } from './mockClient';
import diseaseStats from '../data/diseaseStats.json';
import tasksFixture from '../data/ashaTasks.json';
import familiesFixture from '../data/ashaFamilies.json';
import visitsFixture from '../data/ashaVisits.json';
import childHealthFixture from '../data/childHealthRecords.json';
import surveillanceFixture from '../data/diseaseSurveillance.json';
import villageScoreFixture from '../data/villageHealthScore.json';
import medicineRequestsFixture from '../data/medicineRequests.json';
import workerProfileFixture from '../data/ashaWorkerProfile.json';

// ---- Dashboard-level ----

// TODO: Missing backend API: /asha/case-trend
export async function fetchFieldCaseTrend() {
  return mockRequest(diseaseStats.trend);
}

// TODO: Missing backend API: /asha/tasks
export async function fetchTodayTasks() {
  return mockRequest(tasksFixture);
}

// TODO: Missing backend API: /asha/visits/summary
export async function fetchVisitSummary() {
  return mockRequest(() => ({
    todayCount: visitsFixture.today.length,
    upcomingCount: visitsFixture.upcoming.length,
    completedCount: visitsFixture.completed.length,
    completedThisWeek: visitsFixture.completed.length + 4,
  }));
}

export async function fetchHighRiskAlerts() {
  return mockRequest(() => [
    ...familiesFixture
      .filter((f) => f.riskLevel === 'High')
      .map((f) => ({ id: f.id, label: `${f.headName}'s family flagged high risk`, type: 'family' })),
    ...surveillanceFixture.outbreakAlerts.map((a) => ({ id: a.id, label: a.message, type: 'outbreak' })),
  ]);
}

export async function fetchRecentActivities() {
  return mockRequest(() => [
    ...visitsFixture.completed.map((v) => ({
      id: v.id,
      label: `Completed ${v.type} for ${v.familyName}`,
      date: v.date,
    })),
    { id: 'act_ext_1', label: 'Submitted weekly surveillance report', date: '2026-07-01' },
  ]);
}

// ---- Family management ----

export async function fetchFamilies({ search, riskLevel } = {}) {
  return mockRequest(() => {
    let list = familiesFixture;
    if (riskLevel && riskLevel !== 'All') {
      list = list.filter((f) => f.riskLevel === riskLevel);
    }
    if (search) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (f) => f.headName.toLowerCase().includes(q) || f.address.toLowerCase().includes(q)
      );
    }
    return list;
  });
}

export async function fetchFamilyById(id) {
  return mockRequest(() => familiesFixture.find((f) => f.id === id) || null);
}

// ---- Home visits ----

export async function fetchVisits() {
  return mockRequest(visitsFixture);
}

// ---- Child health ----

export async function fetchChildHealthRecords() {
  return mockRequest(childHealthFixture);
}

// ---- Disease surveillance ----

export async function fetchDiseaseSurveillance() {
  return mockRequest(surveillanceFixture);
}

// Mock-submits a suspected case report; echoes back a generated id.
export async function submitCaseReport(report) {
  return mockRequest(() => ({
    id: `rep_${Date.now()}`,
    status: 'submitted',
    ...report,
  }));
}

// ---- Unique features ----

export async function fetchVillageHealthScore() {
  return mockRequest(villageScoreFixture);
}

// Simple deterministic-ish mock risk predictor per family, derived
// from existing fixture fields — not a real model.
export async function fetchFamilyRiskPredictions() {
  return mockRequest(() =>
    familiesFixture.map((f) => {
      const base = { Low: 20, Medium: 50, High: 78 }[f.riskLevel] ?? 30;
      const jitter = (f.members * 3) % 11;
      return {
        id: f.id,
        familyName: f.headName,
        riskScore: Math.min(96, base + jitter),
        riskLevel: f.riskLevel,
      };
    })
  );
}

export async function fetchMedicineRequests() {
  return mockRequest(medicineRequestsFixture);
}

export async function submitMedicineRequest({ medicine, quantity }) {
  return mockRequest(() => ({
    id: `medreq_${Date.now()}`,
    medicine,
    quantity,
    status: 'pending',
    requestedOn: new Date().toISOString().slice(0, 10),
  }));
}

// ---- Reports ----

export async function generateReport(reportType) {
  return mockRequest(() => {
    const base = {
      daily: { visits: 4, newRegistrations: 1, followUps: 2 },
      weekly: { visits: 22, newRegistrations: 3, followUps: 9 },
      monthly: { visits: 88, newRegistrations: 11, followUps: 34 },
      vaccination: { dosesGiven: 14, dueThisMonth: 6, coverage: '91%' },
    };
    return {
      reportType,
      generatedAt: new Date().toISOString(),
      summary: base[reportType] || {},
    };
  }, { latency: 700 });
}

// ---- Worker profile ----

export async function fetchWorkerProfile() {
  return mockRequest(workerProfileFixture);
}

// ---- AI Field Assistant ----

const FIELD_ASSISTANT_RESPONSES = {
  symptom: 'Based on the symptoms described, monitor temperature and hydration. If fever persists beyond 2 days or breathing is affected, refer to the nearest PHC immediately.',
  childcare: 'Continue exclusive breastfeeding if under 6 months. Track weight monthly against the growth chart and ensure scheduled vaccines are not delayed by more than a week.',
  disease: 'Encourage use of mosquito nets and elimination of stagnant water for vector-borne disease prevention. Report any case cluster of 3 or more similar symptoms in the same area immediately.',
  emergency: 'For suspected emergencies, stabilize the patient, note vital signs if possible, and arrange transport to the nearest facility. Alert the health officer if it is a suspected outbreak-related emergency.',
  scheme: 'Janani Suraksha Yojana covers institutional delivery costs for eligible mothers. Ayushman Bharat provides hospitalization coverage — check eligibility based on the family\u2019s registered category.',
};

/**
 * Mock AI Field Assistant. `category` maps to one of the tailored
 * response tracks above; falls back to a general guidance message.
 */
export async function sendFieldAssistantMessage({ message, category }) {
  return mockRequest(() => ({
    id: `fmsg_${Date.now()}`,
    role: 'assistant',
    content:
      FIELD_ASSISTANT_RESPONSES[category] ||
      "I can help with symptom guidance, child care tips, disease awareness, emergency suggestions, and government scheme information. Try selecting a category or describing what you're seeing in the field.",
    inReplyTo: message,
  }), { latency: 850 });
}
