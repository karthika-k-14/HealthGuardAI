import React, { useEffect, useState } from 'react';
import { Sparkles, Info } from 'lucide-react';
import { fetchEmergencyPrediction } from '../../../api/officerApi';
import Badge from '../../../components/common/Badge';
import { Skeleton } from '../../../components/common/Skeleton';

const RISK_TONE = { Low: 'brand', Medium: 'amber', High: 'rose', Critical: 'critical' };

export default function AIEmergencyPredictionWidget() {
  const [data, setData] = useState(null);

  useEffect(() => {
    let mounted = true;
    fetchEmergencyPrediction().then((res) => {
      if (mounted) setData(res);
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
        <p className="text-sm font-semibold text-slate-900 dark:text-white">AI Emergency Prediction</p>
      </div>

      {!data ? (
        <Skeleton className="mt-4 h-32 w-full" />
      ) : (
        <>
          <div className="mt-4 flex items-center justify-between">
            <div>
              <p className="font-display text-2xl font-semibold text-slate-900 dark:text-white">
                {data.likelihoodPercent}<span className="text-base font-normal text-slate-400">%</span>
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Emergency-load likelihood · {data.window}</p>
            </div>
            <Badge tone={RISK_TONE[data.riskLevel]}>{data.riskLevel} risk</Badge>
          </div>

          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
            <div
              className={`h-full rounded-full ${data.riskLevel === 'High' ? 'bg-signal-rose' : data.riskLevel === 'Medium' ? 'bg-signal-amber' : 'bg-brand-500'}`}
              style={{ width: `${data.likelihoodPercent}%` }}
            />
          </div>

          {data.factors.length > 0 && (
            <ul className="mt-4 space-y-1.5">
              {data.factors.map((f) => (
                <li key={f.label} className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400">{f.label}</span>
                  <span className="font-medium text-slate-700 dark:text-slate-200">{f.value}</span>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-4 rounded-xl bg-brand-50 px-3 py-2.5 text-xs font-medium text-brand-700 dark:bg-brand-500/10 dark:text-brand-300">
            {data.recommendation}
          </div>

          <p className="mt-3 flex items-start gap-1.5 text-[11px] leading-snug text-slate-400">
            <Info className="mt-0.5 h-3 w-3 shrink-0" />
            Demo projection from current capacity and alert signals — not a guaranteed forecast.
          </p>
        </>
      )}
    </div>
  );
}
