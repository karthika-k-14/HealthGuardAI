import React, { useEffect, useState } from 'react';
import { Activity } from 'lucide-react';
import { fetchLiveActivityFeed } from '../../../api/adminApi';
import { Skeleton } from '../../../components/common/Skeleton';
import Badge from '../../../components/common/Badge';

const TYPE_TONE = { Login: 'sky', 'Admin Action': 'brand', 'Campaign Update': 'amber', 'System Change': 'neutral', 'User Activity': 'brand' };

export default function LiveActivityFeedWidget() {
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    fetchLiveActivityFeed().then((data) => {
      if (mounted) {
        setLogs(data);
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
          <Activity className="h-4 w-4" />
        </span>
        <p className="text-sm font-semibold text-slate-900 dark:text-white">Live Activity Feed</p>
      </div>

      <div className="mt-4 max-h-60 space-y-2.5 overflow-y-auto pr-1">
        {isLoading && Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
        {!isLoading &&
          logs.slice(0, 6).map((log) => (
            <div key={log.id} className="flex items-start justify-between gap-2 rounded-xl border border-slate-200/70 px-3 py-2 text-xs dark:border-white/10">
              <div>
                <p className="text-slate-700 dark:text-slate-200">{log.detail}</p>
                <p className="mt-0.5 text-slate-400">{log.actor} · {new Date(log.timestamp).toLocaleString()}</p>
              </div>
              <Badge tone={TYPE_TONE[log.type] || 'neutral'} className="shrink-0">{log.type}</Badge>
            </div>
          ))}
      </div>
    </div>
  );
}
