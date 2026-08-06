import React, { useEffect, useState } from 'react';
import { Siren, Ambulance, CloudRain, Bug } from 'lucide-react';
import { fetchEmergencyResponseTimeline } from '../../../api/officerApi';
import { Skeleton } from '../../../components/common/Skeleton';

const TYPE_ICON = { outbreak: Bug, ambulance: Ambulance, disaster: CloudRain };
const TYPE_TONE = { outbreak: 'text-signal-rose bg-signal-rose/10', ambulance: 'text-sky-600 dark:text-sky-400 bg-sky-500/10', disaster: 'text-signal-amber bg-signal-amber/10' };

export default function EmergencyResponseTimelineWidget() {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    fetchEmergencyResponseTimeline().then((data) => {
      if (mounted) {
        setEvents(data);
        setIsLoading(false);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="surface-card p-6">
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-signal-rose/10 text-signal-rose">
          <Siren className="h-4 w-4" />
        </span>
        <p className="text-sm font-semibold text-slate-900 dark:text-white">Emergency Response Timeline</p>
      </div>

      <ol className="mt-4 space-y-3 border-l border-slate-200/70 pl-4 dark:border-white/10">
        {isLoading && Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-8 w-full" />)}
        {!isLoading &&
          events.map((e) => {
            const Icon = TYPE_ICON[e.type];
            return (
              <li key={e.id} className="relative">
                <span className={`absolute -left-[25px] flex h-4 w-4 items-center justify-center rounded-full ${TYPE_TONE[e.type]}`}>
                  <Icon className="h-2.5 w-2.5" />
                </span>
                <p className="text-sm text-slate-700 dark:text-slate-200">{e.label}</p>
                <p className="text-xs text-slate-400">{new Date(e.time).toLocaleString()}</p>
              </li>
            );
          })}
      </ol>
    </div>
  );
}
