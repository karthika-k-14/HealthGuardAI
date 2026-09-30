import React, { useEffect, useState } from 'react';
import { TriangleAlert } from 'lucide-react';
import { fetchTodaysAlerts } from '../../../api/officerApi';
import { Skeleton } from '../../../components/common/Skeleton';
import Badge from '../../../components/common/Badge';

const SEVERITY_TONE = { High: 'rose', Medium: 'amber', Low: 'brand' };

export default function TodaysAlertsWidget() {
  const [alerts, setAlerts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    fetchTodaysAlerts().then((data) => {
      if (mounted) {
        setAlerts(data);
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
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-signal-rose/10 text-signal-rose">
          <TriangleAlert className="h-4 w-4" />
        </span>
        <p className="text-sm font-semibold text-slate-900 dark:text-white">Today&apos;s Alerts</p>
      </div>

      <div className="mt-4 space-y-2.5">
        {isLoading && Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-11 w-full" />)}
        {!isLoading && alerts.length === 0 && <p className="text-sm text-slate-400">No active alerts.</p>}
        {!isLoading &&
          alerts.map((a) => (
            <div key={a.id} className="flex items-start gap-2.5 rounded-xl border border-slate-200/70 px-3 py-2.5 dark:border-white/10">
              <Badge tone={SEVERITY_TONE[a.severity] || 'neutral'} className="mt-0.5 shrink-0">{a.severity}</Badge>
              <p className="text-sm text-slate-700 dark:text-slate-200">{a.label}</p>
            </div>
          ))}
      </div>
    </div>
  );
}
