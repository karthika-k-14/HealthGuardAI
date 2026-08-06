import React, { useEffect, useState } from 'react';
import { Lightbulb } from 'lucide-react';
import { fetchAIRecommendations } from '../../../api/adminApi';
import { Skeleton } from '../../../components/common/Skeleton';

export default function AIRecommendationsWidget() {
  const [recommendations, setRecommendations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    fetchAIRecommendations().then((data) => {
      if (mounted) {
        setRecommendations(data);
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
          <Lightbulb className="h-4 w-4" />
        </span>
        <p className="text-sm font-semibold text-slate-900 dark:text-white">AI Recommendations</p>
      </div>

      <ol className="mt-4 space-y-2.5">
        {isLoading && Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
        {!isLoading &&
          recommendations.map((r, i) => (
            <li key={i} className="flex gap-2.5 rounded-xl border border-slate-200/70 px-3 py-2.5 text-sm dark:border-white/10">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-500/10 text-[11px] font-semibold text-brand-600 dark:text-brand-400">
                {i + 1}
              </span>
              <p className="text-slate-700 dark:text-slate-200">{r}</p>
            </li>
          ))}
      </ol>
    </div>
  );
}
