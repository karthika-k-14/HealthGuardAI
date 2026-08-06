import React, { useEffect, useState } from 'react';
import { Footprints } from 'lucide-react';
import { fetchVisitSummary } from '../../../api/ashaApi';
import { Skeleton } from '../../../components/common/Skeleton';
import ProgressRing from '../../../components/common/ProgressRing';

export default function DailyVisitProgressWidget() {
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    let mounted = true;
    fetchVisitSummary().then((data) => {
      if (mounted) setSummary(data);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const target = 6;
  const completedToday = summary ? Math.max(0, target - summary.todayCount) : 0;

  return (
    <div className="surface-card flex flex-col items-center p-6 text-center">
      <div className="flex items-center gap-2 self-start">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400">
          <Footprints className="h-4 w-4" />
        </span>
        <p className="text-sm font-semibold text-slate-900 dark:text-white">Daily Visit Progress</p>
      </div>

      {!summary ? (
        <Skeleton className="mt-6 h-32 w-32 rounded-full" />
      ) : (
        <ProgressRing value={completedToday} max={target} size={132} strokeWidth={12} tone="brand" className="mt-4">
          <div>
            <p className="font-display text-2xl font-semibold text-slate-900 dark:text-white">
              {completedToday}/{target}
            </p>
            <p className="text-[11px] text-slate-400">visits today</p>
          </div>
        </ProgressRing>
      )}
    </div>
  );
}
