import { cn } from '../../utils/cn';

import React from 'react';

/**
 * Generic empty-state block. Many pages across roles show a
 * "nothing here" card with an icon + message after a search/filter
 * yields no results — this centralizes that pattern instead of each
 * page redefining its own markup.
 */
export default function EmptyState({ icon: Icon, title, description, action, className }) {
  return (
    <div className={cn('surface-card flex flex-col items-center gap-2 p-10 text-center', className)}>
      {Icon && <Icon className="h-6 w-6 text-slate-400" />}
      {title && <p className="text-sm font-medium text-slate-600 dark:text-slate-300">{title}</p>}
      {description && <p className="text-sm text-slate-400">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
