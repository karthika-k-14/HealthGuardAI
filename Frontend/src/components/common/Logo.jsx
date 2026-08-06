import { ShieldPlus } from 'lucide-react';
import { cn } from '../../utils/cn';

import React from 'react';

export default function Logo({ className, iconOnly = false, variant = 'auto' }) {
  const textClass = variant === 'light' ? 'text-white' : 'text-slate-900 dark:text-white';
  const accentClass = variant === 'light' ? 'text-brand-200' : 'text-brand-500';

  return (
    <div className={cn('flex items-center gap-2 select-none', className)}>
      <span className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 shadow-glow">
        <ShieldPlus className="h-5 w-5 text-white" strokeWidth={2.25} aria-hidden="true" />
      </span>
      {!iconOnly && (
        <span className={cn('font-display text-lg font-semibold tracking-tight', textClass)}>
          HealthGuard <span className={accentClass}>AI</span>
        </span>
      )}
    </div>
  );
}
