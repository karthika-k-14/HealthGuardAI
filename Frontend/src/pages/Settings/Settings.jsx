import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Bell, Languages, ShieldCheck, Lock, DatabaseBackup, RefreshCw } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { ROLES } from '../../constants/roles';
import ThemeToggle from '../../components/common/ThemeToggle';
import LanguageSelector from '../../components/common/LanguageSelector';
import { fetchSettings, updateSettings } from '../../api/settingsApi';
import { fetchBackupStatus, triggerManualBackup } from '../../api/adminApi';
import { Skeleton } from '../../components/common/Skeleton';
import { cn } from '../../utils/cn';

function ToggleRow({ label, description, checked, onChange }) {
  const { t } = useLanguage();
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div>
        <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{t(label)}</p>
        {description && <p className="text-xs text-slate-500 dark:text-slate-400">{t(description)}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors',
          checked ? 'bg-brand-500' : 'bg-slate-200 dark:bg-white/10'
        )}
      >
        <span
          className={cn(
            'inline-block h-4.5 w-4.5 transform rounded-full bg-white shadow transition-transform',
            checked ? 'translate-x-6' : 'translate-x-1'
          )}
        />
      </button>
    </div>
  );
}

function AdminSecurityAndBackup({ settings, onToggle }) {
  const [backup, setBackup] = useState(null);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    let mounted = true;
    fetchBackupStatus().then((data) => {
      if (mounted) setBackup(data);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const handleBackupNow = async () => {
    setIsBackingUp(true);
    const result = await triggerManualBackup();
    setBackup((prev) => ({ ...prev, lastBackupAt: result.lastBackupAt }));
    setIsBackingUp(false);
    toast.success(t('Manual backup completed (demo)'));
  };

  return (
    <>
      <div className="surface-card p-6">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400">
            <Lock className="h-4 w-4" />
          </span>
          <p className="text-sm font-semibold text-slate-900 dark:text-white">{t('Security')}</p>
        </div>
        {!settings ? (
          <Skeleton className="mt-3 h-10 w-full" />
        ) : (
          <div className="mt-1">
            <ToggleRow
              label="Two-factor authentication"
              description="Require a verification code at sign-in for admin accounts"
              checked={settings.twoFactorEnabled}
              onChange={(v) => onToggle('twoFactorEnabled', v)}
            />
          </div>
        )}
      </div>

      <div className="surface-card p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400">
              <DatabaseBackup className="h-4 w-4" />
            </span>
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">{t('Backup')}</p>
              {backup && (
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {t('Last backup')}: {new Date(backup.lastBackupAt).toLocaleString()}
                </p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={handleBackupNow}
            disabled={isBackingUp}
            className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:border-brand-400 hover:text-brand-600 disabled:opacity-60 dark:border-white/10 dark:text-slate-300"
          >
            <RefreshCw className={cn('h-3.5 w-3.5', isBackingUp && 'animate-spin')} />
            {isBackingUp ? t('Backing up…') : t('Back up now')}
          </button>
        </div>
        {backup && (
          <p className="mt-3 text-[11px] text-slate-400">
            {t(`Scheduled: ${backup.schedule} · Last snapshot size ${backup.sizeGb} GB`)}
          </p>
        )}
      </div>
    </>
  );
}

export default function Settings() {
  const { isDark } = useTheme();
  const { language, languages, setLanguageCode, t } = useLanguage();
  const { role } = useAuth();
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    let mounted = true;
    fetchSettings().then((data) => {
      if (mounted) setSettings(data);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const handleToggle = async (key, value) => {
    const updated = await updateSettings({ ...settings, [key]: value });
    setSettings(updated);
    toast.success(t('Settings updated'));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="mx-auto max-w-2xl space-y-4"
    >
      <div>
        <h1 className="font-display text-2xl font-semibold text-slate-900 dark:text-white">{t('Settings')}</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t('Manage how HealthGuard AI looks and behaves.')}</p>
      </div>

      <div className="surface-card flex items-center justify-between p-6">
        <div>
          <p className="text-sm font-semibold text-slate-900 dark:text-white">{t('Appearance')}</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {t(`Currently using ${isDark ? 'dark' : 'light'} mode. Your preference is saved automatically.`)}
          </p>
        </div>
        <ThemeToggle />
      </div>

      <div className="surface-card p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400">
              <Languages className="h-4 w-4" />
            </span>
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">{t('Language')}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t('Interface language — currently ' + language.label)}
              </p>
            </div>
          </div>
          <LanguageSelector />
        </div>
        <p className="mt-3 text-[11px] text-slate-400">
          {languages.length} {t('languages supported. Full translations for all screens are still in progress.')}
        </p>
      </div>

      <div className="surface-card p-6">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400">
            <Bell className="h-4 w-4" />
          </span>
          <p className="text-sm font-semibold text-slate-900 dark:text-white">{t('Notifications')}</p>
        </div>
        {!settings ? (
          <div className="mt-3 space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : (
          <div className="mt-1 divide-y divide-slate-200/70 dark:divide-white/10">
            <ToggleRow
              label="Email alerts"
              description="Outbreak alerts and weekly summaries by email"
              checked={settings.emailAlerts}
              onChange={(v) => handleToggle('emailAlerts', v)}
            />
            <ToggleRow
              label="SMS alerts"
              description="Urgent alerts sent directly to your phone"
              checked={settings.smsAlerts}
              onChange={(v) => handleToggle('smsAlerts', v)}
            />
          </div>
        )}
      </div>

      <div className="surface-card p-6">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400">
            <ShieldCheck className="h-4 w-4" />
          </span>
          <p className="text-sm font-semibold text-slate-900 dark:text-white">{t('Privacy')}</p>
        </div>
        {!settings ? (
          <Skeleton className="mt-3 h-10 w-full" />
        ) : (
          <div className="mt-1">
            <ToggleRow
              label="Share location for local alerts"
              description="Helps tailor outbreak alerts to your area"
              checked={settings.shareLocationForAlerts}
              onChange={(v) => handleToggle('shareLocationForAlerts', v)}
            />
          </div>
        )}
      </div>
      {role === ROLES.ADMIN && (
        <AdminSecurityAndBackup settings={settings} onToggle={handleToggle} />
      )}
    </motion.div>
  );
}
