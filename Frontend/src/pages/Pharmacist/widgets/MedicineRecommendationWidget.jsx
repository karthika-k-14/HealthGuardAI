import React, { useEffect, useState } from 'react';
import { Lightbulb } from 'lucide-react';
import { fetchMedicineRecommendations } from '../../../api/pharmacyApi';
import { Skeleton } from '../../../components/common/Skeleton';

export default function MedicineRecommendationWidget() {
  const [recommendations, setRecommendations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    fetchMedicineRecommendations().then((data) => {
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
        <p className="text-sm font-semibold text-slate-900 dark:text-white">Reorder Recommendations</p>
      </div>

      <div className="mt-4 space-y-2.5">
        {isLoading && Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
        {!isLoading && recommendations.length === 0 && (
          <p className="text-sm text-slate-400">No reorder suggestions right now.</p>
        )}
        {!isLoading &&
          recommendations.slice(0, 5).map((r, idx) => (
            <div key={r.medicineId || r.name || idx} className="rounded-xl border border-slate-200/70 p-3 dark:border-white/10">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{r.medicineName || r.name}</p>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${r.riskLevel === 'CRITICAL' ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'}`}>
                  {r.riskLevel || 'CRITICAL'}
                </span>
              </div>
              <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-600 dark:text-slate-300">
                <span>Stock: <strong className="text-slate-900 dark:text-white">{r.currentStock}</strong></span>
                <span>Demand: <strong className="text-brand-600 dark:text-brand-400">{r.predictedDemand}</strong></span>
                <span>Order: <strong className="text-emerald-600 dark:text-emerald-400">{r.recommendedOrder}</strong></span>
                <span>Days: <strong className="text-amber-600 dark:text-amber-400">{r.estimatedDaysOfStockRemaining ?? r.daysRemaining ?? 'N/A'}</strong></span>
              </div>
              <p className="mt-1.5 text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                <span className="font-medium text-slate-700 dark:text-slate-300">Insight: </span>
                {r.insights || r.reason || 'High demand forecasted based on ML models'}
              </p>
            </div>
          ))}
      </div>
    </div>
  );
}
