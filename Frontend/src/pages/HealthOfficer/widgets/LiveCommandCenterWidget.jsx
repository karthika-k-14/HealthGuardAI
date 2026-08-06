import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Radio } from 'lucide-react';
import { fetchCommandCenterPulse } from '../../../api/officerApi';
import { Skeleton } from '../../../components/common/Skeleton';

const ITEMS = [
  { key: 'activeOutbreaks', label: 'Active Outbreaks' },
  { key: 'hospitalsNearCapacity', label: 'Hospitals Near Capacity' },
  { key: 'pendingAmbulanceRequests', label: 'Pending Ambulance Requests' },
  { key: 'campaignsActive', label: 'Active Campaigns' },
];

export default function LiveCommandCenterWidget() {
  const [pulse, setPulse] = useState(null);

  useEffect(() => {
    let mounted = true;
    fetchCommandCenterPulse().then((data) => {
      if (mounted) setPulse(data);
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
            <Radio className="h-4 w-4" />
          </span>
          <p className="text-sm font-semibold text-slate-900 dark:text-white">Live Health Command Center</p>
        </div>
        <span className="flex items-center gap-1.5 text-xs font-medium text-brand-600 dark:text-brand-400">
          <motion.span
            className="h-1.5 w-1.5 rounded-full bg-brand-500"
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.6, repeat: Infinity }}
          />
          Live
        </span>
      </div>

      {!pulse ? (
        <Skeleton className="mt-4 h-24 w-full" />
      ) : (
        <div className="mt-4 grid grid-cols-2 gap-3">
          {ITEMS.map((item) => (
            <div key={item.key} className="rounded-xl bg-slate-50 p-3 text-center dark:bg-white/5">
              <p className="font-display text-xl font-semibold text-slate-900 dark:text-white">{pulse[item.key]}</p>
              <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">{item.label}</p>
            </div>
          ))}
        </div>
      )}
      <p className="mt-3 text-[11px] text-slate-400">
        Last updated {pulse ? new Date(pulse.lastUpdated).toLocaleTimeString() : '—'}
      </p>
    </div>
  );
}
