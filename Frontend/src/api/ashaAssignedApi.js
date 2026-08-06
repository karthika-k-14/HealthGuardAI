import apiClient from './axios';

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

function mapDashboard(data) {
  if (!data) return null;
  return {
    id: data.id,
    uuid: data.uuid,
    firstName: data.firstName,
    lastName: data.lastName,
    name: `${data.firstName || ''} ${data.lastName || ''}`.trim(),
    employeeId: data.employeeId,
    status: data.status,
    assignedVillageId: data.assignedVillageId,
    assignedVillageName: data.assignedVillageName,
    assignedVillageDistrict: data.assignedVillageDistrict,
    assignedPhcName: data.assignedPhcName,
    totalAssignedCitizens: data.totalAssignedCitizens ?? 0,
  };
}

function mapAssignedCitizen(data) {
  if (!data) return null;
  return {
    id: data.id,
    uuid: data.uuid,
    firstName: data.firstName,
    lastName: data.lastName,
    name: `${data.firstName || ''} ${data.lastName || ''}`.trim(),
    phone: data.phone,
    gender: data.gender,
    age: data.age,
    bloodGroup: data.bloodGroup,
    address: data.address,
    villageName: data.villageName,
    accountStatus: data.accountStatus,
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
    bloodGroup: data.bloodGroup,
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
  return {
    id: data.id,
    uuid: data.uuid,
    firstName: data.firstName,
    lastName: data.lastName,
    name: `${data.firstName || ''} ${data.lastName || ''}`.trim(),
    email: data.email,
    phone: data.phone,
    gender: data.gender,
    dateOfBirth: data.dateOfBirth,
    age: data.age,
    bloodGroup: data.bloodGroup,
    preferredLanguage: data.preferredLanguage,
    address: data.address,
    district: data.district,
    state: data.state,
    pincode: data.pincode,
    height: data.height,
    weight: data.weight,
    bmi: data.bmi,
    emergencyContactName: data.emergencyContactName,
    emergencyContactPhone: data.emergencyContactPhone,
    chronicDiseases: data.chronicDiseases,
    allergies: data.allergies,
    medicalHistory: data.medicalHistory,
    villageName: data.villageName,
    accountStatus: data.accountStatus,
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

export async function fetchAshaDashboard() {
  const { data } = await apiClient.get('/asha/dashboard');
  return mapDashboard(data);
}

// ---- Assigned citizens ------------------------------------------------

export async function fetchAssignedCitizens() {
  const { data } = await apiClient.get('/asha/citizens');
  return (data || []).map(mapAssignedCitizen);
}

export async function fetchAssignedCitizenDetails(citizenId) {
  const { data } = await apiClient.get(`/asha/citizens/${citizenId}`);
  return mapAssignedCitizenDetail(data);
}

// ---- Assigned villages ------------------------------------------------

export async function fetchAssignedVillages() {
  const { data } = await apiClient.get('/asha/villages');
  return (data || []).map(mapAssignedVillage);
}
