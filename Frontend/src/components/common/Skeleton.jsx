import { cn } from '../../utils/cn';

import React from 'react';

/**
 * Base shimmer block. Compose these into section-specific skeleton
 * layouts (see SkeletonCard) rather than building one generic
 * skeleton that tries to fit every shape.
 */
export function Skeleton({ className }) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-lg bg-slate-200/70 dark:bg-white/10',
        className
      )}
      aria-hidden="true"
    />
  );
}

export function SkeletonCard({ className }) {
  return (
    <div className={cn('surface-card space-y-3 p-6', className)}>
      <Skeleton className="h-10 w-10 rounded-xl" />
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-4/5" />
    </div>
  );
}

export function SkeletonGrid({ count = 4, className, cardClassName }) {
  return (
    <div className={className}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} className={cardClassName} />
      ))}
    </div>
  );
}

// Explicit alias so call sites can reach for the name that matches
// what they're loading, without caring that it's the same shimmer
// building block underneath.
export const CardLoader = SkeletonCard;

export function TableLoader({ rows = 5, columns = 4, className }) {
  return (
    <div className={cn('surface-card space-y-3 p-5', className)}>
      <div className="flex gap-4">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={`h-${i}`} className="h-3 flex-1" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex gap-4">
          {Array.from({ length: columns }).map((_, c) => (
            <Skeleton key={c} className="h-8 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}
