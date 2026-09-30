import { useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

const WARNING_AFTER_MS = 14 * 60 * 1000; // 14 minutes idle -> warn
const LOGOUT_AFTER_MS = 15 * 60 * 1000; // 15 minutes idle -> sign out
const ACTIVITY_EVENTS = ['mousedown', 'keydown', 'scroll', 'touchstart'];

/**
 * Demo session-timeout: after a period of no user activity, warns
 * the person, then signs them out shortly after if they still
 * haven't interacted. Purely a frontend demo of the pattern — a real
 * implementation would also validate/refresh the session server-side.
 */
export function useSessionTimeout() {
  const { isAuthenticated, logout } = useAuth();
  const warningTimer = useRef(null);
  const logoutTimer = useRef(null);
  const warnedRef = useRef(false);

  useEffect(() => {
    if (!isAuthenticated) return undefined;

    const clearTimers = () => {
      clearTimeout(warningTimer.current);
      clearTimeout(logoutTimer.current);
    };

    const resetTimers = () => {
      clearTimers();
      warnedRef.current = false;
      warningTimer.current = setTimeout(() => {
        warnedRef.current = true;
        toast('You\u2019ve been inactive for a while \u2014 you\u2019ll be signed out soon.', { icon: '⏳', duration: 6000 });
      }, WARNING_AFTER_MS);
      logoutTimer.current = setTimeout(() => {
        toast('Signed out due to inactivity (demo session timeout).', { icon: '🔒' });
        logout();
      }, LOGOUT_AFTER_MS);
    };

    resetTimers();
    ACTIVITY_EVENTS.forEach((evt) => window.addEventListener(evt, resetTimers));

    return () => {
      clearTimers();
      ACTIVITY_EVENTS.forEach((evt) => window.removeEventListener(evt, resetTimers));
    };
  }, [isAuthenticated, logout]);
}
