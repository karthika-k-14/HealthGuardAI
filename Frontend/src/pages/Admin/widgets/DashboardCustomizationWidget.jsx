import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { LayoutGrid } from 'lucide-react';
import { cn } from '../../../utils/cn';

const WIDGET_OPTIONS = [
  { key: 'commandCenter', label: 'AI Command Center' },
  { key: 'healthScore', label: 'Platform Health Score' },
  { key: 'liveActivity', label: 'Live Activity Feed' },
  { key: 'globalSearch', label: 'Global Search' },
  { key: 'recommendations', label: 'AI Recommendations' },
];

/**
 * UI-only preference panel — toggles are visual/local only for this
 * milestone. Wiring these to actually reorder/hide dashboard widgets
 * would move this state up to AdminDashboard; kept as a self-
 * contained preview for now, consistent with other UI-only affordances
 * (e.g. Download PDF, Google Login) elsewhere in the app.
 */
export default function DashboardCustomizationWidget() {
  const [visible, setVisible] = useState(() => Object.fromEntries(WIDGET_OPTIONS.map((w) => [w.key, true])));

  const toggle = (key) => {
    setVisible((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      toast.success(`${WIDGET_OPTIONS.find((w) => w.key === key).label} ${next[key] ? 'shown' : 'hidden'} (preview)`);
      return next;
    });
  };

  return (
    <div className="surface-card p-6">
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400">
          <LayoutGrid className="h-4 w-4" />
        </span>
        <p className="text-sm font-semibold text-slate-900 dark:text-white">Dashboard Customization</p>
      </div>

      <div className="mt-4 space-y-1">
        {WIDGET_OPTIONS.map((w) => (
          <button
            key={w.key}
            type="button"
            onClick={() => toggle(w.key)}
            className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-sm hover:bg-slate-50 dark:hover:bg-white/5"
          >
            <span className="text-slate-700 dark:text-slate-200">{w.label}</span>
            <span
              className={cn(
                'relative inline-flex h-5 w-9 items-center rounded-full transition-colors',
                visible[w.key] ? 'bg-brand-500' : 'bg-slate-200 dark:bg-white/10'
              )}
            >
              <span
                className={cn(
                  'inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform',
                  visible[w.key] ? 'translate-x-4' : 'translate-x-1'
                )}
              />
            </span>
          </button>
        ))}
      </div>
      <p className="mt-3 text-[11px] text-slate-400">Preview only — layout changes aren't persisted yet.</p>
    </div>
  );
}
