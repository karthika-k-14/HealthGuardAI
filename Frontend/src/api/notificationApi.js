import apiClient from './axios';

/**
 * Normalizes the current auth context and user role
 */
function getAuthContext() {
  try {
    const rawUser = localStorage.getItem('user') || localStorage.getItem('hg_user');
    const user = rawUser ? JSON.parse(rawUser) : {};
    const rawRole = (localStorage.getItem('hg_role') || localStorage.getItem('role') || user.role || '').toUpperCase();

    let role = 'CITIZEN';
    if (rawRole.includes('ASHA')) {
      role = 'ASHA_WORKER';
    } else if (rawRole.includes('OFFICER') || rawRole === 'HEALTH_OFFICER') {
      role = 'HEALTH_OFFICER';
    } else if (rawRole.includes('PHARMAC')) {
      role = 'PHARMACIST';
    } else if (rawRole.includes('ADMIN')) {
      role = 'ADMIN';
    } else if (rawRole.includes('CITIZEN') || rawRole === 'USER') {
      role = 'CITIZEN';
    }

    const village = user.village || localStorage.getItem('village') || localStorage.getItem('hg_village') || null;

    return {
      userId: user.userId || user.id || localStorage.getItem('userId') || localStorage.getItem('hg_user_id'),
      ashaWorkerId: user.ashaWorkerId,
      email: user.email || localStorage.getItem('email'),
      role: role,
      village: village,
    };
  } catch {
    return { role: 'CITIZEN', village: null };
  }
}

export async function fetchNotifications(userId = null) {
  return fetchUserNotifications(userId);
}

export async function fetchCitizenNotifications(userId = null) {
  return fetchUserNotifications(userId);
}

export async function markNotificationRead(id) {
  return markNotificationAsRead(id);
}

export async function fetchUserNotifications(userId = null) {
  const auth = getAuthContext();

  if (auth.role === 'PHARMACIST') {
    try {
      const { data } = await apiClient.get('/api/pharmacy/notifications');
      const list = data?.data || data;
      const res = Array.isArray(list) ? list : [];
      console.log('[NotificationAPI] Pharmacist fetched notifications count:', res.length);
      return res;
    } catch {
      return [];
    }
  }

  const targetUserId = userId || auth.userId;
  const params = {
    userId: targetUserId,
    ashaWorkerId: auth.ashaWorkerId,
    role: auth.role,
    village: auth.village,
  };
  const headers = {
    'X-User-Id': String(targetUserId || ''),
    'X-User-Email': auth.email || '',
    'X-User-Role': auth.role || '',
    'X-User-Village': auth.village || '',
  };

  let endpoint = '/api/notifications';
  if (auth.role === 'HEALTH_OFFICER') {
    endpoint = `/api/officer/notifications/${targetUserId || 27}`;
  } else if (auth.role === 'ASHA_WORKER') {
    endpoint = '/api/asha/notifications';
  }

  try {
    const { data } = await apiClient.get(endpoint, { params, headers, silent: true });
    const list = data?.data || data;
    const res = Array.isArray(list) ? list : [];
    console.log(
      `[NotificationAPI] Fetched ${res.length} notifications from ${endpoint} for User: ${targetUserId}, Role: ${auth.role}, Village: ${auth.village}`
    );
    return res;
  } catch (e) {
    console.warn(`[NotificationAPI] Request to ${endpoint} failed:`, e?.message);
    if (endpoint !== '/api/notifications' && auth.role === 'CITIZEN') {
      try {
        const { data } = await apiClient.get('/api/notifications', { params, headers, silent: true });
        const list = data?.data || data;
        return Array.isArray(list) ? list : [];
      } catch {}
    }
  }

  return [];
}

export async function fetchUnreadNotifications(userId = null) {
  const list = await fetchUserNotifications(userId);
  return Array.isArray(list) ? list.filter((n) => !n.isRead && !n.read) : [];
}

export async function fetchUnreadCount(userId = null) {
  const auth = getAuthContext();
  if (auth.role === 'PHARMACIST') {
    try {
      const { data } = await apiClient.get('/api/pharmacy/notifications', { silent: true });
      const list = data?.data || data;
      if (Array.isArray(list)) {
        return list.filter((n) => !n.isRead && !n.read).length;
      }
      return 0;
    } catch {
      return 0;
    }
  }

  const targetUserId = userId || auth.userId;
  const params = {
    userId: targetUserId,
    ashaWorkerId: auth.ashaWorkerId,
    role: auth.role,
    village: auth.village,
  };
  const headers = {
    'X-User-Id': String(targetUserId || ''),
    'X-User-Email': auth.email || '',
    'X-User-Role': auth.role || '',
    'X-User-Village': auth.village || '',
  };

  let endpoint = '/api/notifications/unread-count';
  if (auth.role === 'HEALTH_OFFICER') {
    endpoint = `/api/officer/notifications/unread-count/${targetUserId || 27}`;
  } else if (auth.role === 'ASHA_WORKER') {
    endpoint = '/api/asha/notifications/unread-count';
  }

  try {
    const { data } = await apiClient.get(endpoint, { params, headers, silent: true });
    const count = data?.data?.unreadCount !== undefined ? data.data.unreadCount : data?.unreadCount;
    if (count !== undefined && count !== null) return Number(count);
  } catch (e) {}

  return 0;
}

export async function markNotificationAsRead(id) {
  const auth = getAuthContext();
  const headers = {
    'X-User-Id': String(auth.userId || ''),
    'X-User-Email': auth.email || '',
    'X-User-Role': auth.role || '',
    'X-User-Village': auth.village || '',
  };

  if (auth.role === 'PHARMACIST') {
    try {
      const { data } = await apiClient.put(`/api/pharmacy/notifications/${id}/read`);
      return data;
    } catch {
      return { id, isRead: true };
    }
  }

  let endpoint = `/api/notifications/${id}/read`;
  if (auth.role === 'HEALTH_OFFICER') {
    endpoint = `/api/officer/notifications/read/${id}`;
  } else if (auth.role === 'ASHA_WORKER') {
    endpoint = `/api/asha/notifications/${id}/read`;
  }

  try {
    const { data } = await apiClient.put(endpoint, {}, { headers, silent: true });
    return data?.data || data;
  } catch {
    return { id, isRead: true };
  }
}

export async function markAllNotificationsRead() {
  const auth = getAuthContext();
  const params = {
    userId: auth.userId,
    ashaWorkerId: auth.ashaWorkerId,
    role: auth.role,
  };
  const headers = {
    'X-User-Id': String(auth.userId || ''),
    'X-User-Email': auth.email || '',
    'X-User-Role': auth.role || '',
    'X-User-Village': auth.village || '',
  };

  let endpoint = '/api/notifications/read-all';
  if (auth.role === 'HEALTH_OFFICER') {
    endpoint = `/api/officer/notifications/read-all/${auth.userId || 27}`;
  } else if (auth.role === 'ASHA_WORKER') {
    endpoint = '/api/asha/notifications/read-all';
  }

  try {
    const { data } = await apiClient.put(endpoint, {}, { params, headers, silent: true });
    return data?.data || data;
  } catch {
    return { success: true };
  }
}

export async function deleteNotification(id) {
  const auth = getAuthContext();
  const headers = {
    'X-User-Id': String(auth.userId || ''),
    'X-User-Email': auth.email || '',
    'X-User-Role': auth.role || '',
    'X-User-Village': auth.village || '',
  };

  if (auth.role === 'PHARMACIST') {
    try {
      await apiClient.delete(`/api/pharmacy/notifications/${id}`, { silent: true });
      return { id, deleted: true };
    } catch {
      return { id, deleted: true };
    }
  }

  let endpoint = `/api/notifications/${id}`;
  if (auth.role === 'HEALTH_OFFICER') {
    endpoint = `/api/officer/notifications/${id}`;
  }

  try {
    await apiClient.delete(endpoint, { headers, silent: true });
    return { id, deleted: true };
  } catch {
    return { id, deleted: true };
  }
}

export async function createNotification(notification) {
  try {
    const { data } = await apiClient.post('/api/notifications', notification);
    return data;
  } catch (err) {
    console.error('Failed to create notification:', err);
    return { id: `n_${Date.now()}`, ...notification, createdAt: new Date().toISOString() };
  }
}
