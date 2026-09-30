import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Building2, CheckCircle2, Clock, ShieldAlert, Activity, Stethoscope, Check } from 'lucide-react';
import { fetchPhcAlerts, fetchReferralStats, updateReferralStatus } from '../../api/surveillanceApi';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import { SkeletonGrid } from '../../components/common/Skeleton';

const SEVERITY_TONE = { High: 'rose', Critical: 'critical', Medium: 'amber', Low: 'brand' };
const STATUS_TONE = {
  ALERT_SENT: 'rose',
  PENDING: 'amber',
  ACKNOWLEDGED: 'sky',
  IN_TREATMENT: 'purple',
  CLOSED: 'brand',
};

export default function ReferralMonitoring() {
  const [alerts, setAlerts] = useState([]);
  const [stats, setStats] = useState({
    totalEscalatedCases: 0,
    alertSent: 0,
    acknowledged: 0,
    inTreatment: 0,
    closed: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const loadData = async () => {
    try {
      const [alertsData, statsData] = await Promise.all([fetchPhcAlerts(), fetchReferralStats()]);
      setAlerts(alertsData || []);
      setStats(
        statsData || {
          totalEscalatedCases: 0,
          alertSent: 0,
          acknowledged: 0,
          inTreatment: 0,
          closed: 0,
        }
      );
    } catch (e) {
      toast.error('Failed to load referral data.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdateStatus = async (alertId, newStatus) => {
    setUpdatingId(`${alertId}:${newStatus}`);
    try {
      await updateReferralStatus(alertId, newStatus);
      toast.success(`Referral status updated to ${newStatus}`);
      loadData();
    } catch (e) {
      toast.error('Failed to update referral status.');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-slate-900 dark:text-white">PHC Referral &amp; Escalation Monitoring</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Complete real-world PHC referral lifecycle management for high-risk disease surveillance cases.
        </p>
      </div>

      {/* 5 Referral Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="surface-card flex items-center gap-3 p-4">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400">
            <ShieldAlert className="h-4 w-4" />
          </span>
          <div>
            <p className="font-display text-xl font-bold text-slate-900 dark:text-white">{stats.totalEscalatedCases}</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Total Escalated</p>
          </div>
        </div>

        <div className="surface-card flex items-center gap-3 p-4">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <Clock className="h-4 w-4" />
          </span>
          <div>
            <p className="font-display text-xl font-bold text-slate-900 dark:text-white">{stats.alertSent}</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Alert Sent</p>
          </div>
        </div>

        <div className="surface-card flex items-center gap-3 p-4">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400">
            <Activity className="h-4 w-4" />
          </span>
          <div>
            <p className="font-display text-xl font-bold text-slate-900 dark:text-white">{stats.acknowledged}</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Acknowledged</p>
          </div>
        </div>

        <div className="surface-card flex items-center gap-3 p-4">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400">
            <Stethoscope className="h-4 w-4" />
          </span>
          <div>
            <p className="font-display text-xl font-bold text-slate-900 dark:text-white">{stats.inTreatment}</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">In Treatment</p>
          </div>
        </div>

        <div className="surface-card flex items-center gap-3 p-4">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400">
            <CheckCircle2 className="h-4 w-4" />
          </span>
          <div>
            <p className="font-display text-xl font-bold text-slate-900 dark:text-white">{stats.closed}</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Closed</p>
          </div>
        </div>
      </div>

      {/* Escalation Alerts Table / List with Status Action Controls */}
      <div className="surface-card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400">
              <Building2 className="h-4 w-4" />
            </span>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Active PHC Escalation Alerts &amp; Case Progression</h2>
          </div>
          <Badge tone="brand">Live PostgreSQL Data</Badge>
        </div>

        {isLoading && <SkeletonGrid count={3} className="grid gap-4 sm:grid-cols-2" />}

        {!isLoading && alerts.length === 0 && (
          <p className="text-sm text-slate-400 py-6 text-center">No PHC escalation alerts generated yet.</p>
        )}

        {!isLoading && alerts.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200/80 bg-slate-50/50 dark:border-white/10 dark:bg-white/5 font-semibold text-slate-500 dark:text-slate-400">
                  <th className="p-3">Citizen Name</th>
                  <th className="p-3">Disease</th>
                  <th className="p-3">Severity</th>
                  <th className="p-3">Assigned PHC</th>
                  <th className="p-3">Escalated Date</th>
                  <th className="p-3">Current Status</th>
                  <th className="p-3 text-right">Referral Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/60 dark:divide-white/10">
                {alerts.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50/70 dark:hover:bg-white/5 transition-colors">
                    <td className="p-3 font-bold text-slate-900 dark:text-white">{a.citizenName}</td>
                    <td className="p-3 font-semibold text-brand-600 dark:text-brand-400">{a.disease}</td>
                    <td className="p-3">
                      <Badge tone={SEVERITY_TONE[a.severity] || 'amber'}>{a.severity}</Badge>
                    </td>
                    <td className="p-3 font-semibold text-slate-800 dark:text-slate-200">
                      <div className="flex items-center gap-1">
                        <Building2 className="h-3.5 w-3.5 text-purple-600 shrink-0" />
                        {a.phcName || 'Unassigned PHC'}
                      </div>
                    </td>
                    <td className="p-3 text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                      {a.createdAt ? new Date(a.createdAt).toLocaleString() : 'Just now'}
                    </td>
                    <td className="p-3">
                      <Badge tone={STATUS_TONE[a.status] || 'rose'}>{a.status || 'ALERT_SENT'}</Badge>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Acknowledge Button */}
                        {a.status !== 'ACKNOWLEDGED' && a.status !== 'IN_TREATMENT' && a.status !== 'CLOSED' && (
                          <Button
                            variant="secondary"
                            className="text-[10px] py-1 px-2"
                            onClick={() => handleUpdateStatus(a.id, 'ACKNOWLEDGED')}
                            isLoading={updatingId === `${a.id}:ACKNOWLEDGED`}
                          >
                            <Check className="h-3 w-3 mr-1" /> Acknowledge
                          </Button>
                        )}

                        {/* Start Treatment Button */}
                        {a.status !== 'IN_TREATMENT' && a.status !== 'CLOSED' && (
                          <Button
                            variant="ghost"
                            className="text-[10px] py-1 px-2 bg-purple-500/10 text-purple-600 hover:bg-purple-500/20 font-bold"
                            onClick={() => handleUpdateStatus(a.id, 'IN_TREATMENT')}
                            isLoading={updatingId === `${a.id}:IN_TREATMENT`}
                          >
                            <Stethoscope className="h-3 w-3 mr-1" /> Start Treatment
                          </Button>
                        )}

                        {/* Close Case Button */}
                        {a.status !== 'CLOSED' && (
                          <Button
                            variant="primary"
                            className="text-[10px] py-1 px-2"
                            onClick={() => handleUpdateStatus(a.id, 'CLOSED')}
                            isLoading={updatingId === `${a.id}:CLOSED`}
                          >
                            <CheckCircle2 className="h-3 w-3 mr-1" /> Close Case
                          </Button>
                        )}

                        {a.status === 'CLOSED' && (
                          <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 className="h-3.5 w-3.5" /> Completed
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
