import React, { useEffect, useState } from 'react';
import { Search, ScrollText } from 'lucide-react';
import { fetchAuditLogs } from '../../api/adminApi';
import Badge from '../../components/common/Badge';
import { SkeletonGrid } from '../../components/common/Skeleton';
import { cn } from '../../utils/cn';

const TYPE_FILTERS = ['All', 'Login', 'User Activity', 'System Change', 'Campaign Update', 'Admin Action'];
const TYPE_TONE = { Login: 'sky', 'Admin Action': 'brand', 'Campaign Update': 'amber', 'System Change': 'neutral', 'User Activity': 'brand' };

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [type, setType] = useState('All');

  useEffect(() => {
    setIsLoading(true);
    const handle = setTimeout(() => {
      fetchAuditLogs({ search, type }).then((data) => {
        setLogs(data);
        setIsLoading(false);
      });
    }, 200);
    return () => clearTimeout(handle);
  }, [search, type]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-slate-900 dark:text-white">Audit Logs</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Login history, user activities, system changes, and admin actions.</p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by actor or detail…" className="input-field pl-10" />
        </div>
        <select value={type} onChange={(e) => setType(e.target.value)} className="input-field w-full text-sm sm:w-52">
          {TYPE_FILTERS.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      {isLoading && <SkeletonGrid count={5} className="grid gap-3" />}

      {!isLoading && logs.length === 0 && (
        <div className="surface-card flex flex-col items-center gap-2 p-10 text-center text-sm text-slate-500">
          <ScrollText className="h-6 w-6 text-slate-400" />
          No log entries match your search.
        </div>
      )}

      {!isLoading && logs.length > 0 && (
        <div className="surface-card divide-y divide-slate-200/70 p-0 dark:divide-white/10">
          {logs.map((l) => (
            <div key={l.id} className={cn('flex items-center justify-between gap-3 px-5 py-3.5')}>
              <div className="min-w-0">
                <p className="truncate text-sm text-slate-700 dark:text-slate-200">{l.detail}</p>
                <p className="text-xs text-slate-400">{l.actor} · {new Date(l.timestamp).toLocaleString()}</p>
              </div>
              <Badge tone={TYPE_TONE[l.type] || 'neutral'} className="shrink-0">{l.type}</Badge>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
