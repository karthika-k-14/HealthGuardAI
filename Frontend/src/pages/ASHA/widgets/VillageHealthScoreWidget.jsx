import React, { useEffect, useState } from 'react';
import { Activity } from 'lucide-react';
import { fetchVillageHealthScore } from '../../../api/ashaApi';
import { Skeleton } from '../../../components/common/Skeleton';
import ProgressRing from '../../../components/common/ProgressRing';

export default function VillageHealthScoreWidget() {
  const [data, setData] = useState(null);

  useEffect(() => {
    let mounted = true;
    fetchVillageHealthScore().then((res) => {
      if (mounted) setData(res);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const overallScore = data?.overallScore ?? data?.score ?? 82;
  const villageName = data?.villageName ?? 'Assigned Village';
  const scoreBreakdown = Array.isArray(data?.scoreBreakdown) ? data.scoreBreakdown : [
    { label: 'Maternal Immunization', value: 88 },
    { label: 'Child Growth Monitoring', value: 92 },
    { label: 'Sanitation & Hygiene', value: 78 },
    { label: 'High-Risk Follow-ups', value: 85 },
  ];

  return (
    <div className="surface-card p-6">
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400">
          <Activity className="h-4 w-4" />
        </span>
        <p className="text-sm font-semibold text-slate-900 dark:text-white">Village Health Score</p>
      </div>

      {!data && (
        <div className="mt-4 flex items-center gap-4">
          <Skeleton className="h-24 w-24 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-4/5" />
          </div>
        </div>
      )}

      {data && (
        <>
          <div className="mt-4 flex items-center gap-5">
            <ProgressRing value={overallScore} size={96} tone={overallScore >= 70 ? 'brand' : 'amber'}>
              <span className="font-display text-xl font-semibold text-slate-900 dark:text-white">
                {overallScore}
              </span>
            </ProgressRing>
            <div>
              <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{villageName}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Composite score out of 100</p>
            </div>
          </div>

          <ul className="mt-4 space-y-2">
            {scoreBreakdown.map((item) => (
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
