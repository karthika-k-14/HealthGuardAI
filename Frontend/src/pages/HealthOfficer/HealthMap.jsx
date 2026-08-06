import React, { useEffect, useState } from 'react';
import { MapPinned, Hospital, Building2 } from 'lucide-react';
import { fetchHealthMapData } from '../../api/officerApi';
import Badge from '../../components/common/Badge';
import { Skeleton } from '../../components/common/Skeleton';
import { cn } from '../../utils/cn';

const RISK_TONE = { High: 'rose', Medium: 'amber', Safe: 'brand' };
const RISK_DOT = { High: 'bg-signal-rose', Medium: 'bg-signal-amber', Safe: 'bg-brand-500' };

export default function HealthMap() {
  const [data, setData] = useState(null);

  useEffect(() => {
    let mounted = true;
    fetchHealthMapData().then((res) => {
      if (mounted) setData(res);
    });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-slate-900 dark:text-white">Health Map</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          A demo view of risk zones and facility locations across the district.
        </p>
      </div>

      {!data && <Skeleton className="h-96 w-full" />}

      {data && (
        <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
          <div className="surface-card relative overflow-hidden p-0">
            <div className="relative h-96 bg-gradient-to-br from-brand-50 to-sky-50 dark:from-white/5 dark:to-white/[0.02]">
              <div className="absolute inset-0 bg-dot-grid opacity-40" />
              {data.zones.map((z) => {
                const top = ((z.lat - 10.9) / 0.25) * 100;
                const left = ((z.lng - 76.9) / 0.25) * 100;
                return (
                  <div
                    key={z.id}
                    className="absolute -translate-x-1/2 -translate-y-1/2"
                    style={{ top: `${Math.min(92, Math.max(8, top))}%`, left: `${Math.min(92, Math.max(8, left))}%` }}
                    title={z.name}
                  >
                    <span
                      className={cn(
                        'flex h-5 w-5 items-center justify-center rounded-full ring-4 ring-white/60 dark:ring-black/30',
                        RISK_DOT[z.riskLevel]
                      )}
                    />
                  </div>
                );
              })}
              {data.facilities.map((f) => {
                const top = ((f.lat - 10.9) / 0.25) * 100;
                const left = ((f.lng - 76.9) / 0.25) * 100;
                return (
                  <div
                    key={f.id}
                    className="absolute -translate-x-1/2 -translate-y-1/2 text-slate-700 dark:text-slate-200"
                    style={{ top: `${Math.min(92, Math.max(8, top))}%`, left: `${Math.min(92, Math.max(8, left))}%` }}
                    title={f.name}
                  >
                    {f.type === 'Hospital' ? <Hospital className="h-4 w-4" /> : <Building2 className="h-4 w-4" />}
                  </div>
                );
              })}
            </div>
            <div className="flex flex-wrap items-center gap-4 border-t border-slate-200/70 px-4 py-3 text-xs text-slate-500 dark:border-white/10 dark:text-slate-400">
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-signal-rose" /> High risk</span>
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-signal-amber" /> Medium risk</span>
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-brand-500" /> Safe zone</span>
              <span className="flex items-center gap-1.5"><Hospital className="h-3.5 w-3.5" /> Hospital</span>
              <span className="flex items-center gap-1.5"><Building2 className="h-3.5 w-3.5" /> PHC</span>
              <span className="ml-auto rounded-full bg-slate-100 px-2 py-0.5 text-[10px] dark:bg-white/10">Demo placeholder</span>
            </div>
          </div>

          <div className="surface-card p-5">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400">
                <MapPinned className="h-4 w-4" />
              </span>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">Zones</p>
            </div>
            <div className="mt-4 space-y-2.5">
              {data.zones.map((z) => (
                <div key={z.id} className="flex items-center justify-between rounded-xl border border-slate-200/70 px-3 py-2 text-sm dark:border-white/10">
                  <div>
                    <p className="text-slate-700 dark:text-slate-200">{z.name}</p>
                    <p className="text-xs text-slate-400">{z.activeCases} active cases</p>
                  </div>
                  <Badge tone={RISK_TONE[z.riskLevel]}>{z.riskLevel}</Badge>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
