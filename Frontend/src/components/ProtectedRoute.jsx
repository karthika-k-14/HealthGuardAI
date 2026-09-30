import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/authService';

/**
 * Route guard enforcing authentication and role-based access control.
 * Unauthenticated users are redirected to /login.
 * Unauthorized roles are redirected to /unauthorized.
 */
export default function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, role, user } = useAuth();
  const location = useLocation();

  const isUserAuthenticated = isAuthenticated || authService.isAuthenticated();
  const userRole = (role || authService.getRole() || '').toLowerCase();
  const currentUser = user || authService.getUser();

  if (!isUserAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(role || authService.getRole())) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Citizen profile completion enforcement
  if (userRole === 'citizen') {
    const isProfileCompleted = currentUser?.profileCompleted === true;

    // Prevent already-completed citizens from accessing /complete-profile
    if (location.pathname === '/complete-profile' && isProfileCompleted) {
      return <Navigate to="/citizen" replace />;
    }

    // Redirect incomplete citizens away from dashboard/app pages to /complete-profile
    if (location.pathname !== '/complete-profile' && !isProfileCompleted) {
      return <Navigate to="/complete-profile" replace />;
    }
  }

  return children;
}
