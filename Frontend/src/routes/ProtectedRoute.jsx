import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { PATHS } from '../constants/routes';

import React from 'react';

/**
 * Wraps a route element. Redirects to /login if there is no restored
 * session, or to /unauthorized if the session's role isn't in
 * `allowedRoles`. Session restoration itself happens in AuthContext
 * (from localStorage), so a refresh never bounces an authenticated
 * user back to /login.
 */
export default function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, role, user, onboardingCompleted } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to={PATHS.LOGIN} state={{ from: location }} replace />;
  }

  // Shown once, right after first login — everything registration
  // deliberately skipped (blood group, address, medical history, etc.)
  // gets collected here before the user can reach any dashboard route.
  if (user && user.profileCompleted === false && location.pathname !== PATHS.COMPLETE_PROFILE) {
    return <Navigate to={PATHS.COMPLETE_PROFILE} replace />;
  }

  if (!onboardingCompleted && location.pathname !== PATHS.ONBOARDING && location.pathname !== PATHS.COMPLETE_PROFILE) {
    return <Navigate to={PATHS.ONBOARDING} replace />;
  }

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    return <Navigate to={PATHS.UNAUTHORIZED} replace />;
  }

  return children;
}
