import React, { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { fetchDailyInsights } from '../../../api/pharmacyApi';
import { Skeleton } from '../../../components/common/Skeleton';

export default function DailyInsightsWidget() {
  const [insights, setInsights] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    fetchDailyInsights().then((data) => {
      if (mounted) {
        setInsights(data);
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
          <Sparkles className="h-4 w-4" />
        </span>
        <p className="text-sm font-semibold text-slate-900 dark:text-white">Daily Pharmacy Insights</p>
      </div>

      <ul className="mt-4 space-y-2.5">
        {isLoading && Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-6 w-full" />)}
        {!isLoading &&
          insights.map((insight, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-200">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
              {insight}
            </li>
          ))}
      </ul>
    </div>
  );
}
