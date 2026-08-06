import React, { useEffect, useState } from 'react';
import { Pill } from 'lucide-react';
import { fetchMedicineDemandPrediction } from '../../../api/officerApi';
import { Skeleton } from '../../../components/common/Skeleton';
import Badge from '../../../components/common/Badge';

const DEMAND_TONE = { High: 'rose', Medium: 'amber', Low: 'brand' };

export default function MedicineDemandWidget() {
  const [demand, setDemand] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    fetchMedicineDemandPrediction().then((data) => {
      if (mounted) {
        setDemand(data);
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
          <Pill className="h-4 w-4" />
        </span>
        <p className="text-sm font-semibold text-slate-900 dark:text-white">Medicine Demand Prediction</p>
      </div>

      <div className="mt-4 space-y-2.5">
        {isLoading && Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
        {!isLoading &&
          demand.map((d) => (
            <div key={d.medicine} className="flex items-center justify-between rounded-xl border border-slate-200/70 px-3 py-2 text-sm dark:border-white/10">
              <div>
                <p className="text-slate-700 dark:text-slate-200">{d.medicine}</p>
                <p className="text-xs text-slate-400">Driven by {d.disease}</p>
              </div>
              <Badge tone={DEMAND_TONE[d.demandLevel]}>{d.demandLevel}</Badge>
            </div>
          ))}
      </div>
    </div>
  );
}
