import apiClient from './axios';

/**
 * Notification CRUD - calls the real Spring Boot backend
 * (NotificationController). Reads/updates on one's own notifications hit
 * "/notifications/**" (any authenticated role); sending hits
 * "/admin/notifications" (ROLE_ADMIN).
 */

export async function fetchNotifications() {
  const { data } = await apiClient.get('/notifications');
  return data;
}

export async function markNotificationRead(id) {
  const { data } = await apiClient.put(`/notifications/${id}/read`);
  return data;
}

export async function deleteNotification(id) {
  await apiClient.delete(`/notifications/${id}`);
  return { id, deleted: true };
}

export async function sendNotification(notification) {
  const { data } = await apiClient.post('/admin/notifications', notification);
  return data;
}

/**
 * Broadcast Notification module - calls BroadcastController's
 * "POST /admin/notifications/broadcast". `payload.targetType` is one of
 * "ROLE" | "VILLAGE" | "PHC", with the matching id/role field set:
 *   { targetType: 'ROLE', role: 'ASHA_WORKER', title, message, type, category }
 *   { targetType: 'VILLAGE', villageId, title, message, type, category }
 *   { targetType: 'PHC', phcId, title, message, type, category }
 * Returns a BroadcastResponse summary (targetLabel, recipientCount, sentAt)
 * rather than the full list of created notifications.
 */
export async function broadcastNotification(payload) {
  const { data } = await apiClient.post('/admin/notifications/broadcast', payload);
  return data;
}
