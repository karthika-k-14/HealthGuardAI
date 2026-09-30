import apiClient from './axios';

/**
 * Send a broadcast health alert to Citizens or ASHA Workers,
 * globally or to a specific village (typed manually).
 *
 * @param {Object} payload
 * @param {string}  payload.title
 * @param {string}  payload.message
 * @param {string}  payload.role            - 'CITIZEN' | 'ASHA_WORKER'
 * @param {string}  [payload.village]       - village name; null/empty = all villages
 * @param {string}  [payload.category]
 * @param {string}  payload.notificationType - 'info' | 'warning' | 'emergency'
 */
export async function sendBroadcastNotification(payload) {
  const { data } = await apiClient.post('/api/broadcast/send', {
    title:            payload.title,
    message:          payload.message,
    role:             payload.role || 'CITIZEN',
    village:          payload.village || null,
    category:         payload.category || 'General',
    notificationType: payload.notificationType || payload.type || 'info',
  });
  return data?.data || data;
}

export async function fetchRecentBroadcasts() {
  const { data } = await apiClient.get('/api/broadcast/recent');
  return data?.data || data || [];
}
