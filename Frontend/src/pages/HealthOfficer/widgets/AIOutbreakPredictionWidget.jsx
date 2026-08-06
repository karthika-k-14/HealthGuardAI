import React, { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Minus, Sparkles } from 'lucide-react';
import { fetchOutbreakPrediction } from '../../../api/officerApi';
import { Skeleton } from '../../../components/common/Skeleton';
import { cn } from '../../../utils/cn';

const DIRECTION_ICON = { rising: TrendingUp, falling: TrendingDown, steady: Minus };
const DIRECTION_TONE = { rising: 'text-signal-rose', falling: 'text-brand-600', steady: 'text-slate-400' };

export default function AIOutbreakPredictionWidget() {
  const [predictions, setPredictions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    fetchOutbreakPrediction().then((data) => {
      if (mounted) {
        setPredictions(data);
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
        <p className="text-sm font-semibold text-slate-900 dark:text-white">AI Outbreak Prediction</p>
      </div>

      <div className="mt-4 space-y-2.5">
        {isLoading && Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
        {!isLoading &&
          predictions.map((p) => {
            const Icon = DIRECTION_ICON[p.direction];
            return (
              <div key={p.disease} className="flex items-center justify-between rounded-xl border border-slate-200/70 px-3 py-2 text-sm dark:border-white/10">
                <span className="text-slate-700 dark:text-slate-200">{p.disease}</span>
                <span className="flex items-center gap-1.5">
                  <span className="text-xs text-slate-400">{p.currentCases} → {p.projectedCases2Weeks}</span>
                  <Icon className={cn('h-4 w-4', DIRECTION_TONE[p.direction])} />
                </span>
              </div>
            );
          })}
      </div>
      <p className="mt-3 text-[11px] text-slate-400">2-week projection from current trend — a demo estimate, not a clinical forecast.</p>
    </div>
  );
}
