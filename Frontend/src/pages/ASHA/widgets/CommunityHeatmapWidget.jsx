import React, { useEffect, useState } from 'react';
import { Map } from 'lucide-react';
import { fetchVillageHealthScore } from '../../../api/ashaApi';
import { Skeleton } from '../../../components/common/Skeleton';
import { cn } from '../../../utils/cn';

function riskColor(risk) {
  if (risk >= 65) return 'bg-signal-rose text-white';
  if (risk >= 35) return 'bg-signal-amber text-white';
  return 'bg-brand-500 text-white';
}

export default function CommunityHeatmapWidget() {
  const [zones, setZones] = useState(null);

  useEffect(() => {
    let mounted = true;
    fetchVillageHealthScore().then((data) => {
      if (mounted) setZones(data.heatmap);
    });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="surface-card p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400">
            <Map className="h-4 w-4" />
          </span>
          <p className="text-sm font-semibold text-slate-900 dark:text-white">Community Health Heatmap</p>
        </div>
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500 dark:bg-white/10 dark:text-slate-400">
          Demo
        </span>
      </div>

      {!zones ? (
        <div className="mt-4 grid grid-cols-4 gap-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-4 gap-2">
          {zones.map((z) => (
            <div
              key={z.zone}
              className={cn('flex flex-col items-center justify-center rounded-lg py-3 text-xs font-medium', riskColor(z.risk))}
              title={`${z.zone}: risk ${z.risk}`}
            >
              {z.zone}
              <span className="text-[10px] opacity-90">{z.risk}</span>
            </div>
          ))}
        </div>
      )}

      <div className="mt-3 flex items-center gap-4 text-[11px] text-slate-400">
        <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-brand-500" /> Low</span>
        <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-signal-amber" /> Medium</span>
        <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-signal-rose" /> High</span>
      </div>
    </div>
  );
}
