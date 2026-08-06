import React from 'react';
import { Link } from 'react-router-dom';
import { ClipboardList, ArrowRight, TriangleAlert } from 'lucide-react';
import { useOfficerCases } from '../../../contexts/CaseContext';
import { PATHS } from '../../../constants/routes';
import Badge from '../../../components/common/Badge';

/**
 * At-a-glance callout so a Health Officer landing on the main
 * dashboard immediately sees whether ASHA workers have forwarded
 * cases needing review, without having to click into the sidebar
 * first. Reads from the shared CaseContext, so the count is always
 * in sync with what ASHA/Pharmacist/Citizen are doing.
 */
export default function PendingCaseReviewsWidget() {
  const { pending, critical, isLoading } = useOfficerCases();

  if (isLoading || pending.length === 0) return null;

  return (
    <Link
      to={PATHS.OFFICER_CASE_REVIEWS}
      className="surface-card flex items-center justify-between gap-3 p-4 transition-colors hover:border-brand-300 dark:hover:border-brand-500/40"
    >
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-signal-amber/10 text-amber-600 dark:text-amber-300">
          <ClipboardList className="h-5 w-5" />
        </span>
        <div>
          <p className="text-sm font-semibold text-slate-900 dark:text-white">
            {pending.length} case{pending.length > 1 ? 's' : ''} awaiting your review
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">Forwarded by ASHA workers after home visits</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {critical.length > 0 && (
          <Badge tone="rose">
            <TriangleAlert className="mr-1 h-3 w-3" /> {critical.length} critical
          </Badge>
        )}
        <ArrowRight className="h-4 w-4 text-slate-400" />
      </div>
    </Link>
  );
}
