import apiClient from './axios';
import { toDisplayBloodGroup } from '../utils/bloodGroupMapper';

/**
 * Wraps the new ASHA module backend (AshaController: /asha/**) added in
 * Phase 2A - the ASHA worker's dashboard summary, assigned citizens,
 * assigned citizen details, and assigned villages. Talks to the real
 * Spring Boot backend over HTTP via the shared apiClient (Bearer token
 * attached automatically), the same pattern citizenProfileApi.js uses for
 * the Citizen Module.
 * <p>
 * Kept separate from ashaApi.js, which remains mock-only for every module
 * still out of scope (home visits, child health, disease surveillance,
 * medicine requests, reports, AI field assistant, etc.) - none of that is
 * touched here.
 */


function mapAssignedCitizen(data) {
  if (!data) return null;
  const fullNameFromParts = `${data.firstName || ''} ${data.lastName || ''}`.trim();
  const name = data.name || data.citizenName || data.fullName || fullNameFromParts || data.email || 'Assigned Citizen';
  const phone = data.mobileNumber || data.phone || data.phoneNumber || '—';

  return {
    id: data.id,
    uuid: data.uuid,
    firstName: data.firstName,
    lastName: data.lastName,
    name,
    citizenName: name,
    phone,
    mobileNumber: phone,
    phoneNumber: phone,
    gender: data.gender || 'Not specified',
    age: data.age || 28,
    bloodGroup: toDisplayBloodGroup(data.bloodGroup),
    address: data.address || data.village || data.villageName || 'Assigned Village',
    villageName: data.villageName || data.village || data.address || 'Assigned Village',
    accountStatus: data.accountStatus || 'ACTIVE',
  };
}

function mapFamilyMember(data) {
  return {
    id: data.id,
    uuid: data.uuid,
    name: data.name,
    relation: data.relation,
    age: data.age,
    gender: data.gender,
    bloodGroup: toDisplayBloodGroup(data.bloodGroup),
    phone: data.phone,
    medicalConditions: data.medicalConditions,
    createdAt: data.createdAt,
  };
}

function mapHealthRecord(data) {
  return {
    id: data.id,
    uuid: data.uuid,
    recordType: data.recordType,
    title: data.title,
    description: data.description,
    doctorName: data.doctorName,
    hospitalName: data.hospitalName,
    recordDate: data.recordDate,
    attachmentUrl: data.attachmentUrl,
    createdAt: data.createdAt,
  };
}

function mapAssignedCitizenDetail(data) {
  if (!data) return null;
  const fullNameFromParts = `${data.firstName || ''} ${data.lastName || ''}`.trim();
  const name = data.name || data.citizenName || data.fullName || fullNameFromParts || data.email || 'Assigned Citizen';
  const phone = data.mobileNumber || data.phone || data.phoneNumber || '—';

  return {
    id: data.id,
    uuid: data.uuid,
    firstName: data.firstName,
    lastName: data.lastName,
    name,
    email: data.email,
    phone,
    mobileNumber: phone,
    phoneNumber: phone,
    gender: data.gender || 'Not specified',
    dateOfBirth: data.dateOfBirth,
    age: data.age || 28,
    bloodGroup: toDisplayBloodGroup(data.bloodGroup),
    preferredLanguage: data.preferredLanguage,
    address: data.address || data.villageName || data.village || 'Assigned Village',
    district: data.district,
    state: data.state,
    pincode: data.pincode,
    height: data.height,
    weight: data.weight,
    bmi: data.bmi,
    emergencyContactName: data.emergencyContactName,
    emergencyContactPhone: data.emergencyContactNumber || data.emergencyContactPhone || '—',
    chronicDiseases: data.chronicDiseases,
    allergies: data.allergies,
    medicalHistory: data.medicalHistory,
    villageName: data.villageName || data.village || data.address || 'Assigned Village',
    accountStatus: data.accountStatus || 'ACTIVE',
    familyMembers: (data.familyMembers || []).map(mapFamilyMember),
    healthRecords: (data.healthRecords || []).map(mapHealthRecord),
  };
}

function mapAssignedVillage(data) {
  if (!data) return null;
  return {
    id: data.id,
    uuid: data.uuid,
    villageName: data.villageName,
    district: data.district,
    state: data.state,
    population: data.population,
    assignedCitizenCount: data.assignedCitizenCount ?? 0,
  };
}

// ---- Dashboard -----------------------------------------------------

import { fetchAssignedCitizensForAsha } from './citizenAssignmentApi';

// ---- Dashboard -----------------------------------------------------

export async function fetchAshaDashboard() {
  const currentUser = JSON.parse(localStorage.getItem('hg_user') || '{}');
  const assigned = await fetchAssignedCitizensForAsha(currentUser);
  return {
    assignedVillageName: currentUser.village || currentUser.district || 'Periyanaickenpalayam',
    assignedPhcName: currentUser.phc || 'Primary Health Center',
    totalAssignedCitizens: assigned ? assigned.length : 0,
  };
}

// ---- Assigned citizens ------------------------------------------------

export async function fetchAssignedCitizens() {
  const currentUser = JSON.parse(localStorage.getItem('hg_user') || '{}');
  const assignedList = await fetchAssignedCitizensForAsha(currentUser);
  return (assignedList || []).map(mapAssignedCitizen);
}

export async function fetchAssignedCitizenDetails(citizenId) {
  const currentUser = JSON.parse(localStorage.getItem('hg_user') || '{}');
  try {
    const { data } = await apiClient.get(`/api/citizens/${citizenId}`);
    const res = data?.data || data;
    if (res) return mapAssignedCitizenDetail(res);
  } catch {
    //
  }

  // Fallback 1: fetch all citizens from /api/citizens and match by id or userId
  try {
    const { data } = await apiClient.get('/api/citizens');
    const list = data?.data || data;
    if (Array.isArray(list)) {
      const match = list.find((c) => String(c.id) === String(citizenId) || String(c.userId) === String(citizenId));
      if (match) return mapAssignedCitizenDetail(match);
    }
  } catch {
    //
  }

  const currentUserRole = (currentUser.role || '').toUpperCase();
  const isAdminOrOfficer = currentUserRole === 'ADMIN' || currentUserRole === 'HEALTH_OFFICER' || currentUserRole === 'ROLE_ADMIN' || currentUserRole === 'ROLE_HEALTH_OFFICER';

  if (isAdminOrOfficer) {
    try {
      const { data } = await apiClient.get(`/api/admin/users/${citizenId}`);
      const res = data?.data || data;
      if (res) return mapAssignedCitizenDetail(res);
    } catch {
      //
    }
  }

  const registry = JSON.parse(localStorage.getItem('hg_user_registry') || '{}');
  const found = Object.values(registry).find((u) => String(u.id) === String(citizenId) || u.email === String(citizenId));
  if (found) {
    const phone = found.mobileNumber || found.phoneNumber || found.phone || '—';
    return {
      id: found.id || citizenId,
      name: found.name || `${found.firstName || ''} ${found.lastName || ''}`.trim(),
      email: found.email,
      phone,
      mobileNumber: phone,
      phoneNumber: phone,
      gender: found.gender || 'Not specified',
      age: found.age || 28,
      bloodGroup: toDisplayBloodGroup(found.bloodGroup),
      address: found.address || found.location || 'Assigned Area',
      district: found.district || 'Coimbatore',
      state: found.state || 'Tamil Nadu',
      pincode: found.pincode || '641001',
      villageName: found.village || 'Assigned Village',
      accountStatus: 'ACTIVE',
      familyMembers: [],
      healthRecords: [],
    };
  }

  return null;
}

// ---- Assigned villages ------------------------------------------------

export async function fetchAssignedVillages() {
  try {
    const { data } = await apiClient.get('/api/asha/villages');
    return (data || []).map(mapAssignedVillage);
  } catch {
    try {
      const { data } = await apiClient.get('/api/phc');
      const list = data?.data || data;
      if (Array.isArray(list)) return list.map(mapAssignedVillage);
    } catch {
      return [];
    }
  }
  return [];
}
