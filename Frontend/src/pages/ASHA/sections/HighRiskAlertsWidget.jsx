import React, { useEffect, useState } from 'react';
import { TriangleAlert } from 'lucide-react';
import { fetchHighRiskAlerts } from '../../../api/ashaApi';
import { Skeleton } from '../../../components/common/Skeleton';
import Badge from '../../../components/common/Badge';

export default function HighRiskAlertsWidget() {
  const [alerts, setAlerts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    fetchHighRiskAlerts().then((data) => {
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
    <div className="surface-card border-signal-rose/20 p-6">
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-signal-rose/10 text-signal-rose">
          <TriangleAlert className="h-4 w-4" />
        </span>
        <p className="text-sm font-semibold text-slate-900 dark:text-white">High Risk Alerts</p>
      </div>

      <div className="mt-4 space-y-2.5">
        {isLoading && Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-11 w-full" />)}
        {!isLoading && (Array.isArray(alerts) ? alerts : []).length === 0 && (
          <p className="text-sm text-slate-400">No high-risk alerts right now.</p>
        )}
        {!isLoading &&
          (Array.isArray(alerts) ? alerts : []).map((a) => (
            <div key={a.id} className="flex items-start gap-2.5 rounded-xl bg-signal-rose/5 px-3 py-2.5">
              <Badge tone="rose" className="mt-0.5 shrink-0">
                {a.type === 'outbreak' ? 'Outbreak' : 'Family'}
              </Badge>
              <p className="text-sm text-slate-700 dark:text-slate-200">{a.label}</p>
            </div>
          ))}
      </div>
    </div>
  );
}
