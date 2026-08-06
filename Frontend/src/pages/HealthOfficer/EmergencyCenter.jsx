import React, { useEffect, useState } from 'react';
import { Bug, Ambulance, PackageX, CloudRain } from 'lucide-react';
import { fetchEmergencyCenter } from '../../api/officerApi';
import Badge from '../../components/common/Badge';
import { SkeletonGrid } from '../../components/common/Skeleton';
import AIEmergencyPredictionWidget from './widgets/AIEmergencyPredictionWidget';

const SEVERITY_TONE = { High: 'rose', Medium: 'amber', Low: 'brand' };
const STATUS_TONE = { Dispatched: 'brand', Pending: 'amber' };

export default function EmergencyCenter() {
  const [data, setData] = useState(null);

  useEffect(() => {
    let mounted = true;
    fetchEmergencyCenter().then((res) => {
      if (mounted) setData(res);
    });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-slate-900 dark:text-white">Emergency Center</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Outbreaks, ambulance requests, shortages, and disaster alerts in one view.</p>
      </div>

      {!data && <SkeletonGrid count={4} className="grid gap-5 sm:grid-cols-2" />}

      {data && <AIEmergencyPredictionWidget />}

      {data && (
        <div className="grid gap-5 sm:grid-cols-2">
          <section className="surface-card p-5">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-signal-rose/10 text-signal-rose">
                <Bug className="h-4 w-4" />
              </span>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">Disease Outbreak Alerts</p>
            </div>
            <div className="mt-4 space-y-2.5">
              {data.outbreakAlerts.length === 0 && <p className="text-sm text-slate-400">No active outbreaks.</p>}
              {data.outbreakAlerts.map((a) => (
                <div key={a.id} className="flex items-center justify-between rounded-xl border border-slate-200/70 px-3 py-2 text-sm dark:border-white/10">
                  <div>
                    <p className="text-slate-700 dark:text-slate-200">{a.disease} — {a.area}</p>
                    <p className="text-xs text-slate-400">{a.reportedCases} reported cases</p>
                  </div>
                  <Badge tone={SEVERITY_TONE[a.severity]}>{a.severity}</Badge>
                </div>
              ))}
            </div>
          </section>

          <section className="surface-card p-5">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400">
                <Ambulance className="h-4 w-4" />
              </span>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">Ambulance Requests</p>
            </div>
            <div className="mt-4 space-y-2.5">
              {data.ambulanceRequests.map((a) => (
                <div key={a.id} className="flex items-center justify-between rounded-xl border border-slate-200/70 px-3 py-2 text-sm dark:border-white/10">
                  <div>
                    <p className="text-slate-700 dark:text-slate-200">{a.location}</p>
                    <p className="text-xs text-slate-400">{new Date(a.requestedAt).toLocaleString()}</p>
                  </div>
                  <Badge tone={STATUS_TONE[a.status] || 'neutral'}>{a.status}</Badge>
                </div>
              ))}
            </div>
          </section>

          <section className="surface-card p-5">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-signal-amber/10 text-signal-amber">
                <PackageX className="h-4 w-4" />
              </span>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">Medicine Shortages</p>
            </div>
            <div className="mt-4 space-y-2.5">
              {data.medicineShortages.map((s) => (
                <div key={s.id} className="flex items-center justify-between rounded-xl border border-slate-200/70 px-3 py-2 text-sm dark:border-white/10">
                  <div>
                    <p className="text-slate-700 dark:text-slate-200">{s.medicine}</p>
                    <p className="text-xs text-slate-400">{s.facility}</p>
                  </div>
                  <Badge tone={SEVERITY_TONE[s.severity]}>{s.severity}</Badge>
                </div>
              ))}
            </div>
          </section>

          <section className="surface-card p-5">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-200 text-slate-500 dark:bg-white/10 dark:text-slate-300">
                <CloudRain className="h-4 w-4" />
              </span>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">Disaster Alerts</p>
            </div>
            <div className="mt-4 space-y-2.5">
              {data.disasterAlerts.length === 0 && <p className="text-sm text-slate-400">No active disaster alerts.</p>}
              {data.disasterAlerts.map((d) => (
                <div key={d.id} className="rounded-xl border border-slate-200/70 px-3 py-2 text-sm dark:border-white/10">
                  <p className="text-slate-700 dark:text-slate-200">{d.type} — {d.area}</p>
                  <p className="text-xs text-slate-400">Issued {new Date(d.issuedOn).toLocaleDateString()} · {d.status}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
