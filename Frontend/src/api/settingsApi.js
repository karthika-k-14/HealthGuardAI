import apiClient from './axios';
import { STORAGE_KEYS } from '../constants/storageKeys';

export const DEFAULT_USER_SETTINGS = {
  darkMode: false,
  language: 'en',
  enableAiSuggestions: true,
  personalizedHealthRecommendations: true,
  enableNotifications: true,
  // ASHA Worker Preferences
  enableFamilyHealthAlerts: true,
  enableHomeVisitReminders: true,
  // Health Officer Preferences
  diseaseSurveillanceAlerts: true,
  highRiskCaseNotifications: true,
  referralEscalationAlerts: true,
  outbreakDetectionAlerts: true,
  campaignUpdateNotifications: true,
};

function getSettingsStorageKey() {
  try {
    const user = JSON.parse(localStorage.getItem(STORAGE_KEYS.USER) || localStorage.getItem('user') || '{}');
    const id = user?.id || user?.userId || localStorage.getItem('userId');
    const role = localStorage.getItem('role') || user?.role || 'default';
    if (id) {
      return `hg_app_settings_${role}_${id}`;
    }
  } catch (e) {}
  return 'hg_app_settings';
}

function getAdminId() {
  try {
    const user = JSON.parse(localStorage.getItem(STORAGE_KEYS.USER) || '{}');
    return user?.id || 1;
  } catch (e) {
    return 1;
  }
}

export async function fetchUserSettings() {
  try {
    const key = getSettingsStorageKey();
    const stored = localStorage.getItem(key) || (key !== 'hg_app_settings' ? localStorage.getItem('hg_app_settings') : null);
    let local = stored ? JSON.parse(stored) : {};
    return { ...DEFAULT_USER_SETTINGS, ...local };
  } catch (err) {
    return DEFAULT_USER_SETTINGS;
  }
}

export async function updateUserSettings(changes) {
  try {
    const current = await fetchUserSettings();
    const updated = { ...current, ...changes };
    const key = getSettingsStorageKey();
    localStorage.setItem(key, JSON.stringify(updated));
    localStorage.setItem('hg_app_settings', JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('hg_settings_updated', { detail: updated }));
    return updated;
  } catch (err) {
    return changes;
  }
}

export async function fetchSettings() {
  const adminId = getAdminId();
  try {
    const { data } = await apiClient.get('/api/admin/settings', { params: { adminId } });
    const settings = data?.data || data || {};
    return {
      ...DEFAULT_USER_SETTINGS,
      darkMode: Boolean(settings.darkMode),
      language: settings.language || 'en',
      twoFactorEnabled: Boolean(settings.twoFactorEnabled),
    };
  } catch (err) {
    return fetchUserSettings();
  }
}

export async function updateSettings(changes) {
  const adminId = getAdminId();
  try {
    const { data } = await apiClient.put('/api/admin/settings', changes, { params: { adminId } });
    const settings = data?.data || data || {};
    return {
      ...DEFAULT_USER_SETTINGS,
      ...settings,
    };
  } catch (err) {
    return updateUserSettings(changes);
  }
}
