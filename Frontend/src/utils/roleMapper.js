import { ROLES } from '../constants/roles';

// Backend `Role` enum (com.healthguard.entity.Role) <-> frontend role
// identifiers (constants/roles.js). Single source of truth so authApi.js
// and adminApi.js never drift out of sync on how roles are named.
export const BACKEND_TO_FRONTEND_ROLE = {
  CITIZEN: ROLES.CITIZEN,
  ASHA_WORKER: ROLES.ASHA,
  HEALTH_OFFICER: ROLES.HEALTH_OFFICER,
  PHARMACIST: ROLES.PHARMACIST,
  ADMIN: ROLES.ADMIN,
};

export const FRONTEND_TO_BACKEND_ROLE = Object.fromEntries(
  Object.entries(BACKEND_TO_FRONTEND_ROLE).map(([backend, frontend]) => [frontend, backend])
);

export function toFrontendRole(backendRole) {
  return BACKEND_TO_FRONTEND_ROLE[backendRole] || null;
}

export function toBackendRole(frontendRole) {
  return FRONTEND_TO_BACKEND_ROLE[frontendRole] || null;
}
