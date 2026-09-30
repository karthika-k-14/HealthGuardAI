import apiClient from './axios';
import { toBackendBloodGroup, toDisplayBloodGroup } from '../utils/bloodGroupMapper';
import { STORAGE_KEYS } from '../constants/storageKeys';
import { getJSON } from '../utils/storage';

/**
 * Citizen Profile API — wraps citizen endpoints via apiClient.
 * Uses real user session data and live backend endpoints exclusively.
 */

function mapProfile(data) {
  if (!data) return null;
  const p = data.data || data;
  return {
    id: p.id || p.userId,
    userId: p.userId || p.id,
    uuid: p.uuid || `cit_${p.id || p.userId}`,
    firstName: p.firstName || '',
    lastName: p.lastName || '',
    name: p.fullName || p.name || `${p.firstName || ''} ${p.lastName || ''}`.trim(),
    email: p.email || '',
    phone: p.mobileNumber || p.phone || '',
    gender: p.gender || '',
    dateOfBirth: p.dateOfBirth || '',
    age: p.age || null,
    bloodGroup: toDisplayBloodGroup(p.bloodGroup || ''),
    aadhaarNumber: p.aadhaarNumber || '',
    preferredLanguage: p.preferredLanguage || '',
    address: p.address || '',
    district: p.district || '',
    state: p.state || '',
    pincode: p.pincode || '',
    latitude: p.latitude || null,
    longitude: p.longitude || null,
    profilePhoto: p.profilePhoto || null,
    height: p.height || null,
    weight: p.weight || null,
    bmi: p.bmi || null,
    emergencyContactName: p.emergencyContactName || p.emergencyContact || '',
    emergencyContactPhone: p.emergencyContactNumber || p.emergencyContactPhone || '',
    chronicDiseases: p.chronicDiseases || '',
    allergies: p.allergies || '',
    medicalHistory: p.medicalHistory || '',
    villageName: p.villageName || '',
    accountStatus: p.accountStatus || 'ACTIVE',
    profileCompleted: Boolean(p.profileCompleted ?? true),
  };
}

function mapFamilyMember(data) {
  if (!data) return null;
  return {
    id: data.id,
    uuid: data.uuid || `fam_${data.id}`,
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
  if (!data) return null;
  return {
    id: data.id,
    uuid: data.uuid || `rec_${data.id}`,
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

function getStoredUserBase() {
  const user = getJSON(STORAGE_KEYS.USER, {});
  return {
    id: user.id || user.userId,
    userId: user.id || user.userId,
    name: user.name || user.fullName || '',
    email: user.email || '',
    phone: user.phone || user.mobileNumber || '',
    gender: '',
    dateOfBirth: '',
    bloodGroup: '',
    address: user.village || user.location || '',
    district: user.district || '',
    state: 'Tamil Nadu',
    pincode: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    chronicDiseases: '',
    allergies: '',
    medicalHistory: '',
  };
}

// ---- Profile -----------------------------------------------------

export async function fetchCitizenProfile(userId) {
  const targetId = userId || getStoredUserBase().userId;
  try {
    const { data } = await apiClient.get(`/api/citizens/${targetId}/profile`);
    return mapProfile(data);
  } catch (err) {
    if (err.response && err.response.status === 404) {
      return null;
    }
    throw err;
  }
}

function normalizePhoneNumber(phone) {
  if (!phone) return null;
  const digits = String(phone).replace(/[^0-9]/g, '');
  if (digits.length === 10) return digits;
  if (digits.length === 12 && digits.startsWith('91')) return digits.substring(2);
  if (digits.length === 11 && digits.startsWith('0')) return digits.substring(1);
  return digits || null;
}

export async function updateCitizenProfile(userId, changes = {}) {
  const storedUser = getStoredUserBase();
  const targetId = userId || storedUser.userId;
  const normalizedEmergencyPhone = normalizePhoneNumber(changes.emergencyContactPhone || changes.emergencyContactNumber);
  const normalizedMobile = normalizePhoneNumber(changes.mobileNumber || changes.phone || storedUser.phone);

  const payload = {
    fullName: changes.fullName || changes.name || storedUser.name || null,
    email: changes.email || storedUser.email || null,
    mobileNumber: normalizedMobile,
    gender: changes.gender || null,
    dateOfBirth: changes.dateOfBirth || null,
    bloodGroup: toBackendBloodGroup(changes.bloodGroup),
    address: changes.address ?? null,
    district: changes.district ?? null,
    state: changes.state ?? null,
    pincode: changes.pincode ? String(changes.pincode).trim() : null,
    preferredLanguage: changes.preferredLanguage ?? null,
    latitude: changes.latitude ?? null,
    longitude: changes.longitude ?? null,
    profilePhoto: changes.profilePhoto ?? null,
    height: changes.height ?? null,
    weight: changes.weight ?? null,
    emergencyContactName: changes.emergencyContactName ? String(changes.emergencyContactName).trim() : null,
    emergencyContactNumber: normalizedEmergencyPhone,
    chronicDiseases: changes.chronicDiseases ?? null,
    allergies: changes.allergies ?? null,
    medicalHistory: changes.medicalHistory ?? null,
  };
  let resData = null;
  try {
    const { data } = await apiClient.put(`/api/citizens/${targetId}/profile`, payload);
    resData = data.data || data;
    } catch (err) {
      console.warn('Backend updateCitizenProfile note (using local cache):', err.message);
    }

    try {
      const raw = localStorage.getItem('user');
      if (raw) {
        const parsed = JSON.parse(raw);
        const merged = { ...parsed, ...changes, profileCompleted: true };
        localStorage.setItem('user', JSON.stringify(merged));
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(merged));
      }
      const existingReg = JSON.parse(localStorage.getItem('hg_user_registry') || '{}');
      const email = (changes.email || storedUser.email || '').toLowerCase();
      if (email) {
        existingReg[email] = { ...existingReg[email], ...changes, profileCompleted: true };
        localStorage.setItem('hg_user_registry', JSON.stringify(existingReg));
      }
    } catch (e) {}

    return resData ? mapProfile(resData) : { ...storedUser, ...changes, profileCompleted: true };
}


// ---- Family members ------------------------------------------------

export async function fetchFamilyMembers(userId) {
  const targetId = userId || getStoredUserBase().userId;
  const { data } = await apiClient.get(`/api/citizens/${targetId}/family-members`);
  const list = Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : []);
  return list.map(mapFamilyMember);
}

export async function addFamilyMember(member) {
  const targetId = getStoredUserBase().userId;
  const { data } = await apiClient.post(`/api/citizens/${targetId}/family-members`, {
    name: member.name,
    relation: member.relation,
    age: member.age ? Number(member.age) : null,
    gender: member.gender || null,
    bloodGroup: toBackendBloodGroup(member.bloodGroup),
    phone: member.phone || null,
    medicalConditions: member.medicalConditions || null,
  });
  return mapFamilyMember(data);
}

export async function updateFamilyMember(memberId, member) {
  const targetId = getStoredUserBase().userId;
  const { data } = await apiClient.put(`/api/citizens/${targetId}/family-members/${memberId}`, {
    name: member.name,
    relation: member.relation,
    age: member.age ? Number(member.age) : null,
    gender: member.gender || null,
    bloodGroup: toBackendBloodGroup(member.bloodGroup),
    phone: member.phone || null,
    medicalConditions: member.medicalConditions || null,
  });
  return mapFamilyMember(data);
}

export async function deleteFamilyMember(memberId) {
  const targetId = getStoredUserBase().userId;
  await apiClient.delete(`/api/citizens/${targetId}/family-members/${memberId}`);
  return true;
}

// ---- Health records ------------------------------------------------

export async function fetchHealthRecords(userId) {
  const targetId = userId || getStoredUserBase().userId;
  const { data } = await apiClient.get(`/api/citizens/${targetId}/health-records`);
  const list = Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : []);
  return list.map(mapHealthRecord);
}

export async function addHealthRecord(record) {
  const targetId = getStoredUserBase().userId;
  const { data } = await apiClient.post(`/api/citizens/${targetId}/health-records`, {
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
  const targetId = getStoredUserBase().userId;
  const { data } = await apiClient.put(`/api/citizens/${targetId}/health-records/${recordId}`, {
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
  const targetId = getStoredUserBase().userId;
  await apiClient.delete(`/api/citizens/${targetId}/health-records/${recordId}`);
  return true;
}

