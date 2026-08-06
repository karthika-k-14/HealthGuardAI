import apiClient from './axios';

/**
 * Wraps the new Citizen Module backend (CitizenController: /citizen/**).
 * Unlike citizenApi.js (still mock-only AI demo widgets) and profileApi.js
 * (the generic one-time Complete Profile step shared by every role), this
 * module is the citizen-specific surface for ongoing profile, family
 * member, and health record management, and talks to the real backend
 * over HTTP via the shared apiClient (Bearer token attached automatically).
 */

function mapProfile(data) {
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
    aadhaarNumber: data.aadhaarNumber,
    preferredLanguage: data.preferredLanguage,
    address: data.address,
    district: data.district,
    state: data.state,
    pincode: data.pincode,
    latitude: data.latitude,
    longitude: data.longitude,
    profilePhoto: data.profilePhoto,
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
    profileCompleted: Boolean(data.profileCompleted),
  };
}

function mapFamilyMember(data) {
  if (!data) return null;
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
  if (!data) return null;
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

// ---- Profile -----------------------------------------------------

export async function fetchCitizenProfile() {
  const { data } = await apiClient.get('/citizen/profile');
  return mapProfile(data);
}

export async function updateCitizenProfile(changes = {}) {
  const { data } = await apiClient.put('/citizen/profile', {
    gender: changes.gender || null,
    dateOfBirth: changes.dateOfBirth || null,
    bloodGroup: changes.bloodGroup || null,
    address: changes.address ?? null,
    district: changes.district ?? null,
    state: changes.state ?? null,
    pincode: changes.pincode ?? null,
    preferredLanguage: changes.preferredLanguage ?? null,
    latitude: changes.latitude ?? null,
    longitude: changes.longitude ?? null,
    profilePhoto: changes.profilePhoto ?? null,
    height: changes.height ?? null,
    weight: changes.weight ?? null,
    emergencyContactName: changes.emergencyContactName ?? null,
    emergencyContactPhone: changes.emergencyContactPhone ?? null,
    chronicDiseases: changes.chronicDiseases ?? null,
    allergies: changes.allergies ?? null,
    medicalHistory: changes.medicalHistory ?? null,
  });
  return mapProfile(data);
}

// ---- Family members ------------------------------------------------

export async function fetchFamilyMembers() {
  const { data } = await apiClient.get('/citizen/family-members');
  return (data || []).map(mapFamilyMember);
}

export async function addFamilyMember(member) {
  const { data } = await apiClient.post('/citizen/family-members', {
    name: member.name,
    relation: member.relation,
    age: member.age ? Number(member.age) : null,
    gender: member.gender || null,
    bloodGroup: member.bloodGroup || null,
    phone: member.phone || null,
    medicalConditions: member.medicalConditions || null,
  });
  return mapFamilyMember(data);
}

export async function updateFamilyMember(memberId, member) {
  const { data } = await apiClient.put(`/citizen/family-members/${memberId}`, {
    name: member.name,
    relation: member.relation,
    age: member.age ? Number(member.age) : null,
    gender: member.gender || null,
    bloodGroup: member.bloodGroup || null,
    phone: member.phone || null,
    medicalConditions: member.medicalConditions || null,
  });
  return mapFamilyMember(data);
}

export async function deleteFamilyMember(memberId) {
  await apiClient.delete(`/citizen/family-members/${memberId}`);
  return true;
}

// ---- Health records ------------------------------------------------

export async function fetchHealthRecords() {
  const { data } = await apiClient.get('/citizen/health-records');
  return (data || []).map(mapHealthRecord);
}

export async function addHealthRecord(record) {
  const { data } = await apiClient.post('/citizen/health-records', {
    recordType: record.recordType,
    title: record.title,
    description: record.description || null,
    doctorName: record.doctorName || null,
    hospitalName: record.hospitalName || null,
    recordDate: record.recordDate,
    attachmentUrl: record.attachmentUrl || null,
  });
  return mapHealthRecord(data);
}

export async function updateHealthRecord(recordId, record) {
  const { data } = await apiClient.put(`/citizen/health-records/${recordId}`, {
    recordType: record.recordType,
    title: record.title,
    description: record.description || null,
    doctorName: record.doctorName || null,
    hospitalName: record.hospitalName || null,
    recordDate: record.recordDate,
    attachmentUrl: record.attachmentUrl || null,
  });
  return mapHealthRecord(data);
}

export async function deleteHealthRecord(recordId) {
  await apiClient.delete(`/citizen/health-records/${recordId}`);
  return true;
}
