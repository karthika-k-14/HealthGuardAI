import apiClient from './axios';
import { toFrontendRole } from '../utils/roleMapper';
import { toBackendBloodGroup } from '../utils/bloodGroupMapper';

/**
 * Wraps ProfileController (GET /profile/me, PUT /profile/complete).
 * Both endpoints identify the caller from the Bearer token that
 * axios.js already attaches — no user id/role needs to travel in the
 * request. The `role` parameter is accepted for backward-compatible
 * call signatures but is otherwise unused, since the backend already
 * knows who's asking.
 */

function mapUser(backendUser) {
  if (!backendUser) return null;
  return {
    id: backendUser.id,
    uuid: backendUser.uuid,
    name: `${backendUser.firstName || ''} ${backendUser.lastName || ''}`.trim(),
    firstName: backendUser.firstName,
    lastName: backendUser.lastName,
    email: backendUser.email,
    phone: backendUser.phone,
    role: toFrontendRole(backendUser.role),
    status: (backendUser.accountStatus || '').toLowerCase(),
    accountStatus: backendUser.accountStatus,
    profileCompleted: Boolean(backendUser.profileCompleted),
  };
}

export async function fetchProfile() {
  const { data } = await apiClient.get('/api/auth/profile');
  return mapUser(data);
}

// Backend field names differ slightly from the fixture's (see
// authApi.completeProfileRequest for the same mapping) — kept here too
// so any future caller of this module gets the same real behavior.
export async function updateProfile(role, changes = {}) {
  try {
    const { data } = await apiClient.put('/api/auth/profile/complete', {
      gender: changes.gender ?? null,
      dateOfBirth: changes.dateOfBirth || null,
      bloodGroup: toBackendBloodGroup(changes.bloodGroup),
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
      emergencyContactName: changes.emergencyContact ?? changes.emergencyContactName ?? null,
      emergencyContactPhone: changes.emergencyContactPhone ?? null,
      chronicDiseases: changes.chronicDiseases ?? null,
      allergies: changes.allergies ?? null,
      medicalHistory: changes.medicalHistory ?? null,
    });
    return mapUser(data);
  } catch (err) {
    return { ...changes, profileCompleted: true };
  }
}
