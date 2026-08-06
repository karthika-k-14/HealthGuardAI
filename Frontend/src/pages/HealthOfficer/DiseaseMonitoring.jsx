import React, { useEffect, useState } from 'react';
import { AreaChart, Area, ResponsiveContainer, XAxis, Tooltip } from 'recharts';
import { Activity } from 'lucide-react';
import { fetchDiseaseMonitoring } from '../../api/officerApi';
import Badge from '../../components/common/Badge';
import { SkeletonGrid } from '../../components/common/Skeleton';

const RISK_TONE = { High: 'rose', Medium: 'amber', Low: 'brand', Critical: 'critical' };

export default function DiseaseMonitoring() {
  const [diseases, setDiseases] = useState(null);

  useEffect(() => {
    let mounted = true;
    fetchDiseaseMonitoring().then((data) => {
      if (mounted) setDiseases(data);
    });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-slate-900 dark:text-white">Disease Monitoring</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Track active cases, recovery rates, and risk levels across monitored diseases.
        </p>
      </div>

      {!diseases && <SkeletonGrid count={6} className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3" />}

      {diseases && (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {diseases.map((d) => (
            <div key={d.id} className="surface-card space-y-3 p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400">
                    <Activity className="h-4 w-4" />
                  </span>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{d.name}</p>
                </div>
                <Badge tone={RISK_TONE[d.riskLevel]}>{d.riskLevel}</Badge>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-lg bg-slate-50 p-2.5 dark:bg-white/5">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{d.activeCases}</p>
                  <p className="text-slate-400">Active cases</p>
                </div>
                <div className="rounded-lg bg-slate-50 p-2.5 dark:bg-white/5">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{d.recoveryRate}%</p>
                  <p className="text-slate-400">Recovery rate</p>
                </div>
              </div>

              <div className="h-24">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={d.trend} margin={{ top: 4, right: 4, left: 4, bottom: 0 }}>
                    <defs>
                      <linearGradient id={`grad-${d.id}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#1aab6f" stopOpacity={0.4} />
                        <stop offset="100%" stopColor="#1aab6f" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="week" tick={{ fontSize: 9 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ borderRadius: 10, border: 'none', fontSize: 11 }} />
                    <Area type="monotone" dataKey="cases" stroke="#1aab6f" strokeWidth={2} fill={`url(#grad-${d.id})`} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
