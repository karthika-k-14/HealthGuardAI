import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, MapPin, ArrowRight, Building2, Calendar } from 'lucide-react';
import { fetchAssignedCitizensForAsha } from '../../../api/citizenAssignmentApi';
import { Skeleton } from '../../../components/common/Skeleton';
import { PATHS } from '../../../constants/routes';

export default function AssignedCitizensSummaryWidget() {
  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const currentUser = JSON.parse(localStorage.getItem('hg_user') || '{}');
    fetchAssignedCitizensForAsha(currentUser)
      .then((assignedList) => {
        if (mounted) {
          const list = assignedList || [];
          const pendingFollowUps = list.filter((c) => c.nextFollowUp).length;
          const todayVisits = list.filter((c) => c.lastVisit === new Date().toISOString().slice(0, 10)).length;

          setSummary({
            totalAssignedCitizens: list.length,
            assignedVillage: currentUser.village || currentUser.district || 'Coimbatore Village',
            phcName: currentUser.phc || 'Primary Health Center',
            pendingFollowups: pendingFollowUps,
            todaysVisits: todayVisits,
          });
        }
      })
      .catch(() => {
        if (mounted) {
          setSummary({
            totalAssignedCitizens: 0,
            assignedVillage: currentUser.village || 'Coimbatore Village',
            phcName: 'Primary Health Center',
            pendingFollowups: 0,
            todaysVisits: 0,
          });
        }
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="surface-card p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400">
            <Users className="h-4 w-4" />
          </span>
          <p className="text-sm font-semibold text-slate-900 dark:text-white">Assigned Citizens Summary</p>
        </div>
        <Link
          to={PATHS.ASHA_ASSIGNED_CITIZENS}
          className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400"
        >
          View all <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      {isLoading && (
        <div className="mt-4 space-y-2">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-4 w-40" />
        </div>
      )}

      {!isLoading && summary && (
        <div className="mt-4 space-y-3">
          <div className="flex items-baseline justify-between">
            <div>
              <p className="text-xs font-medium text-slate-400">Total Assigned Citizens</p>
              <p className="font-display text-3xl font-semibold text-slate-900 dark:text-white">
                {summary.totalAssignedCitizens}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs font-medium text-slate-400">Pending Follow-ups</p>
              <p className="text-xl font-bold text-amber-500">{summary.pendingFollowups}</p>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200/60 dark:border-white/10 space-y-1.5 text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400" /> Assigned Village:
              </span>
              <span className="font-semibold text-slate-800 dark:text-slate-100">{summary.assignedVillage}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5 shrink-0 text-slate-400" /> PHC Name:
              </span>
              <span className="font-semibold text-slate-800 dark:text-slate-100">{summary.phcName}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 shrink-0 text-brand-500" /> Today&apos;s Visits Recorded:
              </span>
              <span className="font-semibold text-slate-800 dark:text-slate-100">{summary.todaysVisits}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
