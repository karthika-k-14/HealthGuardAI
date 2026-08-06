import { useAuth } from '../contexts/AuthContext';

/**
 * In-page role gate. Unlike ProtectedRoute (which redirects at the
 * route level), RoleGuard just conditionally renders children/fallback
 * inline — for things like "show this button only to Admins" inside
 * an already-protected page, without duplicating the role-check logic
 * that lives in AuthContext.
 */
export default function RoleGuard({ allowedRoles, children, fallback = null }) {
  const { role } = useAuth();
  if (!allowedRoles || allowedRoles.length === 0 || allowedRoles.includes(role)) {
    return children;
  }
  return fallback;
}
