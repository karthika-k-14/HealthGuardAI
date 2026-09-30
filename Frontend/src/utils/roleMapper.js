import { ROLES, ROLE_HOME_ROUTE } from '../constants/roles';

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
  if (!backendRole) return null;
  const clean = String(backendRole).trim().toUpperCase().replace(/^ROLE_/, '');

  if (clean === 'ADMIN' || clean === 'ADMINISTRATOR') return ROLES.ADMIN;
  if (clean === 'ASHA_WORKER' || clean === 'ASHA') return ROLES.ASHA;
  if (clean === 'HEALTH_OFFICER' || clean === 'OFFICER') return ROLES.HEALTH_OFFICER;
  if (clean === 'PHARMACIST' || clean === 'PHARMACY') return ROLES.PHARMACIST;
  if (clean === 'CITIZEN' || clean === 'USER') return ROLES.CITIZEN;

  return BACKEND_TO_FRONTEND_ROLE[backendRole] || BACKEND_TO_FRONTEND_ROLE[clean] || backendRole;
}

export function toBackendRole(frontendRole) {
  return FRONTEND_TO_BACKEND_ROLE[frontendRole] || null;
}

export function getRoleRedirect(role) {
  const frontendRole = toFrontendRole(role);
  return ROLE_HOME_ROUTE[frontendRole] || ROLE_HOME_ROUTE[role] || '/';
}

