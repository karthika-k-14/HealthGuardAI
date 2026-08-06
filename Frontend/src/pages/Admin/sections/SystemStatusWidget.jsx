import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ServerCog, ArrowRight } from 'lucide-react';
import { fetchSystemStatusSummary } from '../../../api/adminApi';
import { Skeleton } from '../../../components/common/Skeleton';
import Badge from '../../../components/common/Badge';
import { PATHS } from '../../../constants/routes';

const STATUS_TONE = { Operational: 'brand', Degraded: 'amber', Down: 'rose' };

export default function SystemStatusWidget() {
  const [status, setStatus] = useState(null);

  useEffect(() => {
    let mounted = true;
    fetchSystemStatusSummary().then((data) => {
      if (mounted) setStatus(data);
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
            <ServerCog className="h-4 w-4" />
          </span>
          <p className="text-sm font-semibold text-slate-900 dark:text-white">System Status</p>
        </div>
        <Link
          to={PATHS.ADMIN_SYSTEM}
          className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400"
        >
          Details <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      {!status ? (
        <Skeleton className="mt-4 h-24 w-full" />
      ) : (
        <div className="mt-4 space-y-2.5">
          <div className="flex items-center justify-between rounded-xl border border-slate-200/70 px-3 py-2 text-sm dark:border-white/10">
            <span className="text-slate-600 dark:text-slate-300">API Status</span>
            <Badge tone={STATUS_TONE[status.apiStatus] || 'neutral'}>{status.apiStatus}</Badge>
          </div>
          <div className="flex items-center justify-between rounded-xl border border-slate-200/70 px-3 py-2 text-sm dark:border-white/10">
            <span className="text-slate-600 dark:text-slate-300">Server Status</span>
            <Badge tone={STATUS_TONE[status.serverStatus] || 'neutral'}>{status.serverStatus}</Badge>
          </div>
          <div className="flex items-center justify-between rounded-xl border border-slate-200/70 px-3 py-2 text-sm dark:border-white/10">
            <span className="text-slate-600 dark:text-slate-300">System Health</span>
            <span className="font-medium text-slate-800 dark:text-slate-100">{status.systemHealth}%</span>
          </div>
          <div className="flex items-center justify-between rounded-xl border border-slate-200/70 px-3 py-2 text-sm dark:border-white/10">
            <span className="text-slate-600 dark:text-slate-300">Online Users</span>
            <span className="font-medium text-slate-800 dark:text-slate-100">{status.onlineUsers.toLocaleString()}</span>
          </div>
        </div>
      )}
    </div>
  );
}
