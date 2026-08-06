import React, { useEffect, useState } from 'react';
import { Building2, ArrowUpRight, CheckCircle2, Clock } from 'lucide-react';
import { fetchReferralMonitoring } from '../../api/officerApi';
import Badge from '../../components/common/Badge';
import { SkeletonGrid } from '../../components/common/Skeleton';
import { cn } from '../../utils/cn';

const LOAD_TONE = (pct) => (pct >= 85 ? 'rose' : pct >= 60 ? 'amber' : 'brand');

export default function ReferralMonitoring() {
  const [facilities, setFacilities] = useState(null);

  useEffect(() => {
    let mounted = true;
    fetchReferralMonitoring().then((data) => {
      if (mounted) setFacilities(data);
    });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-slate-900 dark:text-white">Referral Monitoring</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Track citizen referrals into PHCs and hospitals, and follow up on outcomes.
        </p>
      </div>

      {!facilities && <SkeletonGrid count={4} className="grid gap-5 lg:grid-cols-2" />}

      {facilities && (
        <div className="grid gap-5 lg:grid-cols-2">
          {facilities.map((f) => (
            <div key={f.id} className="surface-card space-y-4 p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400">
                    <Building2 className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{f.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{f.facilityType}</p>
                  </div>
                </div>
                <Badge tone={LOAD_TONE(f.currentLoadPercent)}>{f.currentLoadPercent}% load</Badge>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="rounded-lg bg-slate-50 p-2 dark:bg-white/5">
                  <p className="text-lg font-semibold text-slate-900 dark:text-white">{f.totalReferrals}</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Total referrals</p>
                </div>
                <div className="rounded-lg bg-slate-50 p-2 dark:bg-white/5">
                  <p className="text-lg font-semibold text-amber-600 dark:text-amber-400">{f.pendingReferrals}</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Pending follow-up</p>
                </div>
                <div className="rounded-lg bg-slate-50 p-2 dark:bg-white/5">
                  <p className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">{f.completedReferrals}</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Resolved</p>
                </div>
              </div>

              {f.recentReferrals.length > 0 && (
                <div className="space-y-2 border-t border-slate-200/70 pt-3 dark:border-white/10">
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Recent referrals</p>
                  {f.recentReferrals.map((r, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                        <ArrowUpRight className="h-3.5 w-3.5 text-slate-400" /> {r.citizenName} — {r.disease}
                      </span>
                      <span className={cn('flex items-center gap-1', r.status === 'Completed' ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400')}>
                        {r.status === 'Completed' ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Clock className="h-3.5 w-3.5" />}
                        {r.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {f.recentReferrals.length === 0 && (
                <p className="border-t border-slate-200/70 pt-3 text-xs text-slate-400 dark:border-white/10">No referrals yet.</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
