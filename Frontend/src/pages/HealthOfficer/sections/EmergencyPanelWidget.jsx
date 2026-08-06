import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Siren, ArrowRight } from 'lucide-react';
import { fetchEmergencyPanelSummary } from '../../../api/officerApi';
import { Skeleton } from '../../../components/common/Skeleton';
import { PATHS } from '../../../constants/routes';

const ITEMS = [
  { key: 'outbreakAlerts', label: 'Outbreak Alerts' },
  { key: 'ambulanceRequests', label: 'Pending Ambulance Requests' },
  { key: 'medicineShortages', label: 'Medicine Shortages' },
  { key: 'disasterAlerts', label: 'Disaster Alerts' },
];

export default function EmergencyPanelWidget() {
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    let mounted = true;
    fetchEmergencyPanelSummary().then((data) => {
      if (mounted) setSummary(data);
    });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="surface-card border-signal-rose/20 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-signal-rose/10 text-signal-rose">
            <Siren className="h-4 w-4" />
          </span>
          <p className="text-sm font-semibold text-slate-900 dark:text-white">Emergency Panel</p>
        </div>
        <Link
          to={PATHS.OFFICER_EMERGENCY}
          className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400"
        >
          Open center <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      {!summary ? (
        <Skeleton className="mt-4 h-24 w-full" />
      ) : (
        <div className="mt-4 grid grid-cols-2 gap-3">
          {ITEMS.map((item) => (
            <div key={item.key} className="rounded-xl bg-signal-rose/5 p-3 text-center">
              <p className="font-display text-xl font-semibold text-signal-rose">{summary[item.key]}</p>
              <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">{item.label}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
