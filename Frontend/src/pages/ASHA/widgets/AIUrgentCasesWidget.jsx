import React from 'react';
import { AlertTriangle, User } from 'lucide-react';
import { useAshaCases } from '../../../contexts/CaseContext';
import { getDecisionForUrgency, URGENCY_TONE } from '../../../constants/urgency';
import Badge from '../../../components/common/Badge';
import { SkeletonGrid } from '../../../components/common/Skeleton';

/**
 * AI-generated High/Critical cases, each with the citizen summary,
 * detected disease category, urgency level, and the Decision
 * Engine's recommended follow-up — reads from the same shared case
 * store as NewCitizenCasesWidget/HomeVisits, just filtered and
 * detail-oriented rather than a compact callout link.
 */
export default function AIUrgentCasesWidget() {
  const { cases, isLoading } = useAshaCases();
  const urgentCases = cases.filter((c) => c.riskLevel === 'High' || c.riskLevel === 'Critical');

  if (isLoading) return <SkeletonGrid count={2} className="grid gap-4 sm:grid-cols-2" />;
  if (urgentCases.length === 0) return null;

  return (
    <div className="surface-card space-y-3 p-5">
      <p className="flex items-center gap-1.5 text-sm font-semibold text-slate-900 dark:text-white">
        <AlertTriangle className="h-4 w-4 text-signal-rose" /> AI-Generated Urgent Cases
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        {urgentCases.map((c) => {
          const decision = getDecisionForUrgency(c.riskLevel);
          return (
            <div
              key={c.id}
              className="rounded-xl border border-slate-200/70 p-3 dark:border-white/10"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400">
                    <User className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{c.citizenName}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{c.disease}</p>
                  </div>
                </div>
                <Badge tone={URGENCY_TONE[c.riskLevel]}>{c.riskLevel}</Badge>
              </div>
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                Category: <span className="font-medium text-slate-700 dark:text-slate-200">{c.diseaseCategory || 'General Illness'}</span>
              </p>
              <p className="mt-1.5 rounded-lg bg-slate-50 px-2 py-1.5 text-[11px] text-slate-600 dark:bg-white/5 dark:text-slate-300">
                Follow-up: {decision.summary}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
