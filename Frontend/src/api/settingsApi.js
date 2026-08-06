import { mockRequest } from './mockClient';

const DEFAULT_SETTINGS = {
  theme: 'system',
  emailAlerts: true,
  smsAlerts: false,
  shareLocationForAlerts: true,
  twoFactorEnabled: false,
};

export async function fetchSettings() {
  return mockRequest(DEFAULT_SETTINGS);
}

export async function updateSettings(changes) {
  return mockRequest(() => ({ ...DEFAULT_SETTINGS, ...changes }));
}
