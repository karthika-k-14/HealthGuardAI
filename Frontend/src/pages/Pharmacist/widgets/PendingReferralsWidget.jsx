import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ClipboardList, ArrowRight } from 'lucide-react';
import { fetchOfficerReferralNotes } from '../../../api/workflowApi';
import { PATHS } from '../../../constants/routes';

/**
 * At-a-glance callout for referral notes the Health Officer has just
 * issued, so a Pharmacist sees new PHC availability checks to run the
 * moment they land on the dashboard.
 */
export default function PendingReferralsWidget() {
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    fetchOfficerReferralNotes().then((notes) => {
      setPendingCount(notes.filter((n) => n.status === 'pending').length);
    });
  }, []);

  if (pendingCount === 0) return null;

  return (
    <Link
      to={PATHS.PHARMACIST_PRESCRIPTIONS}
      className="surface-card flex items-center justify-between gap-3 p-4 transition-colors hover:border-brand-300 dark:hover:border-brand-500/40"
    >
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400">
          <ClipboardList className="h-5 w-5" />
        </span>
        <div>
          <p className="text-sm font-semibold text-slate-900 dark:text-white">
            {pendingCount} new referral note{pendingCount > 1 ? 's' : ''} from Health Officer
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">Awaiting PHC availability verification</p>
        </div>
      </div>
      <ArrowRight className="h-4 w-4 text-slate-400" />
    </Link>
  );
}

