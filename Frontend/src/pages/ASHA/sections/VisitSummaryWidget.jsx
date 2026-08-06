import React, { useEffect, useState } from 'react';
import { CalendarCheck } from 'lucide-react';
import { fetchVisitSummary } from '../../../api/ashaApi';
import { Skeleton } from '../../../components/common/Skeleton';
import ProgressRing from '../../../components/common/ProgressRing';

export default function VisitSummaryWidget() {
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

  return (
    <div className="surface-card p-6">
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400">
          <CalendarCheck className="h-4 w-4" />
        </span>
        <p className="text-sm font-semibold text-slate-900 dark:text-white">Visit Summary</p>
      </div>

      {!summary && (
        <div className="mt-4 flex items-center gap-4">
          <Skeleton className="h-20 w-20 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        </div>
      )}

      {summary && (
        <div className="mt-4 flex items-center gap-5">
          <ProgressRing value={summary.todayCount} max={summary.todayCount + summary.upcomingCount || 1} size={84} tone="brand">
            <span className="text-lg font-semibold text-slate-900 dark:text-white">{summary.todayCount}</span>
          </ProgressRing>
          <dl className="flex-1 space-y-1.5 text-sm">
            <div className="flex justify-between">
              <dt className="text-slate-500 dark:text-slate-400">Today</dt>
              <dd className="font-medium text-slate-800 dark:text-slate-100">{summary.todayCount}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500 dark:text-slate-400">Upcoming</dt>
              <dd className="font-medium text-slate-800 dark:text-slate-100">{summary.upcomingCount}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500 dark:text-slate-400">Completed (week)</dt>
              <dd className="font-medium text-slate-800 dark:text-slate-100">{summary.completedThisWeek}</dd>
            </div>
          </dl>
        </div>
      )}
    </div>
  );
}
