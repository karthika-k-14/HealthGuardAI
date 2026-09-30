import React, { useEffect, useState } from 'react';
import { Building2, ShieldAlert, ArrowRight } from 'lucide-react';
import { fetchPhcAlerts } from '../../../api/surveillanceApi';
import Badge from '../../../components/common/Badge';
import { SkeletonGrid } from '../../../components/common/Skeleton';
import { Link } from 'react-router-dom';

const SEVERITY_TONE = { High: 'rose', Critical: 'critical', Medium: 'amber', Low: 'brand' };
const STATUS_TONE = { ALERT_SENT: 'rose', PENDING: 'amber', ACKNOWLEDGED: 'sky', IN_TREATMENT: 'purple', CLOSED: 'brand' };

export default function RecentPHCEscalationsWidget() {
  const [alerts, setAlerts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPhcAlerts()
      .then((data) => setAlerts((data || []).slice(0, 5)))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="surface-card space-y-4 p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400">
            <ShieldAlert className="h-4 w-4" />
          </span>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">Recent PHC Escalations</h2>
        </div>
        <Link
          to="/officer/referrals"
          className="text-xs font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400 flex items-center gap-1"
        >
          View All <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      {isLoading && <SkeletonGrid count={3} className="space-y-2" />}

      {!isLoading && alerts.length === 0 && (
        <p className="text-xs text-slate-400 py-3 text-center">No recent PHC escalations recorded.</p>
      )}

      {!isLoading && alerts.length > 0 && (
        <div className="space-y-2.5">
          {alerts.map((a) => (
            <div
              key={a.id}
              className="flex items-center justify-between rounded-xl border border-slate-200/70 p-3 dark:border-white/10 text-xs hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors"
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 dark:text-white">{a.citizenName}</span>
                  <span className="text-slate-400">·</span>
                  <span className="font-semibold text-brand-600 dark:text-brand-400">{a.disease}</span>
                  <Badge tone={SEVERITY_TONE[a.severity] || 'amber'}>{a.severity}</Badge>
                </div>
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-[11px]">
                  <span className="flex items-center gap-1">
                    <Building2 className="h-3 w-3 text-purple-600 shrink-0" />
                    Assigned: <strong className="text-slate-700 dark:text-slate-200">{a.phcName || 'Unassigned PHC'}</strong>
                  </span>
                  <span>·</span>
                  <span>{a.village || 'District Village'}</span>
                </div>
              </div>

              <div className="text-right space-y-1">
                <Badge tone={STATUS_TONE[a.status] || 'rose'}>{a.status || 'ALERT_SENT'}</Badge>
                <p className="text-[10px] text-slate-400 font-mono">
                  {a.createdAt ? new Date(a.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
