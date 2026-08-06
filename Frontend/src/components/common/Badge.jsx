import { cn } from '../../utils/cn';

import React from 'react';

const TONE_CLASS = {
  brand: 'bg-brand-100 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300',
  amber: 'bg-amber-100 text-amber-700 dark:bg-signal-amber/15 dark:text-signal-amber',
  rose: 'bg-rose-100 text-rose-700 dark:bg-signal-rose/15 dark:text-signal-rose',
  critical: 'bg-rose-600 text-white dark:bg-rose-500 dark:text-white',
  sky: 'bg-sky-100 text-sky-700 dark:bg-signal-sky/15 dark:text-signal-sky',
  neutral: 'bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300',
};

export default function Badge({ tone = 'neutral', className, children }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium',
        TONE_CLASS[tone] || TONE_CLASS.neutral,
        className
      )}
    >
      {children}
    </span>
  );
}
