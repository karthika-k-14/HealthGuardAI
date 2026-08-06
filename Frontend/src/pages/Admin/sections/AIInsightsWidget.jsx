import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BrainCircuit, ArrowRight } from 'lucide-react';
import { fetchAIRecommendations } from '../../../api/adminApi';
import { Skeleton } from '../../../components/common/Skeleton';
import { PATHS } from '../../../constants/routes';

export default function AIInsightsWidget() {
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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400">
            <BrainCircuit className="h-4 w-4" />
          </span>
          <p className="text-sm font-semibold text-slate-900 dark:text-white">AI Insights</p>
        </div>
        <Link
          to={PATHS.ADMIN_AI_INSIGHTS}
          className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400"
        >
          Open panel <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      <ul className="mt-4 space-y-2.5">
        {isLoading && Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-6 w-full" />)}
        {!isLoading &&
          recommendations.map((r, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-200">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
              {r}
            </li>
          ))}
      </ul>
    </div>
  );
}
