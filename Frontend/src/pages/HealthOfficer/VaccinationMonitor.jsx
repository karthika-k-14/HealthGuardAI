import React, { useEffect, useState } from 'react';
import { Syringe, CalendarDays, Users } from 'lucide-react';
import { fetchVaccinationMonitor } from '../../api/officerApi';
import ProgressRing from '../../components/common/ProgressRing';
import { Skeleton } from '../../components/common/Skeleton';

export default function VaccinationMonitor() {
  const [data, setData] = useState(null);

  useEffect(() => {
    let mounted = true;
    fetchVaccinationMonitor().then((res) => {
      if (mounted) setData(res);
    });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-slate-900 dark:text-white">Vaccination Monitor</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">District-wide coverage, gaps, and upcoming drives.</p>
      </div>

      {!data && <Skeleton className="h-72 w-full" />}

      {data && (
        <div className="grid gap-5 lg:grid-cols-3">
          <div className="surface-card flex flex-col items-center p-6 text-center">
            <p className="self-start text-sm font-semibold text-slate-900 dark:text-white">Coverage</p>
            <ProgressRing value={data.coverage} size={128} tone={data.coverage >= 80 ? 'brand' : 'amber'} className="mt-4">
              <span className="font-display text-2xl font-semibold text-slate-900 dark:text-white">{data.coverage}%</span>
            </ProgressRing>
            <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">
              {data.missedVaccinations.toLocaleString()} missed vaccinations district-wide
            </p>
          </div>

          <div className="surface-card p-5 lg:col-span-2">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400">
                <Users className="h-4 w-4" />
              </span>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">Coverage by Age Group</p>
            </div>
            <div className="mt-4 space-y-3">
              {data.populationByAgeGroup.map((g) => (
                <div key={g.ageGroup}>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-600 dark:text-slate-300">{g.ageGroup} · {g.population.toLocaleString()} people</span>
                    <span className="text-slate-400">{g.covered}%</span>
                  </div>
                  <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
                    <div
                      className={`h-full rounded-full ${g.covered >= 85 ? 'bg-brand-500' : 'bg-signal-amber'}`}
                      style={{ width: `${g.covered}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="surface-card p-5 lg:col-span-3">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400">
                <CalendarDays className="h-4 w-4" />
              </span>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">Upcoming Drives</p>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {data.upcomingDrives.map((d) => (
                <div key={d.id} className="rounded-xl border border-slate-200/70 p-3 dark:border-white/10">
                  <p className="flex items-center gap-1.5 text-sm font-medium text-slate-800 dark:text-slate-100">
                    <Syringe className="h-3.5 w-3.5 text-brand-500" /> {d.name}
                  </p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{d.area}</p>
                  <p className="mt-1 text-xs text-slate-400">{new Date(d.date).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
