import apiClient from './axios';
import { ROLES } from '../constants/roles';
import { toFrontendRole } from '../utils/roleMapper';

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

// Frontend staff role -> backend registration path segment.
const STAFF_ROLE_TO_REGISTER_PATH = {
  [ROLES.ASHA]: '/auth/register/asha',
  [ROLES.HEALTH_OFFICER]: '/auth/register/officer',
  [ROLES.PHARMACIST]: '/auth/register/pharmacist',
};

// The backend has no "Staff Access Code" endpoint — Health Officer / ASHA /
// Pharmacist registration is plain self-registration there (role decided
// by which /auth/register/* path is called; account then sits PENDING
// until an Admin approves it via /admin/approvals/*). The StaffAccessCode
// / Register pages, however, are built around a code that determines the
// role *before* any network call, and those pages are out of scope to
// modify. So the role is resolved from the code's prefix, purely as a
// client-side routing hint for which backend endpoint to call — no
// account data is derived from it, and it never substitutes for backend
// authentication. Replace with a real verify endpoint if one is added.
const CODE_PREFIX_TO_ROLE = {
  ASHA: ROLES.ASHA,
  OFFR: ROLES.HEALTH_OFFICER,
  PHRM: ROLES.PHARMACIST,
};

function resolveRoleFromCode(code) {
  const prefix = (code || '').trim().toUpperCase().split('-')[0];
  return CODE_PREFIX_TO_ROLE[prefix] || null;
}

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

// Real credential check against the Spring Boot backend. Role comes
// back from the authenticated account's own record, never guessed from
// the email address. A non-ACTIVE account (PENDING/REJECTED/SUSPENDED)
// gets no token — loginRequest throws with `.code` set to the account's
// status so the caller can route to the Pending Approval page.
export async function loginRequest({ email, password }) {
  let data;
  try {
    ({ data } = await apiClient.post('/auth/login', {
      emailOrPhone: email,
      password,
    }));
  } catch (err) {
    throw new Error(errorMessage(err, 'No account found for this email, or the password is incorrect.'));
  }

  if (!data.token) {
    const err = new Error(data.message || 'Your account is not active yet.');
    err.code = data.accountStatus || 'PENDING';
    throw err;
  }

  return {
    token: data.token,
    role: toFrontendRole(data.role),
    user: mapUser(data.user),
  };
}

// Citizen self-registration — identity + credentials only. Account is
// active immediately, so this is followed by a normal login.
export async function registerRequest(formData) {
  try {
    const phone = (formData.phone || '').replace(/\D/g, '').slice(-10);
    const { data } = await apiClient.post('/auth/register/citizen', {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone,
      password: formData.password,
    });
    return { user: mapUser(data.user) };
  } catch (err) {
    throw new Error(errorMessage(err, 'Unable to complete registration.'));
  }
}

// Step 1 of the Healthcare Worker flow: resolve which role a Staff
// Access Code grants. See CODE_PREFIX_TO_ROLE above for why this is
// resolved locally rather than against a backend endpoint — it is a
// role-routing hint only, not a credential or account check.
export async function verifyStaffCode(code) {
  const role = resolveRoleFromCode(code);
  if (!role) {
    throw new Error('Invalid staff access code. Please check the code and try again.');
  }
  return { code: (code || '').trim().toUpperCase(), role };
}

// Step 2 of the Healthcare Worker flow: register using a verified code.
// Role comes entirely from the code (never a manual picker) and decides
// which /auth/register/* endpoint is called. Account is created PENDING
// on the backend — no token is issued until an Admin approves it, so the
// caller routes to the Pending Approval page.
export async function registerStaffRequest(formData) {
  const role = resolveRoleFromCode(formData.code);
  const path = STAFF_ROLE_TO_REGISTER_PATH[role];
  if (!path) {
    throw new Error('This staff access code is no longer valid. Please request a new one.');
  }

  const phone = (formData.phone || '').replace(/\D/g, '').slice(-10);

  const payload = {
    firstName: formData.firstName,
    lastName: formData.lastName,
    email: formData.email,
    phone,
    password: formData.password,
    employeeId: formData.employeeId,
  };
  if (role === ROLES.PHARMACIST) {
    payload.licenseNumber = formData.licenseNumber;
  }

  try {
    const { data } = await apiClient.post(path, payload);
    return { user: mapUser(data.user) };
  } catch (err) {
    throw new Error(errorMessage(err, 'Unable to complete registration.'));
  }
}

// "Complete Profile" step, shown once after a user's first successful
// login if their profile isn't complete yet. Calls PUT /profile/complete
// — the backend identifies the user from the Bearer token, so no userId
// needs to travel in the request body.
export async function completeProfileRequest(userId, profileData) {
  try {
    const { data } = await apiClient.put('/profile/complete', {
      gender: profileData.gender ?? null,
      dateOfBirth: profileData.dateOfBirth || null,
      bloodGroup: profileData.bloodGroup ?? null,
      address: profileData.address ?? null,
      district: profileData.district ?? null,
      state: profileData.state ?? null,
      pincode: profileData.pincode ?? null,
      preferredLanguage: profileData.preferredLanguage ?? null,
      latitude: profileData.latitude ?? null,
      longitude: profileData.longitude ?? null,
      profilePhoto: profileData.profilePhoto ?? null,
      height: profileData.height ?? null,
      weight: profileData.weight ?? null,
      emergencyContactName: profileData.emergencyContact ?? null,
      emergencyContactPhone: profileData.emergencyContactPhone ?? null,
      chronicDiseases: profileData.chronicDiseases ?? null,
      allergies: profileData.allergies ?? null,
      medicalHistory: profileData.medicalHistory ?? null,
    });
    return { user: mapUser(data) };
  } catch (err) {
    throw new Error(errorMessage(err, 'Unable to save your profile.'));
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

// Fetches the authenticated user's own record via GET /profile/me
// (uses whichever Bearer token axios.js currently attaches).
export async function fetchCurrentUser() {
  try {
    const { data } = await apiClient.get('/profile/me');
    return mapUser(data);
  } catch {
    return null;
  }
}
