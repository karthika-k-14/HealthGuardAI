import React, { useEffect, useState } from 'react';
import { Syringe, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { fetchVaccinationRecord } from '../../api/vaccinationApi';
import ProgressRing from '../../components/common/ProgressRing';
import Badge from '../../components/common/Badge';
import { SkeletonGrid } from '../../components/common/Skeleton';

export default function VaccinationTracker() {
  const [record, setRecord] = useState(null);

  useEffect(() => {
    fetchVaccinationRecord().then(setRecord);
  }, []);

  if (!record) {
    return <SkeletonGrid count={3} className="mx-auto grid max-w-5xl gap-4 sm:grid-cols-3" cardClassName="p-6" />;
  }

  const total = record.completed.length + record.upcoming.length + record.missed.length;
  const pct = Math.round((record.completed.length / total) * 100);

  return (
    <div className="mx-auto max-w-5xl">
      <span className="section-eyebrow">
        <Syringe className="h-3.5 w-3.5" /> Vaccination Tracker
      </span>
      <h1 className="mt-2 font-display text-2xl font-semibold text-slate-900 dark:text-white">
        Stay on top of your vaccinations
      </h1>

      <div className="surface-card mt-6 flex flex-col items-center gap-4 p-6 sm:flex-row sm:justify-between">
        <div className="flex items-center gap-4">
          <ProgressRing value={record.completed.length} max={total} size={96} strokeWidth={9} tone="brand">
            <div className="text-center">
              <p className="font-display text-xl font-semibold text-slate-900 dark:text-white">{pct}%</p>
            </div>
          </ProgressRing>
          <div>
            <p className="text-sm font-semibold text-slate-900 dark:text-white">Overall progress</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {record.completed.length} completed · {record.upcoming.length} upcoming · {record.missed.length} missed
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 sm:grid-cols-3">
        <div>
          <p className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-brand-700 dark:text-brand-300">
            <CheckCircle2 className="h-4 w-4" /> Completed
          </p>
          <div className="space-y-3">
            {record.completed.map((v) => (
              <div key={v.id} className="surface-card p-4">
                <p className="text-sm font-medium text-slate-900 dark:text-white">{v.name}</p>
                <p className="text-xs text-slate-400">{v.provider}</p>
                <p className="mt-1 text-xs text-slate-400">
                  {new Date(v.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-sky-600 dark:text-sky-300">
            <Clock className="h-4 w-4" /> Upcoming
          </p>
          <div className="space-y-3">
            {record.upcoming.map((v) => (
              <div key={v.id} className="surface-card p-4">
                <p className="text-sm font-medium text-slate-900 dark:text-white">{v.name}</p>
                <p className="text-xs text-slate-400">{v.provider}</p>
                <Badge tone="sky" className="mt-2">
                  Due {new Date(v.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-signal-rose">
            <AlertCircle className="h-4 w-4" /> Missed
          </p>
          <div className="space-y-3">
            {record.missed.map((v) => (
              <div key={v.id} className="surface-card p-4">
                <p className="text-sm font-medium text-slate-900 dark:text-white">{v.name}</p>
                <p className="text-xs text-slate-400">{v.provider}</p>
                <Badge tone="rose" className="mt-2">
                  Was due {new Date(v.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </Badge>
              </div>
            ))}
            {record.missed.length === 0 && <p className="text-sm text-slate-400">Nothing missed — great job!</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
