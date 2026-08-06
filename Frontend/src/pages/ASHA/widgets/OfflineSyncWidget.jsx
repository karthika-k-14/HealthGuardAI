import React, { useState } from 'react';
import { CloudOff, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '../../../utils/cn';

/**
 * UI-only placeholder — real offline-first sync (IndexedDB queue +
 * background sync) is out of scope for this milestone. Demonstrates
 * the intended affordance so the feature can be wired in later.
 */
export default function OfflineSyncWidget() {
  const [syncing, setSyncing] = useState(false);

  const handleSync = () => {
    setSyncing(true);
    setTimeout(() => {
      setSyncing(false);
      toast.success('All records are in sync (demo)');
    }, 1200);
  };

  return (
    <div className="surface-card flex items-center justify-between gap-4 p-6">
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-500 dark:bg-white/10 dark:text-slate-300">
          <CloudOff className="h-4 w-4" />
        </span>
        <div>
          <p className="text-sm font-semibold text-slate-900 dark:text-white">Offline Sync</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">All records synced · placeholder</p>
        </div>
      </div>
      <button
        type="button"
        onClick={handleSync}
        disabled={syncing}
        className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:border-brand-400 hover:text-brand-600 disabled:opacity-60 dark:border-white/10 dark:text-slate-300"
      >
        <RefreshCw className={cn('h-3.5 w-3.5', syncing && 'animate-spin')} />
        {syncing ? 'Syncing…' : 'Sync now'}
      </button>
    </div>
  );
}
