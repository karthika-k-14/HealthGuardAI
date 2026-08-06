import React, { createContext, useContext, useMemo, useState, useCallback } from 'react';
import { STORAGE_KEYS } from '../constants/storageKeys';
import { getItem, getJSON, removeItem, setItem, setJSON } from '../utils/storage';
import { ROLE_HOME_ROUTE } from '../constants/roles';
import { PATHS } from '../constants/routes';
import {
  loginRequest,
  guestLoginRequest,
  registerRequest,
  registerStaffRequest,
  verifyStaffCode,
  completeProfileRequest,
} from '../api/authApi';

const AuthContext = createContext(undefined);

function loadInitialSession() {
  const token = getItem(STORAGE_KEYS.TOKEN);
  const role = getItem(STORAGE_KEYS.ROLE);
  const user = getJSON(STORAGE_KEYS.USER, null);

  if (token && role && user) {
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
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(loadInitialSession);
  const [onboardingCompleted, setOnboardingCompleted] = useState(loadOnboardingFlag);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Where a freshly-authenticated user should land: Complete Profile
  // first if it isn't done yet (shown once, after first login), then
  // the one-time app tour, then their role's home dashboard.
  const resolveRedirect = useCallback((role, user) => {
    if (user && user.profileCompleted === false) return PATHS.COMPLETE_PROFILE;
    return loadOnboardingFlag() ? ROLE_HOME_ROUTE[role] : PATHS.ONBOARDING;
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

        return { success: true, redirectTo: resolveRedirect(response.role, response.user) };
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

  // Step 1 of the Healthcare Worker flow — verify a Staff Access Code
  // and find out which role it grants, without creating an account.
  const checkStaffAccessCode = useCallback(async (code) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await verifyStaffCode(code);
      return { success: true, role: result.role, code: result.code };
    } catch (err) {
      setError(err.message || 'Invalid staff access code.');
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Step 2 of the Healthcare Worker flow — register using a verified
  // code. Role comes entirely from the code, never a manual picker.
  // The account is created PENDING, so this never logs the user in;
  // the caller routes to the Pending Approval page instead.
  const registerStaff = useCallback(async (formData) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await registerStaffRequest(formData);
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
        const response = await completeProfileRequest(session.user.id, profileData);
        setSession((prev) => {
          const nextUser = { ...prev.user, ...response.user };
          setJSON(STORAGE_KEYS.USER, nextUser);
          return { ...prev, user: nextUser };
        });
        return { success: true, redirectTo: loadOnboardingFlag() ? ROLE_HOME_ROUTE[session.role] : PATHS.ONBOARDING };
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
    removeItem(STORAGE_KEYS.TOKEN);
    removeItem(STORAGE_KEYS.ROLE);
    removeItem(STORAGE_KEYS.USER);
    removeItem(STORAGE_KEYS.LAST_ROUTE);
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
      checkStaffAccessCode,
      registerStaff,
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
      checkStaffAccessCode,
      registerStaff,
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
