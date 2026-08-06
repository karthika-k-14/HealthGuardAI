import apiClient from './axios';
import { mockRequest } from './mockClient';
import {
  getDashboardSummary,
  getCitizenStatistics,
  getMedicineStatistics,
  getDiseaseStatistics,
  getHospitalStatistics,
  getCampaignStatistics,
  getDailyReport,
  getWeeklyReport,
  getMonthlyReport,
} from './analyticsApi';
import usersFixture from '../data/users.json';
import userDirectoryFixture from '../data/userDirectory.json';
import rolePermissionsFixture from '../data/rolePermissions.json';
import facilitiesFixture from '../data/adminFacilities.json';
import diseasesFixture from '../data/adminDiseases.json';
import platformStatsFixture from '../data/adminPlatformStats.json';
import systemStatusFixture from '../data/systemStatus.json';
import auditLogsFixture from '../data/auditLogs.json';
import analyticsFixture from '../data/adminAnalytics.json';
import adminProfileFixture from '../data/adminProfile.json';
import { ROLES } from '../constants/roles';
import { toFrontendRole } from '../utils/roleMapper';

// Consumed by earlier scaffolding — kept as-is.
export async function fetchAllAccounts() {
  return mockRequest(() => Object.values(usersFixture));
}

// ---- In-memory "mock database" for role/facility/disease records so
// admin CRUD actions persist for the session. There is deliberately no
// backend endpoint yet for User Management (directory CRUD) or Staff
// Access Codes — AdminController only exposes approvals + assignment
// (see fetchPendingApprovals/adminApproveUser/etc. below, which DO call
// the real backend). This directory store is self-contained here and
// does not touch, and cannot authenticate, real accounts. ----
let roleStore = rolePermissionsFixture.map((r) => ({ ...r }));
let facilityStore = facilitiesFixture.map((f) => ({ ...f }));
let diseaseStore = diseasesFixture.map((d) => ({ ...d }));

function seedDirectory() {
  return userDirectoryFixture.map((u) => {
    const isCitizen = u.role === ROLES.CITIZEN;
    return {
      ...u,
      phone: u.phone || null,
      profileCompleted: true,
      staffProfile: !isCitizen
        ? { employeeId: `EMP-${u.id.replace(/\D/g, '').padStart(4, '0')}`, licenseNumber: null, designation: null, assignedPHC: null, assignedVillage: null, district: null }
        : null,
    };
  });
}

let directoryStore = seedDirectory();
let directoryIdCounter = directoryStore.length + 1;
const nextDirectoryId = () => `usr_${Date.now()}_${directoryIdCounter++}`;

function findDirectoryByEmail(email) {
  const q = (email || '').trim().toLowerCase();
  return directoryStore.find((u) => u.email.toLowerCase() === q) || null;
}

// ---- Dashboard ----

export async function fetchPlatformStatistics() {
  try {
    const summary = await getDashboardSummary();
    if (summary) {
      const totalUsers = (summary.totalCitizens || 0) + (summary.totalAshaWorkers || 0) + (summary.totalHealthOfficers || 0) + (summary.totalPharmacists || 0);
      return {
        totalUsers: totalUsers || platformStatsFixture.totalUsers,
        activeUsers: summary.totalCitizens || platformStatsFixture.activeUsers,
        totalHospitals: summary.totalHospitals || platformStatsFixture.totalHospitals,
        totalCampaigns: summary.totalCampaigns || platformStatsFixture.totalCampaigns,
        aiInteractions: platformStatsFixture.aiInteractions,
        systemUptimePercent: platformStatsFixture.systemUptimePercent,
      };
    }
  } catch (err) {
    // fallback to fixture
  }
  return mockRequest(platformStatsFixture);
}

export async function fetchRecentActivities() {
  return mockRequest(() =>
    auditLogsFixture.slice(0, 5).map((l) => ({ id: l.id, label: `${l.actor}: ${l.detail}`, date: l.timestamp }))
  );
}

export async function fetchSystemStatusSummary() {
  return mockRequest(() => ({
    apiStatus: systemStatusFixture.apiStatus,
    serverStatus: systemStatusFixture.serverStatus,
    systemHealth: systemStatusFixture.systemHealth,
    onlineUsers: systemStatusFixture.onlineUsers,
  }));
}

// ---- User management (User Directory) ----
// No backend endpoint exists for directory CRUD (list/create/update/
// delete/toggle-status of arbitrary accounts) — AdminController only
// covers approvals and role assignment. This stays a local, in-memory
// directory until that endpoint exists; it is intentionally NOT wired
// to real login (accounts created here cannot sign in against the
// Spring Boot backend — only /auth/register/* creates real accounts).

export async function fetchUsers({ search, role, status } = {}) {
  return mockRequest(() => {
    let list = directoryStore;
    if (role && role !== 'All') list = list.filter((u) => u.role === role);
    if (status && status !== 'All') list = list.filter((u) => u.status === status);
    if (search) {
      const q = search.trim().toLowerCase();
      list = list.filter((u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
    }
    return list;
  });
}

export async function fetchUserById(id) {
  return mockRequest(() => directoryStore.find((u) => u.id === id) || null);
}

// Admin "Add User" — covers Create Citizen + the three creatable staff
// roles (ASHA/Officer/Pharmacist) in the local directory only. Admin
// accounts cannot be created here. Returns the new entry plus a
// generated placeholder password for the Admin UI to relay.
export async function addUser({ role, name, email, phone, employeeId, assignedPHC, assignedVillage, district }) {
  return mockRequest(() => {
    if (role === ROLES.ADMIN) {
      throw new Error('Additional admin accounts cannot be created from User Management.');
    }
    if (findDirectoryByEmail(email)) {
      throw new Error('An account with this email already exists.');
    }
    const generatedPassword = `Hg${Math.random().toString(36).slice(-6)}!`;
    const isCitizen = role === ROLES.CITIZEN;
    const newUser = {
      id: nextDirectoryId(),
      name,
      email: email.trim().toLowerCase(),
      phone: phone || null,
      role,
      status: 'active',
      profileCompleted: false,
      joinedOn: new Date().toISOString().slice(0, 10),
      lastLogin: null,
      staffProfile: !isCitizen
        ? { employeeId, licenseNumber: null, designation: null, assignedPHC: assignedPHC || null, assignedVillage: assignedVillage || null, district: district || null }
        : null,
    };
    directoryStore = [newUser, ...directoryStore];
    return { user: newUser, generatedPassword };
  }, { latency: 900 });
}

export async function updateUser(id, changes) {
  return mockRequest(() => {
    directoryStore = directoryStore.map((u) => (u.id === id ? { ...u, ...changes } : u));
    return directoryStore.find((u) => u.id === id);
  });
}

export async function deleteUser(id) {
  return mockRequest(() => {
    directoryStore = directoryStore.filter((u) => u.id !== id);
    return { id, deleted: true };
  });
}

export async function toggleUserStatus(id) {
  return mockRequest(() => {
    directoryStore = directoryStore.map((u) => (u.id === id ? { ...u, status: u.status === 'active' ? 'disabled' : 'active' } : u));
    return directoryStore.find((u) => u.id === id);
  });
}

// ---- Admin Approval module ----
// Pending ASHA / Health Officer / Pharmacist registrations submitted via
// /auth/register/*, awaiting review. This calls the REAL backend
// (AdminController) — approving/rejecting here changes the actual
// account's status in PostgreSQL, which is what login checks.

function mapPendingUser(p) {
  return {
    id: p.id,
    name: `${p.firstName || ''} ${p.lastName || ''}`.trim(),
    email: p.email,
    phone: p.phone,
    role: toFrontendRole(p.role),
    accountStatus: p.accountStatus,
    submittedAt: p.submittedAt,
    staffProfile: { employeeId: p.employeeId, licenseNumber: p.licenseNumber },
  };
}

export async function fetchPendingApprovals() {
  const { data } = await apiClient.get('/admin/approvals/pending');
  return data.map(mapPendingUser);
}

export async function adminApproveUser(id) {
  const { data } = await apiClient.post(`/admin/approvals/${id}/approve`);
  return data;
}

export async function adminRejectUser(id, reason) {
  const { data } = await apiClient.post(`/admin/approvals/${id}/reject`, { reason });
  return data;
}

export async function adminSuspendUser(id) {
  const { data } = await apiClient.post(`/admin/approvals/${id}/suspend`);
  return data;
}

export async function adminDeactivateUser(id) {
  const { data } = await apiClient.post(`/admin/approvals/${id}/deactivate`);
  return data;
}

// Assignment — village/PHC for ASHA, district/villages for Health
// Officer, PHC/pharmacy for Pharmacist. Only an Admin can call this;
// routes to the role-specific real backend endpoint.
export async function adminAssignStaff(id, { role, ...assignment }) {
  const pathByRole = {
    [ROLES.ASHA]: `/admin/assign/asha/${id}`,
    [ROLES.HEALTH_OFFICER]: `/admin/assign/officer/${id}`,
    [ROLES.PHARMACIST]: `/admin/assign/pharmacist/${id}`,
  };
  const path = pathByRole[role];
  if (!path) throw new Error('Unknown staff role for assignment.');
  const { data } = await apiClient.post(path, assignment);
  return data;
}

// ---- Staff Access Code management ----
// No backend endpoint exists for access codes (registration is direct
// self-registration against /auth/register/*, gated by Admin approval
// instead — see above). Stays a local, session-only mock store.

const STAFF_ROLES = [ROLES.ASHA, ROLES.HEALTH_OFFICER, ROLES.PHARMACIST];

function randomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let out = '';
  for (let i = 0; i < 8; i += 1) out += chars[Math.floor(Math.random() * chars.length)];
  return `${out.slice(0, 4)}-${out.slice(4)}`;
}

function seedAccessCodes() {
  const inDays = (d) => new Date(Date.now() + d * 86400000).toISOString();
  return [
    { code: 'ASHA-DEMO', role: ROLES.ASHA, status: 'unused', createdAt: new Date().toISOString(), expiresAt: inDays(30), usedBy: null },
    { code: 'OFFR-DEMO', role: ROLES.HEALTH_OFFICER, status: 'unused', createdAt: new Date().toISOString(), expiresAt: inDays(30), usedBy: null },
    { code: 'PHRM-DEMO', role: ROLES.PHARMACIST, status: 'unused', createdAt: new Date().toISOString(), expiresAt: inDays(30), usedBy: null },
  ];
}

let accessCodeStore = seedAccessCodes();

function isExpired(entry) {
  return new Date(entry.expiresAt).getTime() < Date.now();
}

export async function adminGenerateCode({ role, expiresInDays = 14 }) {
  return mockRequest(() => {
    if (!STAFF_ROLES.includes(role)) {
      throw new Error('Access codes can only be generated for ASHA, Health Officer, or Pharmacist roles.');
    }
    const entry = {
      code: randomCode(),
      role,
      status: 'unused',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + expiresInDays * 86400000).toISOString(),
      usedBy: null,
    };
    accessCodeStore = [entry, ...accessCodeStore];
    return entry;
  }, { latency: 700 });
}

export async function adminListAccessCodes({ status } = {}) {
  return mockRequest(() => {
    accessCodeStore = accessCodeStore.map((c) => (c.status === 'unused' && isExpired(c) ? { ...c, status: 'expired' } : c));
    let list = accessCodeStore;
    if (status && status !== 'All') list = list.filter((c) => c.status === status);
    return list;
  });
}

// ---- Role management ----

export async function fetchRoles() {
  return mockRequest(() => roleStore);
}

export async function updateRolePermissions(role, permissions) {
  return mockRequest(() => {
    roleStore = roleStore.map((r) => (r.role === role ? { ...r, permissions: { ...r.permissions, ...permissions } } : r));
    return roleStore.find((r) => r.role === role);
  });
}

// ---- Hospital / PHC / Pharmacy management ----

export async function fetchFacilities({ search, type } = {}) {
  return mockRequest(() => {
    let list = facilityStore;
    if (type && type !== 'All') list = list.filter((f) => f.type === type);
    if (search) {
      const q = search.trim().toLowerCase();
      list = list.filter((f) => f.name.toLowerCase().includes(q));
    }
    return list;
  });
}

export async function addFacility(facility) {
  return mockRequest(() => {
    const newFacility = { id: `afac_${Date.now()}`, status: 'Operational', ...facility };
    facilityStore = [newFacility, ...facilityStore];
    return newFacility;
  });
}

export async function updateFacility(id, changes) {
  return mockRequest(() => {
    facilityStore = facilityStore.map((f) => (f.id === id ? { ...f, ...changes } : f));
    return facilityStore.find((f) => f.id === id);
  });
}

export async function deleteFacility(id) {
  return mockRequest(() => {
    facilityStore = facilityStore.filter((f) => f.id !== id);
    return { id, deleted: true };
  });
}

// ---- Disease management ----

export async function fetchAdminDiseases() {
  return mockRequest(() => diseaseStore);
}

export async function addDisease(disease) {
  return mockRequest(() => {
    const newDisease = {
      id: `admd_${Date.now()}`,
      symptoms: [],
      prevention: [],
      treatments: [],
      ...disease,
    };
    diseaseStore = [newDisease, ...diseaseStore];
    return newDisease;
  });
}

export async function updateDisease(id, changes) {
  return mockRequest(() => {
    diseaseStore = diseaseStore.map((d) => (d.id === id ? { ...d, ...changes } : d));
    return diseaseStore.find((d) => d.id === id);
  });
}

export async function deleteDisease(id) {
  return mockRequest(() => {
    diseaseStore = diseaseStore.filter((d) => d.id !== id);
    return { id, deleted: true };
  });
}

// ---- Analytics ----

export async function fetchAdminAnalytics() {
  try {
    const summary = await getDashboardSummary();
    const citizenStats = await getCitizenStatistics().catch(() => null);
    const diseaseStats = await getDiseaseStatistics().catch(() => null);
    const hospitalStats = await getHospitalStatistics().catch(() => null);
    const campaignStats = await getCampaignStatistics().catch(() => null);

    if (summary) {
      return {
        ...analyticsFixture,
        summary,
        citizenStats,
        diseaseStats,
        hospitalStats,
        campaignStats,
      };
    }
  } catch (err) {
    // fallback
  }
  return mockRequest(analyticsFixture);
}

// ---- System monitoring ----

export async function fetchSystemMonitoring() {
  return mockRequest(systemStatusFixture);
}

// ---- Audit logs ----

export async function fetchAuditLogs({ search, type } = {}) {
  return mockRequest(() => {
    let list = auditLogsFixture;
    if (type && type !== 'All') list = list.filter((l) => l.type === type);
    if (search) {
      const q = search.trim().toLowerCase();
      list = list.filter((l) => l.actor.toLowerCase().includes(q) || l.detail.toLowerCase().includes(q));
    }
    return list;
  });
}

// ---- Reports ----

export async function generateAdminReport(reportType) {
  try {
    if (reportType === 'daily') {
      const res = await getDailyReport();
      return {
        reportType: res.reportType || 'daily',
        generatedAt: res.endDate || new Date().toISOString(),
        summary: {
          newCitizensRegistered: res.newCitizensRegistered,
          newHealthRecordsCreated: res.newHealthRecordsCreated,
          prescriptionsCreated: res.prescriptionsCreated,
          prescriptionsDispensed: res.prescriptionsDispensed,
          notificationsSent: res.notificationsSent,
          activeCampaigns: res.activeCampaigns,
          newMedicinesAdded: res.newMedicinesAdded,
        },
      };
    } else if (reportType === 'weekly') {
      const res = await getWeeklyReport();
      return {
        reportType: res.reportType || 'weekly',
        generatedAt: res.endDate || new Date().toISOString(),
        summary: {
          newCitizensRegistered: res.newCitizensRegistered,
          newHealthRecordsCreated: res.newHealthRecordsCreated,
          prescriptionsCreated: res.prescriptionsCreated,
          prescriptionsDispensed: res.prescriptionsDispensed,
          notificationsSent: res.notificationsSent,
          activeCampaigns: res.activeCampaigns,
          newMedicinesAdded: res.newMedicinesAdded,
        },
      };
    } else if (reportType === 'monthly') {
      const res = await getMonthlyReport();
      return {
        reportType: res.reportType || 'monthly',
        generatedAt: res.endDate || new Date().toISOString(),
        summary: {
          newCitizensRegistered: res.newCitizensRegistered,
          newHealthRecordsCreated: res.newHealthRecordsCreated,
          prescriptionsCreated: res.prescriptionsCreated,
          prescriptionsDispensed: res.prescriptionsDispensed,
          notificationsSent: res.notificationsSent,
          activeCampaigns: res.activeCampaigns,
          newMedicinesAdded: res.newMedicinesAdded,
        },
      };
    }
  } catch (e) {
    // fallback to mock implementation
  }

  const allUsers = directoryStore;
  return mockRequest(() => {
    const base = {
      user: { totalUsers: allUsers.length, activeUsers: allUsers.filter((u) => u.status === 'active').length },
      campaign: { totalCampaigns: platformStatsFixture.totalCampaigns },
      disease: { diseasesTracked: diseaseStore.length },
      hospital: { totalFacilities: facilityStore.length },
      activity: { logsThisWeek: auditLogsFixture.length },
    };
    return {
      reportType,
      generatedAt: new Date().toISOString(),
      summary: base[reportType] || {},
    };
  }, { latency: 700 });
}

// ---- Profile ----

export async function fetchAdminProfile() {
  return mockRequest(adminProfileFixture);
}

// ---- Unique features ----

// AI Command Center — a compact synthesized feed for the dashboard's
// signature panel.
export async function fetchCommandCenterFeed() {
  const allUsers = directoryStore;
  return mockRequest(() => [
    `${systemStatusFixture.onlineUsers.toLocaleString()} users online right now.`,
    `${allUsers.filter((u) => u.status === 'disabled').length} accounts currently disabled.`,
    `AI Assistant Service is reporting degraded performance — investigate if it persists.`,
    `${platformStatsFixture.totalCampaigns} campaigns currently running platform-wide.`,
  ]);
}

// Platform Health Score — composite score from system health, uptime,
// and disabled-account ratio.
export async function fetchPlatformHealthScore() {
  const allUsers = directoryStore;
  return mockRequest(() => {
    const disabledRatio = allUsers.filter((u) => u.status === 'disabled').length / allUsers.length;
    const score = Math.round(systemStatusFixture.systemHealth * 0.5 + platformStatsFixture.systemUptimePercent * 0.4 + (1 - disabledRatio) * 100 * 0.1);
    return {
      score: Math.max(0, Math.min(100, score)),
      breakdown: [
        { label: 'System health', value: systemStatusFixture.systemHealth },
        { label: 'Uptime', value: platformStatsFixture.systemUptimePercent },
        { label: 'Account health', value: Math.round((1 - disabledRatio) * 100) },
      ],
    };
  });
}

// Live Activity Feed — most recent audit log entries, chronological.
export async function fetchLiveActivityFeed() {
  return mockRequest(() => [...auditLogsFixture].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
}

// Global Search — searches across users, facilities, campaigns
// (via the campaigns fixture directly, read-only for search purposes)
// and diseases in one call.
export async function globalSearch(query) {
  const q = query.trim().toLowerCase();
  if (!q) return { users: [], facilities: [], diseases: [] };
  const allUsers = directoryStore;
  return mockRequest(() => ({
    users: allUsers.filter((u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)).slice(0, 5),
    facilities: facilityStore.filter((f) => f.name.toLowerCase().includes(q)).slice(0, 5),
    diseases: diseaseStore.filter((d) => d.name.toLowerCase().includes(q)).slice(0, 5),
  }));
}

// Suspicious Activity Detection — mock flags derived from login
// patterns in the audit log.
export async function fetchSuspiciousActivity() {
  return mockRequest(() => [
    { id: 'susp_1', label: 'Multiple failed login attempts detected for a pharmacist account', severity: 'Medium' },
    { id: 'susp_2', label: 'Unusual login location flagged for an ASHA worker account', severity: 'Low' },
  ]);
}

// AI Recommendations — general platform-improvement suggestions.
export async function fetchAIRecommendations() {
  return mockRequest(() => [
    'Re-engage 1,200+ citizen accounts inactive for 30+ days with a targeted awareness push.',
    'Consider scaling AI Assistant Service capacity — usage grew 18% this month.',
    'Two pharmacist accounts have been disabled for over 60 days — review for cleanup.',
  ]);
}

// ---- Backup (Settings > Backup, admin-only) ----

let lastBackupAt = '2026-07-04T22:00:00+05:30';

export async function fetchBackupStatus() {
  return mockRequest(() => ({
    lastBackupAt,
    schedule: 'Daily at 10:00 PM IST',
    sizeGb: 4.2,
  }));
}

export async function triggerManualBackup() {
  return mockRequest(() => {
    lastBackupAt = new Date().toISOString();
    return { lastBackupAt };
  }, { latency: 1200 });
}

const ADMIN_INSIGHT_TOPICS = {
  platformHealth: 'Overall platform health is strong at current levels, with the AI Assistant Service being the only component showing degraded performance — worth monitoring closely.',
  suspiciousActivity: 'A small number of accounts show login patterns worth reviewing, including repeated failed attempts and logins from unfamiliar locations.',
  userGrowth: 'User growth has been steady, with citizen sign-ups as the primary driver. Projecting continued growth if current campaign cadence holds.',
  diseaseTrend: 'Disease case volume has fluctuated seasonally, with a recent uptick likely tied to vector-borne illness season — align campaign timing accordingly.',
  campaignSuggestion: 'Blood donation camps have historically lower reach than awareness campaigns — consider pairing them with a broader awareness push to boost turnout.',
  resourceOptimization: 'Hospitals nearing capacity should be prioritized for resource reallocation — Sulur Community Health Centre is the most urgent right now.',
};

export async function sendAdminInsightQuery({ message, topic }) {
  return mockRequest(() => ({
    id: `amsg_${Date.now()}`,
    role: 'assistant',
    content:
      ADMIN_INSIGHT_TOPICS[topic] ||
      "I can help with platform health, suspicious activity detection, user growth prediction, disease trend prediction, campaign suggestions, and resource optimization. Select a topic or ask a question.",
    inReplyTo: message,
  }), { latency: 850 });
}
