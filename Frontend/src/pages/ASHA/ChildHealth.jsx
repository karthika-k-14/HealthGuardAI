import React, { useEffect, useState } from 'react';
import { LineChart, Line, ResponsiveContainer, XAxis, Tooltip } from 'recharts';
import { Baby, Syringe, Ruler, Weight } from 'lucide-react';
import { fetchChildHealthRecords } from '../../api/ashaApi';
import Badge from '../../components/common/Badge';
import { SkeletonGrid } from '../../components/common/Skeleton';

export default function ChildHealth() {
  const [children, setChildren] = useState(null);

  useEffect(() => {
    let mounted = true;
    fetchChildHealthRecords().then((data) => {
      if (mounted) setChildren(data);
    });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-slate-900 dark:text-white">Child Health</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Growth tracking, immunization, and nutrition status for children in your area.
        </p>
      </div>

      {!children && <SkeletonGrid count={3} className="grid gap-5 lg:grid-cols-3" />}

      {children && (
        <div className="grid gap-5 lg:grid-cols-3">
          {children.map((c) => (
            <div key={c.id} className="surface-card space-y-4 p-5">
              <div className="flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-300">
                  <Baby className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{c.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{c.ageMonths} months old</p>
                </div>
              </div>

              <div className="h-24">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={c.growth} margin={{ top: 4, right: 4, left: 4, bottom: 0 }}>
                    <XAxis dataKey="ageMonths" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ borderRadius: 10, border: 'none', fontSize: 11 }} />
                    <Line type="monotone" dataKey="weightKg" stroke="#1aab6f" strokeWidth={2} dot={{ r: 2 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="flex items-center gap-1.5 rounded-lg bg-slate-50 px-2.5 py-2 dark:bg-white/5">
                  <Weight className="h-3.5 w-3.5 text-slate-400" />
                  <span className="font-medium text-slate-700 dark:text-slate-200">{c.weightKg} kg</span>
                </div>
                <div className="flex items-center gap-1.5 rounded-lg bg-slate-50 px-2.5 py-2 dark:bg-white/5">
                  <Ruler className="h-3.5 w-3.5 text-slate-400" />
                  <span className="font-medium text-slate-700 dark:text-slate-200">{c.heightCm} cm</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Badge tone={c.immunizationStatus === 'Up to date' ? 'brand' : 'amber'}>{c.immunizationStatus}</Badge>
                <Badge tone={c.nutritionStatus === 'Normal' ? 'brand' : 'amber'}>{c.nutritionStatus}</Badge>
              </div>

              {c.upcomingVaccinations.length > 0 && (
                <div className="rounded-xl border border-brand-200/60 bg-brand-50 px-3 py-2 text-xs font-medium text-brand-700 dark:border-brand-500/20 dark:bg-brand-500/10 dark:text-brand-300">
                  <span className="flex items-center gap-1.5">
                    <Syringe className="h-3.5 w-3.5" />
                    {c.upcomingVaccinations[0].vaccine} due {new Date(c.upcomingVaccinations[0].dueDate).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
