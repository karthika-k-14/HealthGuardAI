import { CheckCircle2, Circle } from 'lucide-react';
import { cn } from '../../utils/cn';

import React from 'react';

const STAGE_ORDER = [
  'Submitted',
  'AI Reviewed',
  'ASHA Assigned',
  'Visit Scheduled',
  'Visit Completed',
  'Forwarded to Officer',
  'Officer Reviewing',
  'Prescription Generated',
  'Sent to Pharmacy',
  'Medicine Ready',
  'Medicine Collected',
  'Recovery Monitoring',
  'Completed',
];

/**
 * Renders the unified case timeline used across every dashboard for
 * a workflow-engine case: Submitted -> AI Reviewed -> ASHA Assigned
 * -> Visit Scheduled -> Visit Completed -> Forwarded to Officer -> Officer
 * Reviewing -> Prescription Generated -> Sent to Pharmacy -> Medicine
 * Ready -> Medicine Collected -> Recovery Monitoring -> Completed.
 * `timeline` is the case's own recorded entries: [{ label, at }].
 * Branch-only events (Officer Approved/Rejected, Lab Test Requested,
 * Referred to Hospital) aren't part of the linear stepper but still
 * exist in the raw timeline array and are reflected by whichever
 * later stage-order label they lead to (e.g. a rejected case still
 * lights up "Completed").
 */
export { STAGE_ORDER };

/**
 * Returns 0-100 progress through the full case status flow, used for
 * the Citizen dashboard's progress bar / recovery percentage.
 */
export function getCaseProgressPercent(timeline = []) {
  const reachedLabels = new Set(timeline.map((t) => t.label));
  const lastReachedIndex = STAGE_ORDER.reduce(
    (acc, label, i) => (reachedLabels.has(label) ? i : acc),
    0
  );
  return Math.round((lastReachedIndex / (STAGE_ORDER.length - 1)) * 100);
}

export default function CaseTimeline({ timeline = [], compact = false }) {
  const reachedLabels = new Set(timeline.map((t) => t.label));
  const entryByLabel = Object.fromEntries(timeline.map((t) => [t.label, t]));

  const lastReachedIndex = STAGE_ORDER.reduce(
    (acc, label, i) => (reachedLabels.has(label) ? i : acc),
    0
  );
  const windowStart = compact ? Math.max(0, lastReachedIndex - 1) : 0;
  const windowEnd = compact ? Math.min(STAGE_ORDER.length - 1, lastReachedIndex + 2) : STAGE_ORDER.length - 1;
  const visibleStages = STAGE_ORDER.slice(windowStart, windowEnd + 1);

  return (
    <ol className={cn('space-y-0', compact ? 'text-xs' : 'text-sm')}>
      {compact && windowStart > 0 && (
        <li className="pb-2 pl-7 text-[11px] text-slate-400">{windowStart} earlier step{windowStart > 1 ? 's' : ''} completed…</li>
      )}
      {visibleStages.map((label, i) => {
        const reached = reachedLabels.has(label);
        const entry = entryByLabel[label];
        const isLast = i === visibleStages.length - 1;
        return (
          <li key={label} className="relative flex gap-3 pb-4 last:pb-0">
            {!isLast && (
              <span
                className={cn(
                  'absolute left-[9px] top-5 h-full w-px',
                  reached ? 'bg-brand-500' : 'bg-slate-200 dark:bg-white/10'
                )}
              />
            )}
            {reached ? (
              <CheckCircle2 className="h-[18px] w-[18px] shrink-0 text-brand-500" aria-hidden="true" />
            ) : (
              <Circle className="h-[18px] w-[18px] shrink-0 text-slate-300 dark:text-white/15" aria-hidden="true" />
            )}
            <div className="min-w-0 flex-1">
              <p className={cn('font-medium', reached ? 'text-slate-800 dark:text-slate-100' : 'text-slate-400')}>
                {label}
              </p>
              {entry && (
                <p className="text-xs text-slate-400">{new Date(entry.at).toLocaleString()}</p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
