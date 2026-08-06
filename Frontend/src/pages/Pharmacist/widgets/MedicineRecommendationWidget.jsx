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
          recommendations.map((r) => (
            <div key={r.name} className="rounded-xl border border-slate-200/70 px-3 py-2.5 dark:border-white/10">
              <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{r.name}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{r.reason}</p>
            </div>
          ))}
      </div>
    </div>
  );
}
