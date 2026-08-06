import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ResponsiveContainer, AreaChart, Area, XAxis, Tooltip } from 'recharts';
import { ArrowRight, LineChart } from 'lucide-react';
import { fetchHealthAnalytics } from '../../../api/analyticsApi';
import { Skeleton } from '../../../components/common/Skeleton';
import { PATHS } from '../../../constants/routes';

export default function AnalyticsPreviewWidget() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchHealthAnalytics().then(setData);
  }, []);

  return (
    <div className="surface-card p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400">
            <LineChart className="h-4 w-4" />
          </span>
          <p className="text-sm font-semibold text-slate-900 dark:text-white">Health Analytics</p>
        </div>
        <Link
          to={PATHS.CITIZEN_ANALYTICS}
          className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400"
        >
          View all <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      <p className="mt-3 text-xs text-slate-400">Steps, this week</p>
      <div className="mt-2 h-32">
        {!data ? (
          <Skeleton className="h-full w-full" />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.steps} margin={{ top: 6, right: 4, left: -24, bottom: 0 }}>
              <defs>
                <linearGradient id="stepsPreviewGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#1aab6f" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#1aab6f" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 10, border: 'none', fontSize: 11 }} />
              <Area type="monotone" dataKey="count" stroke="#1aab6f" strokeWidth={2} fill="url(#stepsPreviewGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
