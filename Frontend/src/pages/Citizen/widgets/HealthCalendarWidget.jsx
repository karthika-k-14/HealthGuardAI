import React, { useEffect, useState } from 'react';
import { CalendarDays, Syringe, Stethoscope, Megaphone, ClipboardCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { fetchHealthCalendar } from '../../../api/citizenApi';
import { Skeleton } from '../../../components/common/Skeleton';

const TYPE_ICON = { appointment: ClipboardCheck, vaccination: Syringe, checkup: Stethoscope, campaign: Megaphone };
const TYPE_TONE = {
  appointment: 'text-sky-600 dark:text-sky-400 bg-sky-500/10',
  vaccination: 'text-brand-600 dark:text-brand-400 bg-brand-500/10',
  checkup: 'text-purple-600 dark:text-purple-300 bg-purple-500/10',
  campaign: 'text-amber-600 dark:text-amber-300 bg-signal-amber/10',
};

export default function HealthCalendarWidget() {
  const { t, i18n } = useTranslation();
  const [events, setEvents] = useState(null);

  useEffect(() => {
    let mounted = true;
    fetchHealthCalendar().then((data) => {
      if (mounted) setEvents(data);
    });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="surface-card p-6">
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400">
          <CalendarDays className="h-4 w-4" />
        </span>
        <p className="text-sm font-semibold text-slate-900 dark:text-white">{t('Health Calendar')}</p>
      </div>

      <div className="mt-4 space-y-2.5">
        {!events && Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-11 w-full" />)}
        {events && events.length === 0 && <p className="text-sm text-slate-400">{t('No upcoming events.')}</p>}
        {events &&
          events.map((e, i) => {
            const Icon = TYPE_ICON[e.type] || ClipboardCheck;
            return (
              <div key={i} className="flex items-center gap-3 rounded-xl border border-slate-200/70 px-3 py-2.5 dark:border-white/10">
                <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${TYPE_TONE[e.type] || TYPE_TONE.appointment}`}>
                  <Icon className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-slate-700 dark:text-slate-200">{e.label}</p>
                  <p className="text-xs text-slate-400">{new Date(e.date).toLocaleDateString(i18n.language, { month: 'short', day: 'numeric' })}</p>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}
