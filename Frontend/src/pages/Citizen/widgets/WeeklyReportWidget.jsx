import React, { useEffect, useState } from 'react';
import { ClipboardCheck, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { fetchWeeklyReport } from '../../../api/citizenApi';
import { Skeleton } from '../../../components/common/Skeleton';

const TREND_ICON = { up: TrendingUp, down: TrendingDown, flat: Minus };
const TREND_COLOR = { up: 'text-brand-600 dark:text-brand-400', down: 'text-signal-rose', flat: 'text-slate-400' };

export default function WeeklyReportWidget() {
  const { t } = useTranslation();
  const [report, setReport] = useState(null);

  useEffect(() => {
    fetchWeeklyReport().then(setReport);
  }, []);

  if (!report) {
    return (
      <div className="surface-card space-y-3 p-6">
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-4/5" />
      </div>
    );
  }

  return (
    <div className="surface-card p-6">
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-300">
          <ClipboardCheck className="h-4 w-4" />
        </span>
        <p className="text-sm font-semibold text-slate-900 dark:text-white">{t('Weekly Health Report')}</p>
      </div>
      <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">{t(report.summary)}</p>

      <div className="mt-4 grid grid-cols-3 gap-2">
        {report.highlights.map((h) => {
          const TrendIcon = TREND_ICON[h.trend] || Minus;
          return (
            <div key={h.label} className="rounded-lg bg-slate-50 p-3 text-center dark:bg-white/5">
              <p className="text-sm font-semibold text-slate-900 dark:text-white">{h.value}</p>
              <p className="mt-0.5 text-[10px] text-slate-400">{t(h.label)}</p>
              <TrendIcon className={`mx-auto mt-1 h-3 w-3 ${TREND_COLOR[h.trend]}`} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
