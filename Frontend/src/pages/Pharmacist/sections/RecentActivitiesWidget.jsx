import React, { useEffect, useState } from 'react';
import { History } from 'lucide-react';
import { fetchRecentActivities } from '../../../api/pharmacyApi';
import { Skeleton } from '../../../components/common/Skeleton';

export default function RecentActivitiesWidget() {
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    fetchRecentActivities().then((data) => {
      if (mounted) {
        setActivities(data);
        setIsLoading(false);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="surface-card p-6">
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400">
          <History className="h-4 w-4" />
        </span>
        <p className="text-sm font-semibold text-slate-900 dark:text-white">Recent Activities</p>
      </div>

      <ol className="mt-4 space-y-3 border-l border-slate-200/70 pl-4 dark:border-white/10">
        {isLoading && Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-8 w-full" />)}
        {!isLoading &&
          activities.map((a) => (
            <li key={a.id} className="relative">
              <span className="absolute -left-[21px] top-1 h-2 w-2 rounded-full bg-brand-500" />
              <p className="text-sm text-slate-700 dark:text-slate-200">{a.label}</p>
              <p className="text-xs text-slate-400">{new Date(a.date).toLocaleDateString()}</p>
            </li>
          ))}
      </ol>
    </div>
  );
}
