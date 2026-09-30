import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  Sun,
  Moon,
  Globe,
  Languages,
  Sparkles,
  BrainCircuit,
  Bell,
  CheckCircle2,
  HeartPulse,
  CalendarCheck,
  UserCheck,
  ShieldCheck,
  Activity,
  AlertTriangle,
  GitPullRequest,
  Radio,
  Megaphone,
  Loader2,
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { fetchUserSettings, updateUserSettings, DEFAULT_USER_SETTINGS } from '../../api/settingsApi';
import { getHealthOfficerPreferences, updateHealthOfficerPreferences } from '../../api/healthOfficerPreferencesApi';
import { cn } from '../../utils/cn';
import { Skeleton } from '../../components/common/Skeleton';

function SettingToggleRow({ label, description, checked, onChange, disabled, icon: Icon, badge }) {
  const { t } = useLanguage();
  return (
    <div className={cn('flex items-center justify-between gap-4 py-3.5 transition-opacity', disabled && 'opacity-40 pointer-events-none')}>
      <div className="flex items-start gap-3">
        {Icon && (
          <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300">
            <Icon className="h-4 w-4" />
          </span>
        )}
        <div>
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{t(label)}</p>
            {badge && (
              <span className="rounded-full bg-brand-500/10 px-2 py-0.5 text-[10px] font-semibold text-brand-600 dark:text-brand-400">
                {badge}
              </span>
            )}
          </div>
          {description && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{t(description)}</p>}
        </div>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500/30',
          checked ? 'bg-brand-500' : 'bg-slate-200 dark:bg-white/10'
        )}
      >
        <span
          className={cn(
            'inline-block h-4.5 w-4.5 transform rounded-full bg-white shadow transition-transform',
            checked ? 'translate-x-5.5' : 'translate-x-1'
          )}
        />
      </button>
    </div>
  );
}

export default function Settings() {
  const { theme, isDark, setTheme } = useTheme();
  const { languageCode, setLanguageCode, t } = useLanguage();
  const { role, user } = useAuth();
  const [settings, setSettings] = useState(DEFAULT_USER_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState(null);

  const rawRole = (role || user?.role || localStorage.getItem('role') || localStorage.getItem('hg_user_role') || '').toLowerCase();
  const isHealthOfficer = rawRole === 'officer' || rawRole === 'health_officer' || rawRole.includes('officer');
  const isAshaWorker = rawRole === 'asha' || rawRole === 'asha_worker' || rawRole.includes('asha') || (!isHealthOfficer && !rawRole);

  useEffect(() => {
    let mounted = true;
    const loadSettings = async () => {
      setLoading(true);
      try {
        const baseSettings = await fetchUserSettings();
        if (isHealthOfficer) {
          try {
            const officerUserId = user?.id || user?.userId || localStorage.getItem('userId') || 27;
            const officerPrefs = await getHealthOfficerPreferences(officerUserId);
            if (officerPrefs && mounted) {
              setSettings({
                ...baseSettings,
                diseaseSurveillanceAlerts: officerPrefs.diseaseSurveillanceAlerts ?? true,
                highRiskCaseNotifications: officerPrefs.highRiskCaseNotifications ?? true,
                referralEscalationAlerts: officerPrefs.referralEscalationAlerts ?? true,
                outbreakDetectionAlerts: officerPrefs.outbreakDetectionAlerts ?? true,
                campaignUpdateNotifications: officerPrefs.campaignUpdateNotifications ?? true,
              });
              setLoading(false);
              return;
            }
          } catch (err) {
            console.warn('Failed to load Health Officer preferences from backend:', err);
            toast.error(t('Could not load preferences from server. Using defaults.'));
          }
        }
        if (mounted) {
          setSettings(baseSettings || DEFAULT_USER_SETTINGS);
          setLoading(false);
        }
      } catch (err) {
        if (mounted) {
          setSettings(DEFAULT_USER_SETTINGS);
          setLoading(false);
        }
      }
    };
    loadSettings();
    return () => {
      mounted = false;
    };
  }, [isHealthOfficer, user?.id, user?.userId]);

  const handleToggle = async (key, value) => {
    const previous = settings[key];
    const updated = { ...settings, [key]: value };
    setSettings(updated);
    setSavingKey(key);

    const officerKeys = [
      'diseaseSurveillanceAlerts',
      'highRiskCaseNotifications',
      'referralEscalationAlerts',
      'outbreakDetectionAlerts',
      'campaignUpdateNotifications',
    ];

    try {
      if (isHealthOfficer && officerKeys.includes(key)) {
        const officerUserId = user?.id || user?.userId || localStorage.getItem('userId') || 27;
        await updateHealthOfficerPreferences(officerUserId, { [key]: value });
        await updateUserSettings(updated);
        toast.success(t('Preference updated and saved'));
      } else {
        await updateUserSettings(updated);
        toast.success(t('Setting updated successfully'));
      }
    } catch (err) {
      console.error('Failed to save preference:', err);
      // Revert UI state on failure
      setSettings((prev) => ({ ...prev, [key]: previous }));
      toast.error(t('Failed to save preference. Please try again.'));
    } finally {
      setSavingKey(null);
    }
  };

  const handleThemeSwitch = async (newTheme) => {
    if (newTheme === theme) return;
    setTheme(newTheme);
    const updated = { ...settings, darkMode: newTheme === 'dark' };
    setSettings(updated);
    try {
      await updateUserSettings(updated);
      toast.success(t(`Switched to ${newTheme} mode`));
    } catch {}
  };

  const handleLanguageSelect = async (e) => {
    const code = e.target.value;
    setLanguageCode(code);
    const updated = { ...settings, language: code };
    setSettings(updated);
    try {
      await updateUserSettings(updated);
      toast.success(t('Language preference updated'));
    } catch {}
  };

  const LANGUAGE_OPTIONS = [
    { code: 'en', label: 'English', native: 'English' },
    { code: 'ta', label: 'Tamil', native: 'தமிழ்' },
    { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
    { code: 'or', label: 'Odia', native: 'ଓଡ଼ିଆ' },
  ];

  const currentLangObj = LANGUAGE_OPTIONS.find((l) => l.code === languageCode) || LANGUAGE_OPTIONS[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mx-auto max-w-3xl space-y-6 pb-12"
    >
      {/* Page Header */}
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          {t('Settings')}
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {t('Manage your appearance theme, interface language, AI assistance, and notification preferences.')}
        </p>
      </div>

      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-32 w-full rounded-2xl" />
          <Skeleton className="h-32 w-full rounded-2xl" />
          <Skeleton className="h-32 w-full rounded-2xl" />
          <Skeleton className="h-24 w-full rounded-2xl" />
        </div>
      ) : (
        <div className="space-y-5">
          {/* 1. Appearance */}
          <div className="surface-card rounded-2xl p-6 border border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-[#111714]/80 backdrop-blur-md shadow-sm">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                {isDark ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
              </span>
              <div>
                <h2 className="text-base font-semibold text-slate-900 dark:text-white">{t('Appearance')}</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {t('Customize the visual appearance and color theme of the application.')}
                </p>
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4 dark:border-white/10 dark:bg-white/5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    {t('Theme Mode')}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                    {t(`Currently using ${isDark ? 'Dark' : 'Light'} mode.`)}
                  </p>
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => handleThemeSwitch('light')}
                    className={cn(
                      'inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all',
                      !isDark
                        ? 'border-brand-500 bg-brand-50 text-brand-700 shadow-sm dark:border-brand-400 dark:bg-brand-500/20 dark:text-brand-300'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 dark:border-white/10 dark:bg-white/5 dark:text-slate-300'
                    )}
                  >
                    <Sun className="h-3.5 w-3.5 text-amber-500" />
                    <span>{t('Light')}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleThemeSwitch('dark')}
                    className={cn(
                      'inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all',
                      isDark
                        ? 'border-brand-500 bg-brand-600 text-white shadow-sm'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 dark:border-white/10 dark:bg-white/5 dark:text-slate-300'
                    )}
                  >
                    <Moon className="h-3.5 w-3.5" />
                    <span>{t('Dark')}</span>
                  </button>

                  <button
                    type="button"
                    role="switch"
                    aria-checked={isDark}
                    onClick={() => handleThemeSwitch(isDark ? 'light' : 'dark')}
                    className={cn(
                      'relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500/30',
                      isDark ? 'bg-brand-600' : 'bg-slate-300 dark:bg-white/20'
                    )}
                    title="Toggle Light/Dark Theme"
                  >
                    <span
                      className={cn(
                        'inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform',
                        isDark ? 'translate-x-6' : 'translate-x-1'
                      )}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Language */}
          <div className="surface-card rounded-2xl p-6 border border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-[#111714]/80 backdrop-blur-md shadow-sm">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20">
                <Globe className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-base font-semibold text-slate-900 dark:text-white">{t('Language')}</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {t('Choose your preferred application language.')}
                </p>
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4 dark:border-white/10 dark:bg-white/5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <label htmlFor="select-app-language" className="text-sm font-semibold text-slate-900 dark:text-white">
                    {t('Interface Language')}
                  </label>
                  <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                    {t(`Currently selected: ${currentLangObj.label} (${currentLangObj.native})`)}
                  </p>
                </div>

                <select
                  id="select-app-language"
                  value={languageCode}
                  onChange={handleLanguageSelect}
                  className="rounded-xl border border-slate-200 bg-white/90 px-4 py-2 text-sm font-medium text-slate-800 shadow-sm transition-all focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-white/10 dark:bg-slate-800 dark:text-white"
                >
                  {LANGUAGE_OPTIONS.map((opt) => (
                    <option key={opt.code} value={opt.code} className="bg-white text-slate-900 dark:bg-slate-800 dark:text-white">
                      {opt.label} ({opt.native})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>


          {/* 3. Role-Specific Preferences */}
          {/* Health Officer Preferences */}
          {isHealthOfficer && (
            <div className="surface-card rounded-2xl p-6 border border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-[#111714]/80 backdrop-blur-md shadow-sm space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/70 dark:border-white/10">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                    <ShieldCheck className="h-5 w-5" />
                  </span>
                  <div>
                    <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                      {t('Health Officer Preferences')}
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {t('Manage disease surveillance alerts, outbreak monitoring, referral notifications, and campaign updates.')}
                    </p>
                  </div>
                </div>
                {savingKey ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-500/10 px-3 py-1 text-xs font-medium text-brand-600 dark:text-brand-400">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    {t('Saving to server...')}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    {t('Saved in Database')}
                  </span>
                )}
              </div>

              <div className="divide-y divide-slate-200/70 dark:divide-white/10">
                <SettingToggleRow
                  icon={Activity}
                  label="Disease Surveillance Alerts"
                  description="Receive notifications when new disease surveillance reports are submitted by ASHA workers."
                  checked={settings.diseaseSurveillanceAlerts ?? true}
                  disabled={savingKey === 'diseaseSurveillanceAlerts'}
                  onChange={(val) => handleToggle('diseaseSurveillanceAlerts', val)}
                />

                <SettingToggleRow
                  icon={AlertTriangle}
                  label="High-Risk Case Notifications"
                  description="Get instant alerts for High and Critical severity disease cases requiring review."
                  checked={settings.highRiskCaseNotifications ?? true}
                  disabled={savingKey === 'highRiskCaseNotifications'}
                  onChange={(val) => handleToggle('highRiskCaseNotifications', val)}
                />

                <SettingToggleRow
                  icon={GitPullRequest}
                  label="Referral Escalation Alerts"
                  description="Receive notifications when emergency referrals are generated or pending approval."
                  checked={settings.referralEscalationAlerts ?? true}
                  disabled={savingKey === 'referralEscalationAlerts'}
                  onChange={(val) => handleToggle('referralEscalationAlerts', val)}
                />

                <SettingToggleRow
                  icon={Radio}
                  label="Outbreak Detection Alerts"
                  description="Get notified when disease clusters indicate a potential outbreak in monitored villages."
                  checked={settings.outbreakDetectionAlerts ?? true}
                  disabled={savingKey === 'outbreakDetectionAlerts'}
                  onChange={(val) => handleToggle('outbreakDetectionAlerts', val)}
                />

                <SettingToggleRow
                  icon={Megaphone}
                  label="Campaign Update Notifications"
                  description="Receive updates about vaccination drives, awareness campaigns, and public health activities."
                  checked={settings.campaignUpdateNotifications ?? true}
                  disabled={savingKey === 'campaignUpdateNotifications'}
                  onChange={(val) => handleToggle('campaignUpdateNotifications', val)}
                />
              </div>
            </div>
          )}

          {/* ASHA Worker Preferences */}
          {isAshaWorker && (
            <div className="surface-card rounded-2xl p-6 border border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-[#111714]/80 backdrop-blur-md shadow-sm space-y-3">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-200/70 dark:border-white/10">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  <UserCheck className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                    {t('ASHA Worker Preferences')}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {t('Manage specialized field alerts, household health follow-ups, and home visit reminders.')}
                  </p>
                </div>
              </div>

              <div className="divide-y divide-slate-200/70 dark:divide-white/10">
                <SettingToggleRow
                  icon={HeartPulse}
                  label="Enable Family Health Follow-up Alerts"
                  description="Notify the ASHA Worker when a family member requires vaccination, child health monitoring, pregnancy follow-up, chronic disease checkup, or other scheduled health services."
                  checked={settings.enableFamilyHealthAlerts ?? true}
                  onChange={(val) => handleToggle('enableFamilyHealthAlerts', val)}
                />

                <SettingToggleRow
                  icon={CalendarCheck}
                  label="Enable Home Visit Reminders"
                  description="Receive reminders for upcoming scheduled home visits, overdue visits, and pending follow-up visits within assigned villages."
                  checked={settings.enableHomeVisitReminders ?? true}
                  onChange={(val) => handleToggle('enableHomeVisitReminders', val)}
                />
              </div>
            </div>
          )}

          {/* 4. Notifications (Single Toggle) */}
          <div className="surface-card rounded-2xl p-6 border border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-[#111714]/80 backdrop-blur-md shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20">
                <Bell className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-base font-semibold text-slate-900 dark:text-white">{t('Notifications')}</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {t('Master control for system alert banners, badge counts, and notifications.')}
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4 dark:border-white/10 dark:bg-white/5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    {t('Enable Notifications')}
                  </p>
                  <p className={cn(
                    'mt-0.5 text-xs font-medium',
                    settings.enableNotifications
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-slate-500 dark:text-slate-400'
                  )}>
                    {settings.enableNotifications
                      ? t('Notifications Enabled — Receiving system alerts & updates')
                      : t('Notifications Disabled — All alert delivery paused')}
                  </p>
                </div>

                <button
                  type="button"
                  role="switch"
                  aria-checked={settings.enableNotifications}
                  onClick={() => handleToggle('enableNotifications', !settings.enableNotifications)}
                  className={cn(
                    'relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500/30',
                    settings.enableNotifications ? 'bg-brand-600' : 'bg-slate-300 dark:bg-white/20'
                  )}
                  title="Toggle Notifications"
                >
                  <span
                    className={cn(
                      'inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform',
                      settings.enableNotifications ? 'translate-x-6' : 'translate-x-1'
                    )}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
