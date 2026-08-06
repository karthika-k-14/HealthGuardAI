import { Loader2 } from 'lucide-react';
import { cn } from '../../utils/cn';

import React from 'react';

export function Spinner({ className, size = 20 }) {
  return <Loader2 className={cn('animate-spin text-brand-500', className)} size={size} aria-hidden="true" />;
}

export default function PageLoader({ label = 'Loading…' }) {
  return (
    <div className="flex min-h-[40vh] w-full flex-col items-center justify-center gap-3 text-slate-500 dark:text-slate-400">
      <Spinner size={28} />
      <p className="text-sm">{label}</p>
    </div>
  );
}
