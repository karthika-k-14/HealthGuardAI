import React, { useEffect, useState } from 'react';
import { Gauge } from 'lucide-react';
import { fetchDistrictHealthScore } from '../../../api/officerApi';
import { Skeleton } from '../../../components/common/Skeleton';
import ProgressRing from '../../../components/common/ProgressRing';

export default function DistrictHealthScoreWidget() {
  const [data, setData] = useState(null);

  useEffect(() => {
    let mounted = true;
    fetchDistrictHealthScore().then((res) => {
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
          <Gauge className="h-4 w-4" />
        </span>
        <p className="text-sm font-semibold text-slate-900 dark:text-white">District Health Score</p>
      </div>

      {!data ? (
        <Skeleton className="mt-4 h-24 w-full" />
      ) : (
        <>
          <div className="mt-4 flex items-center gap-5">
            <ProgressRing value={data.score} size={96} tone={data.score >= 70 ? 'brand' : 'amber'}>
              <span className="font-display text-xl font-semibold text-slate-900 dark:text-white">{data.score}</span>
            </ProgressRing>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Composite score from recovery rates, vaccination coverage, and hospital capacity.
            </p>
          </div>
          <ul className="mt-4 space-y-2">
            {data.breakdown.map((item) => (
              <li key={item.label} className="flex items-center justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400">{item.label}</span>
                <span className="font-medium text-slate-700 dark:text-slate-200">{item.value}%</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
