import React, { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Hospital, MessageCircle, Syringe, Landmark } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useCountUp } from '../../../hooks/useCountUp';
import { fetchPlatformStats } from '../../../api/landingApi';
import { Skeleton } from '../../../components/common/Skeleton';
import RetryBlock from '../../../components/common/RetryBlock';

const STAT_CONFIG = [
  { key: 'citizensHelped', labelKey: 'Citizens Helped', icon: Users },
  { key: 'hospitalsConnected', labelKey: 'Hospitals Connected', icon: Hospital },
  { key: 'aiConsultations', labelKey: 'AI Consultations', icon: MessageCircle },
  { key: 'vaccinationDrives', labelKey: 'Vaccination Drives', icon: Syringe },
  { key: 'governmentCampaigns', labelKey: 'Government Campaigns', icon: Landmark },
];

function StatCounter({ labelKey, icon: Icon, target }) {
  const { t } = useTranslation();
  const { ref, value } = useCountUp(target);
  return (
    <div ref={ref} className="glass-panel flex flex-col items-center gap-2 px-5 py-7 text-center">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <p className="font-display text-3xl font-semibold text-slate-900 dark:text-white">
        {value.toLocaleString()}
        <span className="text-brand-500">+</span>
      </p>
      <p className="text-xs text-slate-500 dark:text-slate-400">{t(labelKey)}</p>
    </div>
  );
}

function StatSkeleton() {
  return (
    <div className="glass-panel flex flex-col items-center gap-2 px-5 py-7 text-center">
      <Skeleton className="h-10 w-10 rounded-xl" />
      <Skeleton className="h-7 w-16" />
      <Skeleton className="h-3 w-20" />
    </div>
  );
}

export default function StatsSection() {
  const { t } = useTranslation();
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const load = useCallback(() => {
    let mounted = true;
    setIsLoading(true);
    setHasError(false);
    fetchPlatformStats()
      .then((data) => {
        if (mounted) { setStats(data); setIsLoading(false); }
      })
      .catch(() => {
        if (mounted) { setHasError(true); setIsLoading(false); }
      });
    return () => { mounted = false; };
  }, []);

  useEffect(() => load(), [load]);

  return (
    <section id="stats" className="px-6 py-16 sm:px-8">
      <div className="mx-auto max-w-7xl">
        {hasError ? (
          <RetryBlock message={t("We couldn't load platform statistics.")} onRetry={load} />
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5"
          >
            {isLoading
              ? STAT_CONFIG.map((s) => <StatSkeleton key={s.key} />)
              : STAT_CONFIG.map((s) => (
                  <StatCounter key={s.key} labelKey={s.labelKey} icon={s.icon} target={stats?.[s.key] ?? 0} />
                ))}
          </motion.div>
        )}
      </div>
    </section>
  );
}
