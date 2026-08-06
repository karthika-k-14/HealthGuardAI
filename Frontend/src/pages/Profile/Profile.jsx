import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, TrendingUp, BadgeCheck, Briefcase, Landmark, ShieldCheck, BarChart3 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { ROLE_LABELS, ROLES } from '../../constants/roles';
import { fetchWorkerProfile } from '../../api/ashaApi';
import { fetchPharmacistProfile } from '../../api/pharmacyApi';
import { fetchOfficerProfile } from '../../api/officerApi';
import { fetchAdminProfile } from '../../api/adminApi';
import { SkeletonGrid } from '../../components/common/Skeleton';
import { getIcon } from '../../utils/iconRegistry';
import Badge from '../../components/common/Badge';
import { useLanguage } from '../../contexts/LanguageContext';

function AshaWorkerSections() {
  const [profile, setProfile] = useState(null);
  const { t } = useLanguage();

  useEffect(() => {
    let mounted = true;
    fetchWorkerProfile().then((data) => {
      if (mounted) setProfile(data);
    });
    return () => {
      mounted = false;
    };
  }, []);

  if (!profile) return <SkeletonGrid count={2} className="mt-6 grid gap-4 sm:grid-cols-2" />;

  const { assignedArea, performance, achievements } = profile;

  return (
    <>
      <div className="surface-card mt-6 p-6">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400">
            <MapPin className="h-4 w-4" />
          </span>
          <p className="text-sm font-semibold text-slate-900 dark:text-white">{t('Assigned Area')}</p>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            ['Village', assignedArea.village],
            ['District', assignedArea.district],
            ['Households', assignedArea.householdsCovered],
            ['Population', assignedArea.population],
          ].map(([label, value]) => (
            <div key={label} className="rounded-xl bg-slate-50 p-3 dark:bg-white/5">
              <p className="text-xs text-slate-400">{t(label)}</p>
              <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">{value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="surface-card mt-4 p-6">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400">
            <TrendingUp className="h-4 w-4" />
          </span>
          <p className="text-sm font-semibold text-slate-900 dark:text-white">{t('Performance')}</p>
        </div>
        <div className="mt-4 space-y-3">
          <div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400">{t('Visits this month')}</span>
              <span className="font-medium text-slate-700 dark:text-slate-200">
                {performance.visitsThisMonth}/{performance.visitTarget}
              </span>
            </div>
            <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
              <div
                className="h-full rounded-full bg-brand-500"
                style={{ width: `${Math.min(100, (performance.visitsThisMonth / performance.visitTarget) * 100)}%` }}
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 pt-1">
            {[
              ['Families covered', performance.familiesCovered],
              ['Reports submitted', performance.reportsSubmitted],
              ['On-time rate', `${performance.onTimeRate}%`],
            ].map(([label, value]) => (
              <div key={label} className="rounded-xl bg-slate-50 p-3 text-center dark:bg-white/5">
                <p className="text-sm font-semibold text-slate-900 dark:text-white">{value}</p>
                <p className="mt-0.5 text-[11px] text-slate-400">{t(label)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="surface-card mt-4 p-6">
        <p className="text-sm font-semibold text-slate-900 dark:text-white">{t('Achievements')}</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {achievements.map((a) => {
            const Icon = getIcon(a.icon);
            return (
              <div key={a.id} className="rounded-xl border border-slate-200/70 p-4 dark:border-white/10">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400">
                  <Icon className="h-4 w-4" />
                </span>
                <p className="mt-3 text-sm font-medium text-slate-800 dark:text-slate-100">{t(a.title)}</p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{t(a.description)}</p>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

function PharmacistSections() {
  const [profile, setProfile] = useState(null);
  const { t } = useLanguage();

  useEffect(() => {
    let mounted = true;
    fetchPharmacistProfile().then((data) => {
      if (mounted) setProfile(data);
    });
    return () => {
      mounted = false;
    };
  }, []);

  if (!profile) return <SkeletonGrid count={2} className="mt-6 grid gap-4 sm:grid-cols-2" />;

  const { license, experience, achievements } = profile;

  return (
    <>
      <div className="surface-card mt-6 p-6">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400">
            <BadgeCheck className="h-4 w-4" />
          </span>
          <p className="text-sm font-semibold text-slate-900 dark:text-white">{t('License Details')}</p>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4">
          {[
            ['License No.', license.licenseNo],
            ['Issued By', license.issuedBy],
            ['Valid Till', new Date(license.validTill).toLocaleDateString()],
            ['Pharmacy', license.pharmacyName],
          ].map(([label, value]) => (
            <div key={label} className="rounded-xl bg-slate-50 p-3 dark:bg-white/5">
              <p className="text-xs text-slate-400">{t(label)}</p>
              <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">{value}</p>
            </div>
          ))}
        </div>
        <p className="mt-3 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
          <MapPin className="h-3.5 w-3.5" /> {license.pharmacyAddress}
        </p>
      </div>

      <div className="surface-card mt-4 p-6">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400">
            <Briefcase className="h-4 w-4" />
          </span>
          <p className="text-sm font-semibold text-slate-900 dark:text-white">{t('Experience')}</p>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-3">
          {[
            ['Years in practice', experience.yearsInPractice],
            ['Prescriptions verified', experience.prescriptionsVerified.toLocaleString()],
            ['Specialization', experience.specialization],
          ].map(([label, value]) => (
            <div key={label} className="rounded-xl bg-slate-50 p-3 text-center dark:bg-white/5">
              <p className="text-sm font-semibold text-slate-900 dark:text-white">{value}</p>
              <p className="mt-0.5 text-[11px] text-slate-400">{t(label)}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="surface-card mt-4 p-6">
        <p className="text-sm font-semibold text-slate-900 dark:text-white">{t('Achievements')}</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {achievements.map((a) => {
            const Icon = getIcon(a.icon);
            return (
              <div key={a.id} className="rounded-xl border border-slate-200/70 p-4 dark:border-white/10">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400">
                  <Icon className="h-4 w-4" />
                </span>
                <p className="mt-3 text-sm font-medium text-slate-800 dark:text-slate-100">{t(a.title)}</p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{t(a.description)}</p>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

function OfficerSections() {
  const [profile, setProfile] = useState(null);
  const { t } = useLanguage();

  useEffect(() => {
    let mounted = true;
    fetchOfficerProfile().then((data) => {
      if (mounted) setProfile(data);
    });
    return () => {
      mounted = false;
    };
  }, []);

  if (!profile) return <SkeletonGrid count={2} className="mt-6 grid gap-4 sm:grid-cols-2" />;

  const { department, performance, achievements } = profile;

  return (
    <>
      <div className="surface-card mt-6 p-6">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400">
            <Landmark className="h-4 w-4" />
          </span>
          <p className="text-sm font-semibold text-slate-900 dark:text-white">{t('Department & District')}</p>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4">
          {[
            ['Department', department.name],
            ['Designation', department.designation],
            ['District', department.district],
            ['In Role Since', new Date(department.since).toLocaleDateString()],
          ].map(([label, value]) => (
            <div key={label} className="rounded-xl bg-slate-50 p-3 dark:bg-white/5">
              <p className="text-xs text-slate-400">{t(label)}</p>
              <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">{value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="surface-card mt-4 p-6">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400">
            <TrendingUp className="h-4 w-4" />
          </span>
          <p className="text-sm font-semibold text-slate-900 dark:text-white">{t('Performance')}</p>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            ['Outbreaks contained', performance.outbreaksContained],
            ['Campaigns led', performance.campaignsLed],
            ['Avg. response time', `${performance.avgResponseTimeHrs}h`],
            ['District health score', performance.districtHealthScore],
          ].map(([label, value]) => (
            <div key={label} className="rounded-xl bg-slate-50 p-3 text-center dark:bg-white/5">
              <p className="text-sm font-semibold text-slate-900 dark:text-white">{value}</p>
              <p className="mt-0.5 text-[11px] text-slate-400">{t(label)}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="surface-card mt-4 p-6">
        <p className="text-sm font-semibold text-slate-900 dark:text-white">{t('Achievements')}</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {achievements.map((a) => {
            const Icon = getIcon(a.icon);
            return (
              <div key={a.id} className="rounded-xl border border-slate-200/70 p-4 dark:border-white/10">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400">
                  <Icon className="h-4 w-4" />
                </span>
                <p className="mt-3 text-sm font-medium text-slate-800 dark:text-slate-100">{t(a.title)}</p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{t(a.description)}</p>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

function AdminSections() {
  const [profile, setProfile] = useState(null);
  const { t } = useLanguage();

  useEffect(() => {
    let mounted = true;
    fetchAdminProfile().then((data) => {
      if (mounted) setProfile(data);
    });
    return () => {
      mounted = false;
    };
  }, []);

  if (!profile) return <SkeletonGrid count={2} className="mt-6 grid gap-4 sm:grid-cols-2" />;

  const { accessLevel, permissions, activitySummary } = profile;

  return (
    <>
      <div className="surface-card mt-6 p-6">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400">
            <ShieldCheck className="h-4 w-4" />
          </span>
          <p className="text-sm font-semibold text-slate-900 dark:text-white">{t('Role & Access')}</p>
        </div>
        <div className="mt-4 rounded-xl bg-slate-50 p-3 dark:bg-white/5">
          <p className="text-xs text-slate-400">{t('Access Level')}</p>
          <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">{t(accessLevel)}</p>
        </div>
        <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-slate-400">{t('Permissions')}</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {permissions.map((p) => (
            <Badge key={p} tone="brand">{t(p)}</Badge>
          ))}
        </div>
      </div>

      <div className="surface-card mt-4 p-6">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400">
            <BarChart3 className="h-4 w-4" />
          </span>
          <p className="text-sm font-semibold text-slate-900 dark:text-white">{t('Activity Summary')}</p>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            ['Actions this month', activitySummary.actionsThisMonth],
            ['Users managed', activitySummary.usersManaged.toLocaleString()],
            ['Campaigns published', activitySummary.campaignsPublished],
            ['Reports generated', activitySummary.reportsGenerated],
          ].map(([label, value]) => (
            <div key={label} className="rounded-xl bg-slate-50 p-3 text-center dark:bg-white/5">
              <p className="text-sm font-semibold text-slate-900 dark:text-white">{value}</p>
              <p className="mt-0.5 text-[11px] text-slate-400">{t(label)}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default function Profile() {
  const { user, role } = useAuth();
  const { t } = useLanguage();

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="mx-auto max-w-2xl"
    >
      <h1 className="font-display text-2xl font-semibold text-slate-900 dark:text-white">{t('Profile')}</h1>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        {t('Your account details, as recorded on HealthGuard AI.')}
      </p>

      <div className="surface-card mt-6 flex items-center gap-4 p-6">
        <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 text-xl font-semibold text-white">
          {user?.name?.charAt(0) || '?'}
        </span>
        <div>
          <p className="text-lg font-semibold text-slate-900 dark:text-white">{user?.name}</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">{t(ROLE_LABELS[role])}</p>
        </div>
      </div>

      <dl className="surface-card mt-4 divide-y divide-slate-200/70 dark:divide-white/10">
        {[
          ['Email', user?.email],
          ['Phone', user?.phone],
          ['Location', user?.location || user?.district || user?.jurisdiction || '—'],
        ].map(([label, value]) => (
          <div key={label} className="flex items-center justify-between px-6 py-4">
            <dt className="text-sm text-slate-500 dark:text-slate-400">{t(label)}</dt>
            <dd className="text-sm font-medium text-slate-900 dark:text-white">{value || '—'}</dd>
          </div>
        ))}
      </dl>

      {role === ROLES.ASHA && <AshaWorkerSections />}
      {role === ROLES.PHARMACIST && <PharmacistSections />}
      {role === ROLES.HEALTH_OFFICER && <OfficerSections />}
      {role === ROLES.ADMIN && <AdminSections />}
    </motion.div>
  );
}
