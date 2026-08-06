import React, { useEffect, useState } from 'react';
import { Users, Wifi, Server, Database, Activity, Cpu } from 'lucide-react';
import { fetchSystemMonitoring } from '../../api/adminApi';
import Badge from '../../components/common/Badge';
import ProgressRing from '../../components/common/ProgressRing';
import { Skeleton } from '../../components/common/Skeleton';

const STATUS_TONE = { Operational: 'brand', Degraded: 'amber', Down: 'rose' };

export default function SystemMonitoring() {
  const [data, setData] = useState(null);

  useEffect(() => {
    let mounted = true;
    fetchSystemMonitoring().then((res) => {
      if (mounted) setData(res);
    });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-slate-900 dark:text-white">System Monitoring</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Live platform infrastructure status (demo).</p>
      </div>

      {!data && <Skeleton className="h-72 w-full" />}

      {data && (
        <div className="grid gap-5 lg:grid-cols-3">
          <div className="surface-card flex items-center gap-3 p-5">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400">
              <Users className="h-5 w-5" />
            </span>
            <div>
              <p className="font-display text-xl font-semibold text-slate-900 dark:text-white">{data.activeUsers.toLocaleString()}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Active Users</p>
            </div>
          </div>

          <div className="surface-card flex items-center gap-3 p-5">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400">
              <Wifi className="h-5 w-5" />
            </span>
            <div>
              <p className="font-display text-xl font-semibold text-slate-900 dark:text-white">{data.onlineUsers.toLocaleString()}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Online Now</p>
            </div>
          </div>

          <div className="surface-card flex items-center justify-between p-5">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-300">
                <Server className="h-5 w-5" />
              </span>
              <p className="text-sm font-medium text-slate-800 dark:text-slate-100">API Status</p>
            </div>
            <Badge tone={STATUS_TONE[data.apiStatus] || 'neutral'}>{data.apiStatus}</Badge>
          </div>

          <div className="surface-card flex items-center justify-between p-5">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-300">
                <Cpu className="h-5 w-5" />
              </span>
              <p className="text-sm font-medium text-slate-800 dark:text-slate-100">Server Status</p>
            </div>
            <Badge tone={STATUS_TONE[data.serverStatus] || 'neutral'}>{data.serverStatus}</Badge>
          </div>

          <div className="surface-card p-5">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400">
                <Database className="h-4 w-4" />
              </span>
              <p className="text-sm font-medium text-slate-800 dark:text-slate-100">Storage Usage</p>
            </div>
            <div className="mt-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400">{data.storageUsedGb} GB used</span>
                <span className="text-slate-400">of {data.storageTotalGb} GB</span>
              </div>
              <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
                <div
                  className="h-full rounded-full bg-brand-500"
                  style={{ width: `${(data.storageUsedGb / data.storageTotalGb) * 100}%` }}
                />
              </div>
            </div>
          </div>

          <div className="surface-card flex items-center justify-center p-5">
            <div className="flex items-center gap-4">
              <ProgressRing value={data.systemHealth} size={72} tone={data.systemHealth >= 90 ? 'brand' : 'amber'}>
                <span className="text-sm font-semibold text-slate-900 dark:text-white">{data.systemHealth}%</span>
              </ProgressRing>
              <div>
                <p className="flex items-center gap-1.5 text-sm font-medium text-slate-800 dark:text-slate-100">
                  <Activity className="h-3.5 w-3.5" /> System Health
                </p>
              </div>
            </div>
          </div>

          <div className="surface-card p-5 lg:col-span-3">
            <p className="text-sm font-semibold text-slate-900 dark:text-white">Service Status</p>
            <div className="mt-3 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
              {data.services.map((s) => (
                <div key={s.name} className="flex items-center justify-between rounded-xl border border-slate-200/70 px-3 py-2 text-sm dark:border-white/10">
                  <span className="text-slate-700 dark:text-slate-200">{s.name}</span>
                  <Badge tone={STATUS_TONE[s.status] || 'neutral'}>{s.status}</Badge>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
