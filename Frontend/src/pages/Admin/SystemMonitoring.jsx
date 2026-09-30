import React, { useEffect, useState } from 'react';
import { Users, Wifi, Server, Database, Activity, Cpu, RefreshCw, AlertCircle } from 'lucide-react';
import { fetchSystemMonitoring } from '../../api/adminApi';
import Badge from '../../components/common/Badge';
import ProgressRing from '../../components/common/ProgressRing';
import { Skeleton } from '../../components/common/Skeleton';

const STATUS_TONE = { Operational: 'brand', UP: 'brand', Healthy: 'brand', Degraded: 'amber', Down: 'rose', Offline: 'rose' };

export default function SystemMonitoring() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadMonitoringData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetchSystemMonitoring();
      setData(res);
    } catch (err) {
      console.error('Error fetching system monitoring:', err);
      setError(err?.response?.data?.message || err?.message || 'Failed to connect to backend monitoring service.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMonitoringData();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-slate-900 dark:text-white">System Monitoring</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Real-time platform infrastructure health and PostgreSQL database status.
          </p>
        </div>
        <button
          onClick={loadMonitoringData}
          disabled={isLoading}
          className="btn-outline flex items-center justify-center gap-2 text-xs shrink-0"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh Health
        </button>
      </div>

      {isLoading && <Skeleton className="h-72 w-full" />}

      {!isLoading && error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-800 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 shrink-0 text-red-600 dark:text-red-400 mt-0.5" />
            <div>
              <h3 className="font-semibold text-sm">Failed to load system monitoring status</h3>
              <p className="mt-1 text-xs">{error}</p>
            </div>
          </div>
        </div>
      )}

      {!isLoading && !error && data && (
        <div className="grid gap-5 lg:grid-cols-3">
          <div className="surface-card flex items-center gap-3 p-5">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400">
              <Users className="h-5 w-5" />
            </span>
            <div>
              <p className="font-display text-xl font-semibold text-slate-900 dark:text-white">
                {typeof data.activeUsers === 'number' ? data.activeUsers.toLocaleString() : data.activeUsers}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Total Active Users</p>
            </div>
          </div>

          <div className="surface-card flex items-center gap-3 p-5">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400">
              <Wifi className="h-5 w-5" />
            </span>
            <div>
              <p className="font-display text-xl font-semibold text-slate-900 dark:text-white">
                {data.onlineUsers}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Online Users</p>
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
              <p className="text-sm font-medium text-slate-800 dark:text-slate-100">Database Size (PostgreSQL)</p>
            </div>
            <div className="mt-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-700 font-semibold dark:text-slate-200">{data.databaseSize || data.storageUsedGb} used</span>
                <span className="text-slate-400">Max Capacity: {data.databaseCapacity || 'Not Configured'}</span>
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
            <p className="text-sm font-semibold text-slate-900 dark:text-white">Microservice Status</p>
            <div className="mt-3 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
              {(data.services || []).map((s) => (
                <div key={s.name || s.service} className="flex items-center justify-between rounded-xl border border-slate-200/70 px-4 py-3 text-sm dark:border-white/10">
                  <div>
                    <p className="font-semibold text-slate-800 dark:text-slate-100">{s.name || s.service}</p>
                    {s.port && <p className="text-[11px] text-slate-400">Port {s.port}</p>}
                  </div>
                  <Badge tone={STATUS_TONE[s.status] || STATUS_TONE[s.rawStatus] || 'neutral'}>
                    {s.status}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
