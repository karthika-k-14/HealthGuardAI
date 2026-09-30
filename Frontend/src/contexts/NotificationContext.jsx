import React, { createContext, useContext, useCallback, useMemo, useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
  fetchNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification as deleteNotificationApi,
} from '../api/notificationApi';
import { fetchNotificationsForRole } from '../api/workflowApi';
import { useAuth } from './AuthContext';

const NotificationContext = createContext(undefined);

export function NotificationProvider({ children }) {
  const { isAuthenticated, role, user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [, setReadIds] = useState(() => new Set());

  // Normalize role
  const normalizedRole = useMemo(() => {
    const raw = (role || '').toUpperCase();
    if (raw.includes('ASHA')) return 'ASHA_WORKER';
    if (raw.includes('OFFICER')) return 'HEALTH_OFFICER';
    if (raw.includes('PHARMAC')) return 'PHARMACIST';
    if (raw.includes('ADMIN')) return 'ADMIN';
    return 'CITIZEN';
  }, [role]);

  const userVillage = useMemo(() => {
    return user?.village || localStorage.getItem('village') || localStorage.getItem('hg_village') || null;
  }, [user]);

  const loadNotifications = useCallback(async () => {
    setIsLoading(true);
    try {
      // Check master notifications toggle from Settings
      try {
        const stored = localStorage.getItem('hg_app_settings');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed.enableNotifications === false) {
            setNotifications([]);
            return;
          }
        }
      } catch {}

      const isHealthOfficer = normalizedRole === 'HEALTH_OFFICER';
      const isPharmacist = normalizedRole === 'PHARMACIST';

      const [backendData, workflowData] = await Promise.all([
        fetchNotifications().catch(() => []),
        !isHealthOfficer && !isPharmacist ? fetchNotificationsForRole(role) : Promise.resolve([]),
      ]);

      let rawBackend = Array.isArray(backendData) ? backendData : (backendData?.data || []);

      // Role-based security filter: prevent any cross-role notification display
      rawBackend = rawBackend.filter((n) => {
        const notifRole = (n.role || n.recipientRole || '').toUpperCase();
        if (!notifRole || notifRole === 'ALL' || notifRole === 'SYSTEM') return true;
        if (normalizedRole === 'CITIZEN') return notifRole === 'CITIZEN';
        if (normalizedRole === 'ASHA_WORKER') return notifRole === 'ASHA_WORKER';
        if (normalizedRole === 'HEALTH_OFFICER') return notifRole === 'HEALTH_OFFICER';
        if (normalizedRole === 'PHARMACIST') return notifRole === 'PHARMACIST';
        return true;
      });

      if (isPharmacist) {
        const allowedPharmacyTypes = new Set(['LOW_STOCK', 'OUT_OF_STOCK', 'EXPIRY_ALERT', 'PROCUREMENT_APPROVED']);
        rawBackend = rawBackend.filter((n) => allowedPharmacyTypes.has(n.type));
      }

      const rawWorkflow = Array.isArray(workflowData) ? workflowData : (workflowData?.data || []);
      const taggedBackend = rawBackend.map((n) => ({
        ...n,
        isBackend: true,
        source: n.source || (isHealthOfficer ? 'HealthGuard System' : 'Field Operations'),
      }));
      const taggedWorkflow = rawWorkflow.map((n) => ({
        ...n,
        isBackend: false,
        source: n.source || 'Workflow Engine',
      }));

      const merged = [...taggedWorkflow, ...taggedBackend].sort(
        (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
      );

      // REQUIRED LOGGING
      console.log(
        `[NotificationContext] Fetched notifications count: ${merged.length}, Logged-in user role: ${normalizedRole}, Logged-in user village: ${userVillage || 'N/A'}`
      );

      setReadIds((currentReadIds) => {
        setNotifications(
          merged.map((n) => {
            const isItemRead = currentReadIds.has(n.id) || Boolean(n.isRead) || Boolean(n.read);
            return {
              ...n,
              read: isItemRead,
              isRead: isItemRead,
            };
          })
        );
        return currentReadIds;
      });
    } finally {
      setIsLoading(false);
    }
  }, [role, normalizedRole, userVillage]);

  useEffect(() => {
    if (isAuthenticated) {
      loadNotifications();
      const handleSettingsUpdated = () => loadNotifications();
      window.addEventListener('hg_settings_updated', handleSettingsUpdated);
      return () => {
        window.removeEventListener('hg_settings_updated', handleSettingsUpdated);
      };
    } else {
      setNotifications([]);
      setReadIds(new Set());
    }
  }, [isAuthenticated, loadNotifications]);

  const markAsRead = useCallback(
    (id) => {
      setReadIds((prev) => new Set(prev).add(id));
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true, isRead: true } : n))
      );

      const target = notifications.find((n) => n.id === id);
      if (target?.isBackend !== false && (!target?.read && !target?.isRead)) {
        markNotificationRead(id).catch(() => {
          toast.error('Unable to mark that notification as read.');
        });
      }
    },
    [notifications]
  );

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => {
      setReadIds((prevIds) => {
        const next = new Set(prevIds);
        prev.forEach((n) => next.add(n.id));
        return next;
      });
      markAllNotificationsRead().catch(() => {});
      return prev.map((n) => ({ ...n, read: true, isRead: true }));
    });
  }, []);

  const removeNotification = useCallback(
    async (id) => {
      const target = notifications.find((n) => n.id === id);
      if (target?.isBackend !== false) {
        try {
          await deleteNotificationApi(id);
        } catch (err) {
          toast.error(err?.response?.data?.message || 'Unable to delete that notification.');
          return;
        }
      }
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      setReadIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    },
    [notifications]
  );

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read && !n.isRead).length,
    [notifications]
  );

  const value = useMemo(
    () => ({
      notifications,
      isLoading,
      unreadCount,
      loadNotifications,
      markAsRead,
      markAllAsRead,
      removeNotification,
      normalizedRole,
      userVillage,
    }),
    [notifications, isLoading, unreadCount, loadNotifications, markAsRead, markAllAsRead, removeNotification, normalizedRole, userVillage]
  );

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
