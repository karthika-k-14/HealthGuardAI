import React, { createContext, useContext, useCallback, useMemo, useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { fetchNotifications, markNotificationRead, deleteNotification as deleteNotificationApi } from '../api/notificationApi';
import { fetchNotificationsForRole } from '../api/workflowApi';
import { useAuth } from './AuthContext';

const NotificationContext = createContext(undefined);

// Drives the notification bell / notification center. Distinct from
// react-hot-toast, which handles ephemeral action feedback.
export function NotificationProvider({ children }) {
  const { isAuthenticated, role } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [readIds, setReadIds] = useState(() => new Set());

  const loadNotifications = useCallback(async () => {
    setIsLoading(true);
    try {
      // Real notifications from the Notification CRUD backend, plus
      // anything the cross-role workflow engine has generated for this
      // role (e.g. an ASHA assignment created by a citizen's symptom
      // report) — merged so the notification center reflects both
      // without a page refresh. Each is tagged with its source so
      // markAsRead/remove know whether a backend call applies.
      const [backendData, workflowData] = await Promise.all([
        fetchNotifications().catch(() => []),
        role ? fetchNotificationsForRole(role) : Promise.resolve([]),
      ]);
      const taggedBackend = backendData.map((n) => ({ ...n, source: 'backend' }));
      const taggedWorkflow = workflowData.map((n) => ({ ...n, source: 'workflow' }));
      const merged = [...taggedWorkflow, ...taggedBackend].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      // Re-apply locally-tracked read state on top of the freshly
      // fetched list, so a background poll (needed to surface new
      // notifications from other roles automatically) never reverts
      // something the user already read back to unread.
      setReadIds((currentReadIds) => {
        setNotifications(merged.map((n) => (currentReadIds.has(n.id) ? { ...n, read: true } : n)));
        return currentReadIds;
      });
    } finally {
      setIsLoading(false);
    }
  }, [role]);

  useEffect(() => {
    if (isAuthenticated) {
      loadNotifications();
    } else {
      setNotifications([]);
      setReadIds(new Set());
    }
  }, [isAuthenticated, loadNotifications]);

  const markAsRead = useCallback((id) => {
    setReadIds((prev) => new Set(prev).add(id));
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));

    const target = notifications.find((n) => n.id === id);
    if (target?.source === 'backend' && !target.read) {
      markNotificationRead(id).catch(() => {
        toast.error('Unable to mark that notification as read.');
      });
    }
  }, [notifications]);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => {
      setReadIds((prevIds) => {
        const next = new Set(prevIds);
        prev.forEach((n) => next.add(n.id));
        return next;
      });
      prev
        .filter((n) => n.source === 'backend' && !n.read)
        .forEach((n) => {
          markNotificationRead(n.id).catch(() => {});
        });
      return prev.map((n) => ({ ...n, read: true }));
    });
  }, []);

  const removeNotification = useCallback(async (id) => {
    const target = notifications.find((n) => n.id === id);
    if (target?.source === 'backend') {
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
  }, [notifications]);

  const unreadCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications]);

  const value = useMemo(
    () => ({
      notifications,
      isLoading,
      unreadCount,
      loadNotifications,
      markAsRead,
      markAllAsRead,
      removeNotification,
    }),
    [notifications, isLoading, unreadCount, loadNotifications, markAsRead, markAllAsRead, removeNotification]
  );

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within a NotificationProvider');
  return ctx;
}
