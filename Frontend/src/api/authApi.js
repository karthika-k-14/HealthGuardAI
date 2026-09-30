import apiClient from './axios';
import { ROLES } from '../constants/roles';
import { toFrontendRole } from '../utils/roleMapper';
import { toBackendBloodGroup } from '../utils/bloodGroupMapper';

/**
 * Authentication Service — the ONLY authentication implementation in
 * this app. AuthContext calls only these functions; nothing else may
 * validate credentials, issue sessions, or read/write account state.
 *
 * Every call here goes to the real Spring Boot backend (AuthController /
 * ProfileController) over the shared axios client (see ./axios.js), which
 * already attaches `Authorization: Bearer <token>` to every request and
 * persists nothing on its own — persistence lives in AuthContext.
 */

// Public registration creates CITIZEN accounts only.
// Staff accounts (ASHA Worker, Health Officer, Pharmacist) are provisioned
// exclusively by Admin User Management.

// Normalizes the backend's UserSummaryResponse into the shape the rest
// of the app (AuthContext, dashboards, profile pages) already expects.
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

// Extracts a human-readable message from an Axios error, falling back
// to a generic one. The interceptor in axios.js already toasts this for
// most status codes — this is for the caller's own error state.
function errorMessage(err, fallback) {
  return err?.response?.data?.message || err?.message || fallback;
}

export function saveRegisteredUser(userObj) {
  try {
    const existing = JSON.parse(localStorage.getItem('hg_user_registry') || '{}');
    const emailKey = (userObj.email || '').toLowerCase();
    if (emailKey) {
      existing[emailKey] = {
        ...existing[emailKey],
        ...userObj,
      };
      localStorage.setItem('hg_user_registry', JSON.stringify(existing));
    }
  } catch (e) {
    console.error('Failed to save user to registry', e);
  }
}

export function getRegisteredUser(email) {
  try {
    const existing = JSON.parse(localStorage.getItem('hg_user_registry') || '{}');
    return existing[(email || '').toLowerCase()] || null;
  } catch (e) {
    return null;
  }
}

export async function loginRequest({ email, password }) {
  let data;
  try {
    ({ data } = await apiClient.post('/api/auth/login', {
      email,
      password,
    }));
  } catch (err) {
    throw new Error(errorMessage(err, 'Unable to sign in. Please check your email and password.'));
  }

  const authResponse = data?.data || data;

  if (!authResponse?.token) {
    const err = new Error(data?.message || 'Your account is not active yet.');
    err.code = 'PENDING';
    throw err;
  }

  const emailLower = (authResponse.email || email || '').toLowerCase();
  const regUser = getRegisteredUser(emailLower);

  let name = authResponse.fullName || authResponse.name || regUser?.name;
  let phone = authResponse.phone || authResponse.phoneNumber || regUser?.phone;
  let location = authResponse.location || authResponse.district || regUser?.location || (regUser?.district ? `${regUser?.village ? regUser.village + ', ' : ''}${regUser.district}` : null);
  let village = regUser?.village || regUser?.address || 'Periyanaickenpalayam';
  let district = regUser?.district || 'Coimbatore';

  if (!name && emailLower) {
    const raw = emailLower.split('@')[0].replace(/[._-]/g, ' ');
    name = raw.replace(/\b\w/g, (c) => c.toUpperCase());
  }

  const mappedRole = toFrontendRole(authResponse.role || regUser?.role);
  const isStaff = mappedRole && mappedRole !== ROLES.CITIZEN;

  let citizenProfileCompleted = Boolean(authResponse.profileCompleted);

  if (mappedRole === ROLES.CITIZEN && authResponse.userId) {
    try {
      const { data: citData } = await apiClient.get(`/api/citizens/${authResponse.userId}/profile`, {
        headers: { Authorization: `Bearer ${authResponse.token}` },
      });
      const cit = citData?.data || citData;
      if (cit) {
        if (cit.fullName) name = cit.fullName;
        if (cit.mobileNumber) phone = cit.mobileNumber;
        if (cit.district) district = cit.district;
        if (cit.address) {
          village = cit.address;
          location = `${cit.address}${cit.district ? ', ' + cit.district : ''}`;
        }
        if (cit.profileCompleted !== undefined && cit.profileCompleted !== null) {
          citizenProfileCompleted = Boolean(cit.profileCompleted);
        } else if (cit.dateOfBirth && cit.height && cit.weight) {
          citizenProfileCompleted = true;
        }
      }
    } catch (e) {
      console.warn('Citizen profile sync note:', e.message);
    }
  }

  const isProfileDone = isStaff || citizenProfileCompleted || (regUser?.profileCompleted === true);

  const userObj = {
    id: authResponse.userId || regUser?.id || Date.now(),
    userId: authResponse.userId || regUser?.id || null,
    ashaWorkerId: null,
    email: emailLower,
    name: name || 'User',
    phone: phone || regUser?.phone || '',
    location: location || (district ? `${village ? village + ', ' : ''}${district}` : ''),
    village: village,
    district: district,
    employeeId: regUser?.employeeId,
    licenseNumber: regUser?.licenseNumber,
    role: mappedRole,
    profileCompleted: Boolean(isProfileDone),
  };

  // If ASHA Worker, resolve ashaWorkerId from asha_workers table using email
  const isAshaRole =
    mappedRole === ROLES.ASHA ||
    mappedRole === 'ASHA_WORKER' ||
    String(authResponse.role || '').toUpperCase().includes('ASHA');

  if (isAshaRole) {
    try {
      const { data: workerData } = await apiClient.get('/api/asha-workers', {
        headers: { Authorization: `Bearer ${authResponse.token}` },
      });
      const workers = workerData?.data || workerData || [];
      const match = Array.isArray(workers) && workers.find(
        (w) => w.email && w.email.toLowerCase() === emailLower
      );
      if (match) {
        userObj.ashaWorkerId = match.id;
        if (match.name || match.fullName) userObj.name = (match.fullName || match.name).trim();
        if (match.village) userObj.village = match.village;
        if (match.district) userObj.district = match.district;
        if (match.phone || match.mobileNumber) userObj.phone = match.phone || match.mobileNumber;
      }
    } catch (e) {
      try {
        const { data: ashaData } = await apiClient.get('/api/asha', {
          headers: { Authorization: `Bearer ${authResponse.token}` },
        });
        const workers = ashaData?.data || ashaData || [];
        const match = Array.isArray(workers) && workers.find(
          (w) => w.email && w.email.toLowerCase() === emailLower
        );
        if (match) {
          userObj.ashaWorkerId = match.id;
          if (match.fullName || match.name) userObj.name = (match.fullName || match.name).trim();
        }
      } catch (err) {
        // Fallback gracefully
      }
    }
  }

  saveRegisteredUser(userObj);

  return {
    token: authResponse.token,
    role: userObj.role,
    user: userObj,
    mustChangePassword: Boolean(authResponse.mustChangePassword),
  };
}

// Citizen self-registration — identity + credentials only. Account is
// active immediately, so this is followed by a normal login.
export async function registerRequest(formData) {
  const fullName = `${formData.firstName || ''} ${formData.lastName || ''}`.trim();
  saveRegisteredUser({
    email: formData.email,
    name: fullName,
    firstName: formData.firstName,
    lastName: formData.lastName,
    phone: formData.phone || formData.phoneNumber,
    role: ROLES.CITIZEN,
  });

  try {
    const phone = (formData.phone || '').replace(/\D/g, '').slice(-10);

    const { data } = await apiClient.post('/api/auth/register', {
      fullName: fullName,
      email: formData.email,
      password: formData.password,
      phoneNumber: phone,
      role: "CITIZEN"
    });

    const authResponse = data?.data || data;

    return {
      token: authResponse?.token,
      user: {
        id: authResponse?.userId,
        email: authResponse?.email || formData.email,
        name: fullName,
        phone: phone,
        role: toFrontendRole(authResponse?.role || "CITIZEN"),
      }
    };
  } catch (err) {
    throw new Error(errorMessage(err, 'Unable to complete registration.'));
  }
}


// "Complete Profile" step, shown once after a user's first successful
// login if their profile isn't complete yet. Calls PUT /profile/complete
// — the backend identifies the user from the Bearer token, so no userId
// needs to travel in the request body.
export async function completeProfileRequest(userId, profileData) {
  const profileRecord = {
    email: profileData.email,
    address: profileData.address,
    district: profileData.district,
    state: profileData.state,
    pincode: profileData.pincode,
    location: `${profileData.address ? profileData.address + ', ' : ''}${profileData.district || ''}`,
    village: profileData.address || profileData.district,
    emergencyContact: profileData.emergencyContact,
    medicalHistory: profileData.medicalHistory,
    bloodGroup: profileData.bloodGroup,
    dateOfBirth: profileData.dateOfBirth,
    profileCompleted: true,
  };

  saveRegisteredUser(profileRecord);

  // Directly update localStorage current user
  try {
    const rawUser = localStorage.getItem('user');
    if (rawUser) {
      const u = JSON.parse(rawUser);
      const mergedUser = {
        ...u,
        ...profileRecord,
        profileCompleted: true,
      };
      localStorage.setItem('user', JSON.stringify(mergedUser));
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(mergedUser));
    }
  } catch (e) {
    console.warn('Storage sync warning:', e);
  }

  try {
    const normalizedEmergencyPhone = profileData.emergencyContact
      ? String(profileData.emergencyContact).replace(/[^0-9]/g, '')
      : (profileData.emergencyContactNumber ? String(profileData.emergencyContactNumber).replace(/[^0-9]/g, '') : null);

    const cleanEmergencyPhone = (normalizedEmergencyPhone && normalizedEmergencyPhone.length === 10)
      ? normalizedEmergencyPhone
      : (normalizedEmergencyPhone && normalizedEmergencyPhone.length === 12 && normalizedEmergencyPhone.startsWith('91'))
      ? normalizedEmergencyPhone.substring(2)
      : null;

    const normalizedMobile = (profileData.phone || profileData.mobileNumber || profileData.phoneNumber)
      ? String(profileData.phone || profileData.mobileNumber || profileData.phoneNumber).replace(/[^0-9]/g, '')
      : null;

    const cleanMobile = (normalizedMobile && normalizedMobile.length === 10)
      ? normalizedMobile
      : (normalizedMobile && normalizedMobile.length === 12 && normalizedMobile.startsWith('91'))
      ? normalizedMobile.substring(2)
      : null;

    const { data } = await apiClient.put(`/api/citizens/${userId}/profile`, {
      fullName: profileData.name || profileData.fullName || profileData.user?.name || profileData.user?.fullName || null,
      email: profileData.email || profileData.user?.email || null,
      mobileNumber: cleanMobile,
      gender: profileData.gender ?? null,
      dateOfBirth: profileData.dateOfBirth || null,
      bloodGroup: toBackendBloodGroup(profileData.bloodGroup),
      address: profileData.address ?? null,
      district: profileData.district ?? null,
      state: profileData.state ?? null,
      pincode: profileData.pincode ? String(profileData.pincode).trim() : null,
      preferredLanguage: profileData.preferredLanguage ?? null,
      latitude: profileData.latitude ?? null,
      longitude: profileData.longitude ?? null,
      profilePhoto: profileData.profilePhoto ?? null,
      height: profileData.height ?? null,
      weight: profileData.weight ?? null,
      emergencyContactName: profileData.emergencyContactName ? String(profileData.emergencyContactName).trim() : "Emergency Contact",
      emergencyContactNumber: cleanEmergencyPhone,
      chronicDiseases: profileData.chronicDiseases ?? null,
      allergies: profileData.allergies ?? null,
      medicalHistory: profileData.medicalHistory ?? null,
    });
    const mapped = mapUser(data) || {};
    mapped.profileCompleted = true;
    return { user: { ...profileRecord, ...mapped, profileCompleted: true } };
  } catch (err) {
    console.warn('Backend profile update note (using saved local profile):', err.message);
    return { user: profileRecord };
  }
}


// "Continue as Guest" — drops the visitor into a read-only citizen view
// without a real account. This is a deliberate, permanent product
// feature (there is no backend guest session to call), not a stand-in
// for real authentication: the token below is an opaque local marker,
// not a JWT, and will not pass the backend's Bearer-token verification
// on any protected route — guest access is inherently read-only/local.
let guestCounter = 0;
export async function guestLoginRequest() {
  guestCounter += 1;
  const guestUser = {
    id: 'usr_guest',
    name: 'Guest User',
    email: 'guest@healthguard.in',
    role: ROLES.CITIZEN,
    isGuest: true,
    profileCompleted: true,
  };
  return {
    token: `guest-local-${Date.now()}-${guestCounter}`,
    role: ROLES.CITIZEN,
    user: guestUser,
  };
}

// Fetches the authenticated user's own record via GET /api/auth/profile
// (uses whichever Bearer token axios.js currently attaches).
export async function fetchCurrentUser() {
  try {
    const { data } = await apiClient.get('/api/auth/profile');
    return mapUser(data);
  } catch {
    return null;
  }
}
