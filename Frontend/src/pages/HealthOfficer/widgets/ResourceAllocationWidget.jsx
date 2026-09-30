import React, { useEffect, useState } from 'react';
import { BedDouble } from 'lucide-react';
import { fetchResourceAllocation } from '../../../api/officerApi';
import { Skeleton } from '../../../components/common/Skeleton';
import { cn } from '../../../utils/cn';

function occupancyTone(pct) {
  if (pct >= 85) return 'bg-signal-rose';
  if (pct >= 60) return 'bg-signal-amber';
  return 'bg-brand-500';
}

export default function ResourceAllocationWidget() {
  const [data, setData] = useState(null);

  useEffect(() => {
    let mounted = true;
    fetchResourceAllocation().then((res) => {
      if (mounted) setData(res);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const byFacility = Array.isArray(data?.byFacility) ? data.byFacility : [];

  return (
    <div className="surface-card p-6">
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400">
          <BedDouble className="h-4 w-4" />
        </span>
        <p className="text-sm font-semibold text-slate-900 dark:text-white">Resource Allocation</p>
      </div>

      {!data ? (
        <Skeleton className="mt-4 h-40 w-full" />
      ) : (
        <>
          <div className="mt-4 grid grid-cols-3 gap-3 text-center">
            <div className="rounded-xl bg-slate-50 p-3 dark:bg-white/5">
              <p className="text-sm font-semibold text-slate-900 dark:text-white">{data.availableBeds ?? 0}/{data.totalBeds ?? 0}</p>
              <p className="mt-0.5 text-[11px] text-slate-400">Beds available</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-3 dark:bg-white/5">
              <p className="text-sm font-semibold text-slate-900 dark:text-white">{data.availableIcuBeds ?? 0}/{data.totalIcuBeds ?? 0}</p>
              <p className="mt-0.5 text-[11px] text-slate-400">ICU available</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-3 dark:bg-white/5">
              <p className="text-sm font-semibold text-slate-900 dark:text-white">{data.totalAmbulances ?? 0}</p>
              <p className="mt-0.5 text-[11px] text-slate-400">Ambulances</p>
            </div>
          </div>

          <div className="mt-4 space-y-2.5">
            {byFacility.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-2">No facility data available</p>
            ) : (
              byFacility.map((f) => (
                <div key={f.name}>
                  <div className="flex items-center justify-between text-xs">
                    <span className="truncate text-slate-600 dark:text-slate-300">{f.name}</span>
                    <span className="text-slate-400">{f.bedOccupancy ?? 0}% beds</span>
                  </div>
                  <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
                    <div className={cn('h-full rounded-full', occupancyTone(f.bedOccupancy ?? 0))} style={{ width: `${f.bedOccupancy ?? 0}%` }} />
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}
