import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, MapPin, ArrowRight, Building2 } from 'lucide-react';
import { fetchAshaDashboard } from '../../../api/ashaAssignedApi';
import { Skeleton } from '../../../components/common/Skeleton';
import { PATHS } from '../../../constants/routes';

/**
 * Phase 2A - real-backend dashboard summary (GET /asha/dashboard via
 * ashaAssignedApi.js). Shows the ASHA worker's assigned village and total
 * assigned citizen count. Deliberately separate from the still-mock
 * widgets already on this dashboard (tasks, visits, alerts, etc.) - none
 * of those are touched here.
 */
export default function AssignedCitizensSummaryWidget() {
  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let mounted = true;
    fetchAshaDashboard()
      .then((data) => {
        if (mounted) setSummary(data);
      })
      .catch(() => {
        if (mounted) setHasError(true);
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
          <p className="text-sm font-semibold text-slate-900 dark:text-white">Assigned Citizens</p>
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

      {!isLoading && hasError && (
        <p className="mt-4 text-sm text-slate-400">Couldn&apos;t load your dashboard summary right now.</p>
      )}

      {!isLoading && !hasError && summary && (
        <div className="mt-4 space-y-3">
          <p className="font-display text-3xl font-semibold text-slate-900 dark:text-white">
            {summary.totalAssignedCitizens}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">Citizens in your assigned village</p>

          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            {summary.assignedVillageName
              ? `${summary.assignedVillageName}${summary.assignedVillageDistrict ? `, ${summary.assignedVillageDistrict}` : ''}`
              : 'No village assigned yet'}
          </div>
          {summary.assignedPhcName && (
            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
              <Building2 className="h-3.5 w-3.5 shrink-0" /> {summary.assignedPhcName}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
