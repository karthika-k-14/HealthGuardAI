import React from 'react';
import {
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  User,
  MapPin,
  Calendar,
  Building2,
  Check,
} from 'lucide-react';
import Badge from '../../../components/common/Badge';
import Button from '../../../components/common/Button';
import EmptyState from '../../../components/common/EmptyState';
import { SkeletonGrid } from '../../../components/common/Skeleton';

const STATUS_TONE = {
  PENDING: 'amber',
  UNDER_REVIEW: 'sky',
  APPROVED: 'emerald',
  REJECTED: 'rose',
};

const SEVERITY_TONE = {
  Low: 'emerald',
  Medium: 'amber',
  High: 'rose',
  Critical: 'critical',
};

export default function ReferralList({
  referrals,
  isLoading,
  onViewDetails,
  onQuickApprove,
  onQuickReject,
  actionLoadingId,
}) {
  if (isLoading) {
    return (
      <div className="surface-card p-6">
        <SkeletonGrid count={5} />
      </div>
    );
  }

  if (!referrals || referrals.length === 0) {
    return (
      <EmptyState
        icon={Building2}
        title="No referrals available."
        description="There are no referral cases matching your current filter criteria or recorded in the database."
      />
    );
  }

  return (
    <div className="surface-card overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50/80 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
            <tr>
              <th className="px-4 py-3.5">Referral ID</th>
              <th className="px-4 py-3.5">Patient Name</th>
              <th className="px-4 py-3.5">Village &amp; PHC</th>
              <th className="px-4 py-3.5">Disease &amp; Severity</th>
              <th className="px-4 py-3.5">Created By</th>
              <th className="px-4 py-3.5">Created Date</th>
              <th className="px-4 py-3.5">Status</th>
              <th className="px-4 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {referrals.map((r) => {
              const isActionLoading = actionLoadingId === r.id;
              const isPendingOrReview = r.status === 'PENDING' || r.status === 'UNDER_REVIEW';

              return (
                <tr
                  key={r.id}
                  className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                >
                  {/* Referral ID */}
                  <td className="px-4 py-3.5 font-bold text-slate-900 dark:text-white whitespace-nowrap">
                    <span className="font-mono text-xs bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                      {r.referralCode || `REF-${r.id}`}
                    </span>
                  </td>

                  {/* Patient Name */}
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <div className="font-semibold text-slate-800 dark:text-slate-200">
                      {r.patientName}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {r.patientAge ? `${r.patientAge}y` : ''}{' '}
                      {r.patientGender ? `• ${r.patientGender}` : ''}
                      {r.phoneNumber ? ` • ${r.phoneNumber}` : ''}
                    </div>
                  </td>

                  {/* Village & PHC */}
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <div className="font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-slate-400" />
                      {r.village}
                    </div>
                    <div className="text-[11px] text-slate-400 truncate max-w-[150px]" title={r.referredPhc}>
                      {r.referredPhc}
                    </div>
                  </td>

                  {/* Disease & Severity */}
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <div className="font-semibold text-slate-900 dark:text-white">
                      {r.disease}
                    </div>
                    <div className="mt-0.5">
                      <Badge tone={SEVERITY_TONE[r.severity] || 'neutral'}>
                        {r.severity || 'Medium'}
                      </Badge>
                    </div>
                  </td>

                  {/* Created By */}
                  <td className="px-4 py-3.5 whitespace-nowrap text-slate-600 dark:text-slate-300">
                    <span className="font-medium">{r.createdBy || 'ASHA Worker'}</span>
                  </td>

                  {/* Created Date */}
                  <td className="px-4 py-3.5 whitespace-nowrap text-slate-500 dark:text-slate-400 text-[11px]">
                    {r.createdAt
                      ? new Date(r.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })
                      : 'N/A'}
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <Badge tone={STATUS_TONE[r.status] || 'neutral'}>
                      {r.status || 'PENDING'}
                    </Badge>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3.5 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* View Details */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onViewDetails(r)}
                        className="p-1.5 h-7 w-7 rounded-lg text-slate-600 hover:text-slate-900"
                        title="View Referral Details"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </Button>

                      {/* Quick Approve */}
                      {isPendingOrReview && (
                        <button
                          onClick={() => onQuickApprove(r)}
                          disabled={isActionLoading}
                          className="flex items-center justify-center h-7 w-7 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/60 dark:text-emerald-400 transition-colors"
                          title="Quick Approve"
                        >
                          <Check className="h-3.5 w-3.5" />
                        </button>
                      )}

                      {/* Quick Reject */}
                      {isPendingOrReview && (
                        <button
                          onClick={() => onQuickReject(r)}
                          disabled={isActionLoading}
                          className="flex items-center justify-center h-7 w-7 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 dark:text-rose-400 transition-colors"
                          title="Reject Referral"
                        >
                          <XCircle className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
