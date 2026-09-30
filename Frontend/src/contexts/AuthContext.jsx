import React, { createContext, useContext, useMemo, useState, useCallback, useEffect } from 'react';
import { STORAGE_KEYS } from '../constants/storageKeys';
import { getItem, getJSON, removeItem, setItem, setJSON } from '../utils/storage';
import { ROLE_HOME_ROUTE, ROLES } from '../constants/roles';
import { PATHS } from '../constants/routes';
import {
  loginRequest,
  guestLoginRequest,
  registerRequest,
  completeProfileRequest,
} from '../api/authApi';
import { isTokenExpired } from '../utils/jwt';

const AuthContext = createContext(undefined);

function loadInitialSession() {
  const token = getItem(STORAGE_KEYS.TOKEN) || localStorage.getItem('token');

  if (token && isTokenExpired(token)) {
    // Stale or expired token found - clear storage immediately to prevent cascading 401s
    removeItem(STORAGE_KEYS.TOKEN);
    removeItem(STORAGE_KEYS.ROLE);
    removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('user');
    return { token: null, role: null, user: null, isAuthenticated: false };
  }

  const role = getItem(STORAGE_KEYS.ROLE) || localStorage.getItem('role');
  let user = getJSON(STORAGE_KEYS.USER, null);
  if (!user && localStorage.getItem('user')) {
    try {
      user = JSON.parse(localStorage.getItem('user'));
    } catch (e) {
      user = null;
    }
  }

  if (token && role && user) {
    if (role !== ROLES.CITIZEN && role !== 'citizen') {
      user.profileCompleted = true;
    } else if (user.email) {
      try {
        const reg = JSON.parse(localStorage.getItem('hg_user_registry') || '{}');
        const regUser = reg[user.email.toLowerCase()];
        if (regUser && regUser.profileCompleted) {
          user.profileCompleted = true;
        }
      } catch (e) {}
    }
    return { token, role, user, isAuthenticated: true };
  }
  return { token: null, role: null, user: null, isAuthenticated: false };
}

function loadOnboardingFlag() {
  return getItem(STORAGE_KEYS.ONBOARDING_COMPLETED) === 'true';
}

function persistSession(response) {
  setItem(STORAGE_KEYS.TOKEN, response.token);
  setItem(STORAGE_KEYS.ROLE, response.role);
  setJSON(STORAGE_KEYS.USER, response.user);
  if (response.token) localStorage.setItem('token', response.token);
  if (response.role) localStorage.setItem('role', response.role);
  if (response.user) localStorage.setItem('user', JSON.stringify(response.user));
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(loadInitialSession);
  const [onboardingCompleted, setOnboardingCompleted] = useState(loadOnboardingFlag);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Where a freshly-authenticated user should land: Complete Profile
  // only for Citizens if not completed yet; staff roles go directly to their dashboard.
  const resolveRedirect = useCallback((role, user) => {
    if (role === ROLES.CITIZEN) {
      if (!user || user.profileCompleted === false) {
        return PATHS.COMPLETE_PROFILE;
      }
      return PATHS.CITIZEN || '/citizen';
    }
    return ROLE_HOME_ROUTE[role] || '/pharmacist';
  }, []);

  // Login validates real credentials against the Spring Boot backend
  // (see authApi.loginRequest, POST /auth/login) — the role comes
  // from the authenticated account's own record, never guessed from
  // the email address. A PENDING/REJECTED/SUSPENDED account never
  // gets a session here — loginRequest throws first, with a `.code`
  // this can branch on so the caller can route to Pending Approval.
  const login = useCallback(
    async ({ email, password }) => {
      setIsLoading(true);
      setError(null);
      try {
        if (!email) {
          throw new Error('Please enter your email address.');
        }
        if (!password) {
          throw new Error('Please enter your password.');
        }

        const response = await loginRequest({ email, password });
        persistSession(response);

        setSession({
          token: response.token,
          role: response.role,
          user: response.user,
          isAuthenticated: true,
        });

        if (response.mustChangePassword) {
          return { success: true, redirectTo: PATHS.CHANGE_PASSWORD, mustChangePassword: true, user: response.user };
        }

        return { success: true, redirectTo: resolveRedirect(response.role, response.user), user: response.user };
      } catch (err) {
        setError(err.message || 'Unable to sign in. Please try again.');
        return { success: false, error: err.message, status: err.code || null };
      } finally {
        setIsLoading(false);
      }
    },
    [resolveRedirect]
  );

  // Public citizen registration. Deliberately does not log the user
  // in — registration redirects to Login rather than auto-authenticating.
  const register = useCallback(async (formData) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await registerRequest(formData);
      return { success: true, user: response.user };
    } catch (err) {
      setError(err.message || 'Unable to complete registration.');
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // "Complete Profile" step, shown once after a user's first
  // successful login if their profile isn't complete yet.
  const completeProfile = useCallback(
    async (profileData) => {
      if (!session.user) {
        return { success: false, error: 'You must be signed in to complete your profile.' };
      }
      setIsLoading(true);
      setError(null);
      try {
        const response = await completeProfileRequest(session.user.id || session.user.userId, profileData);
        const nextUser = {
          ...session.user,
          ...profileData,
          ...(response?.user || {}),
          profileCompleted: true,
        };

        setItem(STORAGE_KEYS.ONBOARDING_COMPLETED, 'true');
        setOnboardingCompleted(true);
        setJSON(STORAGE_KEYS.USER, nextUser);
        localStorage.setItem('user', JSON.stringify(nextUser));
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(nextUser));

        setSession((prev) => ({
          ...prev,
          user: nextUser,
        }));

        const targetDashboard = ROLE_HOME_ROUTE[session.role] || PATHS.CITIZEN_HOME || '/citizen';
        return { success: true, redirectTo: targetDashboard };
      } catch (err) {
        setError(err.message || 'Unable to save your profile.');
        return { success: false, error: err.message };
      } finally {
        setIsLoading(false);
      }
    },
    [session.user, session.role]
  );

  // Drops a visitor into a read-only citizen session without a real
  // account. Still goes through onboarding the first time.
  const continueAsGuest = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await guestLoginRequest();
      persistSession(response);
      setSession({
        token: response.token,
        role: response.role,
        user: response.user,
        isAuthenticated: true,
      });
      return { success: true, redirectTo: resolveRedirect(response.role, response.user) };
    } catch (err) {
      setError(err.message || 'Unable to continue as guest.');
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  }, [resolveRedirect]);

  const logout = useCallback(() => {
    // Preserve only device-level preferences like language or onboarding
    const preservedLang = localStorage.getItem('hg_language');
    const preservedOnboarding = localStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETED);

    // Clear all storage
    localStorage.clear();
    sessionStorage.clear();

    // Restore device preferences
    if (preservedLang) localStorage.setItem('hg_language', preservedLang);
    if (preservedOnboarding) localStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETED, preservedOnboarding);

    setSession({ token: null, role: null, user: null, isAuthenticated: false });
  }, []);


  // Onboarding is a device-level "seen it once" flag — it persists
  // across logout/login so a returning user never sees it again.
  const completeOnboarding = useCallback(() => {
    setItem(STORAGE_KEYS.ONBOARDING_COMPLETED, 'true');
    setOnboardingCompleted(true);
  }, []);

  const value = useMemo(
    () => ({
      ...session,
      isLoading,
      error,
      onboardingCompleted,
      login,
      register,
      completeProfile,
      continueAsGuest,
      logout,
      completeOnboarding,
    }),
    [
      session,
      isLoading,
      error,
      onboardingCompleted,
      login,
      register,
      completeProfile,
      continueAsGuest,
      logout,
      completeOnboarding,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
