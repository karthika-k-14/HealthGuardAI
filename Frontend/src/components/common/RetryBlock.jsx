import { RefreshCcw } from 'lucide-react';
import Button from './Button';
import { cn } from '../../utils/cn';

import React from 'react';

/**
 * Generic "something failed to load" block with a retry button.
 * Pages that fetch data can show this in place of their content when
 * a request fails, instead of each one hand-rolling its own error UI.
 */
export default function RetryBlock({ message = "We couldn't load this. Please try again.", onRetry, className }) {
  return (
    <div className={cn('surface-card flex flex-col items-center gap-3 p-10 text-center', className)}>
      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-signal-rose/10 text-signal-rose">
        <RefreshCcw className="h-5 w-5" />
      </span>
      <p className="text-sm text-slate-500 dark:text-slate-400">{message}</p>
      {onRetry && (
        <Button variant="secondary" onClick={onRetry} className="text-sm">
          <RefreshCcw className="h-3.5 w-3.5" /> Try again
        </Button>
      )}
    </div>
  );
}
