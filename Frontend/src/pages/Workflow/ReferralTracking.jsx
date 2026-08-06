import React, { useState } from 'react';
import ReferralTrackerModal from '../../components/workflow/ReferralTrackerModal';
import Button from '../../components/common/Button';
import { GitPullRequest } from 'lucide-react';

export default function ReferralTracking() {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-slate-900 dark:text-white">Referral Tracking</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Track workflow cases and statuses associated with hospital and PHC referrals.
        </p>
      </div>

      <div className="surface-card p-8 flex flex-col items-center justify-center gap-3 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-400">
          <GitPullRequest className="h-6 w-6" />
        </span>
        <h2 className="text-base font-bold text-slate-900 dark:text-white">Track Referral Workflow Cases</h2>
        <p className="text-xs text-slate-500 max-w-md">
          Enter a Referral ID to view origin/destination facilities, referral reasons, and all associated workflow cases.
        </p>
        <Button variant="primary" onClick={() => setIsOpen(true)} className="mt-2 text-xs">
          Open Referral Tracker
        </Button>
      </div>

      <ReferralTrackerModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </div>
  );
}
