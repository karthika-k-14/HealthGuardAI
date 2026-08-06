import { cn } from '../../utils/cn';

import React from 'react';

/**
 * Generic labeled field wrapper. Wraps whatever control is passed as
 * children (input/select/textarea) with a consistent label + error
 * message, so forms across the app don't each re-implement this
 * layout by hand.
 */
export default function FormField({ label, htmlFor, error, hint, className, children }) {
  return (
    <div className={cn('space-y-1.5', className)}>
      {label && (
        <label htmlFor={htmlFor} className="label-text">
          {label}
        </label>
      )}
      {children}
      {error && <p className="text-xs text-signal-rose">{error}</p>}
      {!error && hint && <p className="text-xs text-slate-400">{hint}</p>}
    </div>
  );
}
