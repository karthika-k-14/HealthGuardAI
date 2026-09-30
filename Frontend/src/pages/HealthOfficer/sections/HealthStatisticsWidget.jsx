import React, { useEffect, useState } from 'react';
import { AreaChart, Area, ResponsiveContainer, XAxis, Tooltip } from 'recharts';
import { Activity } from 'lucide-react';
import { fetchOfficerSurveillanceReports } from '../../../api/surveillanceApi';
import { Skeleton } from '../../../components/common/Skeleton';

export default function HealthStatisticsWidget() {
  const [chartData, setChartData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    fetchOfficerSurveillanceReports()
      .then((reports) => {
        if (!mounted) return;
        const list = Array.isArray(reports) ? reports : [];
        if (list.length === 0) {
          setChartData([]);
          return;
        }

        const dateCounts = {};
        list.forEach((r) => {
          const dateStr = r.reportDate || (r.createdAt ? r.createdAt.substring(0, 10) : 'Recent');
          dateCounts[dateStr] = (dateCounts[dateStr] || 0) + 1;
        });

        const combined = Object.entries(dateCounts)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([week, cases]) => ({ week, cases }));

        setChartData(combined);
      })
      .catch(() => {
        if (mounted) setChartData([]);
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="surface-card p-6">
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400">
          <Activity className="h-4 w-4" />
        </span>
        <p className="text-sm font-semibold text-slate-900 dark:text-white">Health Statistics — District Case Trend</p>
      </div>

      <div className="mt-4 h-56">
        {isLoading ? (
          <Skeleton className="h-full w-full" />
        ) : chartData.length === 0 ? (
          <div className="flex h-full items-center justify-center text-xs text-slate-400">
            No surveillance trend data recorded yet.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 5, right: 8, left: -12, bottom: 0 }}>
              <defs>
                <linearGradient id="officerCaseGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#1aab6f" stopOpacity={0.45} />
                  <stop offset="100%" stopColor="#1aab6f" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="week" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 10, border: 'none', fontSize: 12 }} />
              <Area type="monotone" dataKey="cases" stroke="#1aab6f" strokeWidth={2.5} fill="url(#officerCaseGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
