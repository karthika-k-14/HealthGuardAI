import React, { useEffect, useState } from 'react';
import { Flame } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { fetchHealthStreak } from '../../../api/citizenApi';
import { Skeleton } from '../../../components/common/Skeleton';
import { cn } from '../../../utils/cn';

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export default function HealthStreakWidget() {
  const { t } = useTranslation();
  const [streak, setStreak] = useState(null);

  useEffect(() => {
    let mounted = true;
    fetchHealthStreak().then((data) => {
      if (mounted) setStreak(data);
    });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="surface-card p-6">
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-signal-amber/10 text-signal-amber">
          <Flame className="h-4 w-4" />
        </span>
        <p className="text-sm font-semibold text-slate-900 dark:text-white">{t('Health Streak')}</p>
      </div>

      {!streak ? (
        <Skeleton className="mt-4 h-20 w-full" />
      ) : (
        <>
          <div className="mt-4 flex items-end gap-2">
            <p className="font-display text-3xl font-semibold text-slate-900 dark:text-white">{streak.currentStreak}</p>
            <p className="pb-1 text-xs text-slate-500 dark:text-slate-400">{t('day streak')} · {t('best')} {streak.longestStreak}</p>
          </div>

          <div className="mt-4 flex items-center justify-between gap-1.5">
            {streak.last7Days.map((done, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-1">
                <span
                  className={cn(
                    'flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-semibold',
                    done ? 'bg-brand-500 text-white' : 'bg-slate-100 text-slate-400 dark:bg-white/10'
                  )}
                >
                  {done ? '✓' : ''}
                </span>
                <span className="text-[10px] text-slate-400">{DAY_LABELS[i]}</span>
              </div>
            ))}
          </div>

          <p className="mt-3 text-[11px] text-slate-400">
            {streak.currentStreak >= streak.streakGoal
              ? t("You've hit this week's goal — keep the streak alive!")
              : `${streak.streakGoal - streak.currentStreak} ${t('more days to reach your weekly goal.')}`}
          </p>
        </>
      )}
    </div>
  );
}
