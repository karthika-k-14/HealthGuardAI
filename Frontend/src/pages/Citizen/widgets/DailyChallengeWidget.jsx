import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { fetchDailyChallenge } from '../../../api/citizenApi';
import { Skeleton } from '../../../components/common/Skeleton';

export default function DailyChallengeWidget() {
  const { t } = useTranslation();
  const [challenge, setChallenge] = useState(null);

  useEffect(() => {
    fetchDailyChallenge().then(setChallenge);
  }, []);

  if (!challenge) {
    return (
      <div className="surface-card space-y-3 p-6">
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-2 w-full" />
      </div>
    );
  }

  const pct = Math.min(100, Math.round((challenge.progress / challenge.target) * 100));

  return (
    <div className="surface-card p-6">
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-signal-amber/15 text-signal-amber">
          <Trophy className="h-4 w-4" />
        </span>
        <p className="text-sm font-semibold text-slate-900 dark:text-white">{t('Daily Health Challenge')}</p>
      </div>
      <p className="mt-3 text-sm text-slate-700 dark:text-slate-200">{t(challenge.title)}</p>
      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
        <motion.div
          className="h-full rounded-full bg-signal-amber"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
      <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
        <span>{challenge.progress.toLocaleString()} / {challenge.target.toLocaleString()}</span>
        <span>{challenge.reward}</span>
      </div>
    </div>
  );
}
