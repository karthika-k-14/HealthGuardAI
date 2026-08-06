import React, { useEffect, useState } from 'react';
import { BellRing } from 'lucide-react';
import { fetchSuspiciousActivity } from '../../../api/adminApi';
import { Skeleton } from '../../../components/common/Skeleton';
import Badge from '../../../components/common/Badge';

const SEVERITY_TONE = { High: 'rose', Medium: 'amber', Low: 'brand' };

export default function SmartNotificationsWidget() {
  const [alerts, setAlerts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    fetchSuspiciousActivity().then((data) => {
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
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400">
          <BellRing className="h-4 w-4" />
        </span>
        <p className="text-sm font-semibold text-slate-900 dark:text-white">Smart Notifications</p>
      </div>

      <div className="mt-4 space-y-2.5">
        {isLoading && Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
        {!isLoading && alerts.length === 0 && <p className="text-sm text-slate-400">Nothing flagged right now.</p>}
        {!isLoading &&
          alerts.map((a) => (
            <div key={a.id} className="flex items-start justify-between gap-2 rounded-xl border border-slate-200/70 px-3 py-2.5 text-sm dark:border-white/10">
              <p className="text-slate-700 dark:text-slate-200">{a.label}</p>
              <Badge tone={SEVERITY_TONE[a.severity] || 'neutral'} className="shrink-0">{a.severity}</Badge>
            </div>
          ))}
      </div>
      <p className="mt-3 text-[11px] text-slate-400">Auto-surfaced from account and login pattern analysis.</p>
    </div>
  );
}
