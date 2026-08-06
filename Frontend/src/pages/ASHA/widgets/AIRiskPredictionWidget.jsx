import React, { useEffect, useState } from 'react';
import { Sparkles, Info } from 'lucide-react';
import { fetchFamilyRiskPredictions } from '../../../api/ashaApi';
import { Skeleton } from '../../../components/common/Skeleton';
import { cn } from '../../../utils/cn';

function barTone(score) {
  if (score >= 65) return 'bg-signal-rose';
  if (score >= 40) return 'bg-signal-amber';
  return 'bg-brand-500';
}

export default function AIRiskPredictionWidget() {
  const [predictions, setPredictions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    fetchFamilyRiskPredictions().then((data) => {
      if (mounted) {
        setPredictions(data.sort((a, b) => b.riskScore - a.riskScore));
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
        <p className="text-sm font-semibold text-slate-900 dark:text-white">AI Risk Prediction</p>
      </div>

      <div className="mt-4 space-y-3">
        {isLoading && Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-8 w-full" />)}
        {!isLoading &&
          predictions.map((p) => (
            <div key={p.id}>
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-slate-700 dark:text-slate-200">{p.familyName}</span>
                <span className="text-slate-400">{p.riskScore}%</span>
              </div>
              <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
                <div
                  className={cn('h-full rounded-full transition-all duration-700', barTone(p.riskScore))}
                  style={{ width: `${p.riskScore}%` }}
                />
              </div>
            </div>
          ))}
      </div>

      <p className="mt-4 flex items-start gap-1.5 text-[11px] leading-snug text-slate-400">
        <Info className="mt-0.5 h-3 w-3 shrink-0" />
        Demo prediction derived from field data patterns — not a clinical diagnosis.
      </p>
    </div>
  );
}
