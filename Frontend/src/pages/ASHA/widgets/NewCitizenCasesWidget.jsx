import React from 'react';
import { Link } from 'react-router-dom';
import { UserPlus, ArrowRight, TriangleAlert } from 'lucide-react';
import { useAshaCases } from '../../../contexts/CaseContext';
import { PATHS } from '../../../constants/routes';
import Badge from '../../../components/common/Badge';

/**
 * At-a-glance callout for new citizen-submitted cases still needing a
 * home visit, so an ASHA worker sees it the moment they land on the
 * dashboard rather than having to open Home Visits first. Reads from
 * the shared CaseContext, so it reflects citizen symptom reports and
 * emergency alerts the instant they come in.
 */
export default function NewCitizenCasesWidget() {
  const { cases, isLoading } = useAshaCases();
  const awaitingVisit = cases.filter((c) => c.status === 'Visit Scheduled' || c.status === 'ASHA Assigned');
  const critical = awaitingVisit.filter((c) => c.riskLevel === 'High' || c.riskLevel === 'Critical');

  if (isLoading || awaitingVisit.length === 0) return null;

  return (
    <Link
      to={PATHS.ASHA_VISITS}
      className="surface-card flex items-center justify-between gap-3 p-4 transition-colors hover:border-brand-300 dark:hover:border-brand-500/40"
    >
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-signal-rose/10 text-signal-rose">
          <UserPlus className="h-5 w-5" />
        </span>
        <div>
          <p className="text-sm font-semibold text-slate-900 dark:text-white">
            {awaitingVisit.length} citizen case{awaitingVisit.length > 1 ? 's' : ''} awaiting a home visit
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">Automatically assigned from symptom reports</p>
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
