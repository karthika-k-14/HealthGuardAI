// Canonical role identifiers used across auth, routing, and role-based UI.
export const ROLES = {
  CITIZEN: 'citizen',
  ASHA: 'asha',
  PHARMACIST: 'pharmacist',
  HEALTH_OFFICER: 'officer',
  ADMIN: 'admin',
};

export const ROLE_LABELS = {
  [ROLES.CITIZEN]: 'Citizen',
  [ROLES.ASHA]: 'ASHA Worker',
  [ROLES.PHARMACIST]: 'Pharmacist',
  [ROLES.HEALTH_OFFICER]: 'Health Officer',
  [ROLES.ADMIN]: 'Administrator',
};

// Default landing dashboard route per role, used post-login and for
// redirecting an authenticated user away from public-only routes.
export const ROLE_HOME_ROUTE = {
  [ROLES.CITIZEN]: '/citizen',
  [ROLES.ASHA]: '/asha',
  [ROLES.PHARMACIST]: '/pharmacist',
  [ROLES.HEALTH_OFFICER]: '/officer',
  [ROLES.ADMIN]: '/admin',
};
