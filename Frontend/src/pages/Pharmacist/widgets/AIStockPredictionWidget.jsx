import React, { useEffect, useState } from 'react';
import { TrendingDown, Info } from 'lucide-react';
import { fetchStockPrediction } from '../../../api/pharmacyApi';
import { Skeleton } from '../../../components/common/Skeleton';
import { cn } from '../../../utils/cn';

function urgencyTone(days) {
  if (days <= 5) return 'bg-signal-rose';
  if (days <= 12) return 'bg-signal-amber';
  return 'bg-brand-500';
}

export default function AIStockPredictionWidget() {
  const [predictions, setPredictions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    fetchStockPrediction().then((data) => {
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
          <TrendingDown className="h-4 w-4" />
        </span>
        <p className="text-sm font-semibold text-slate-900 dark:text-white">AI Stock Prediction</p>
      </div>

      <div className="mt-4 space-y-3">
        {isLoading && Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-8 w-full" />)}
        {!isLoading &&
          predictions.map((p) => (
            <div key={p.id}>
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-slate-700 dark:text-slate-200">{p.name}</span>
                <span className="text-slate-400">{p.daysLeft}d left</span>
              </div>
              <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
                <div
                  className={cn('h-full rounded-full transition-all duration-700', urgencyTone(p.daysLeft))}
                  style={{ width: `${Math.min(100, (p.daysLeft / 30) * 100)}%` }}
                />
              </div>
            </div>
          ))}
      </div>

      <p className="mt-4 flex items-start gap-1.5 text-[11px] leading-snug text-slate-400">
        <Info className="mt-0.5 h-3 w-3 shrink-0" />
        Estimated from recent usage patterns — a demo projection, not a guarantee.
      </p>
    </div>
  );
}
