import React, { useEffect, useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import toast from 'react-hot-toast';
import { LineChart as LineChartIcon, Download, Sparkles, Droplets, Moon, Footprints } from 'lucide-react';
import { fetchHealthAnalytics, fetchHealthReport } from '../../api/analyticsApi';
import { Skeleton } from '../../components/common/Skeleton';
import ProgressRing from '../../components/common/ProgressRing';
import Button from '../../components/common/Button';
import StatCard from '../../components/cards/StatCard';

function ChartCard({ title, subtitle, children }) {
  return (
    <div className="surface-card p-6">
      <p className="text-sm font-semibold text-slate-900 dark:text-white">{title}</p>
      <p className="text-xs text-slate-400">{subtitle}</p>
      <div className="mt-4 h-56">{children}</div>
    </div>
  );
}

const gridProps = { strokeDasharray: '3 3', className: 'stroke-slate-100 dark:stroke-white/5' };
const axisProps = { tick: { fontSize: 11 }, axisLine: false, tickLine: false };
const tooltipStyle = { contentStyle: { borderRadius: 10, border: 'none', fontSize: 12 } };

export default function HealthAnalyticsPage() {
  const [data, setData] = useState(null);
  const [report, setReport] = useState(null);

  useEffect(() => {
    fetchHealthAnalytics().then(setData);
    fetchHealthReport().then(setReport);
  }, []);

  const handleDownload = () => {
    toast.success('Downloading health report PDF (demo — no file generated)');
  };

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <span className="section-eyebrow">
            <LineChartIcon className="h-3.5 w-3.5" /> AI Health Report
          </span>
          <h1 className="mt-2 font-display text-2xl font-semibold text-slate-900 dark:text-white">
            Your health trends
          </h1>
        </div>
        <Button variant="secondary" onClick={handleDownload} className="text-sm">
          <Download className="h-4 w-4" /> Download Report
        </Button>
      </div>

      {!report ? (
        <Skeleton className="mt-6 h-48 w-full" />
      ) : (
        <div className="mt-6 grid gap-5 lg:grid-cols-[auto_1fr]">
          <div className="surface-card flex flex-col items-center justify-center p-6 text-center">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Health Score</p>
            <ProgressRing value={report.healthScore} size={120} tone={report.healthScore >= 75 ? 'brand' : 'amber'} className="mt-3">
              <span className="font-display text-2xl font-semibold text-slate-900 dark:text-white">{report.healthScore}</span>
            </ProgressRing>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <StatCard label="BMI" value={report.bmi} tone="text-brand-600 dark:text-brand-400 bg-brand-500/10" />
              <StatCard icon={Droplets} label="Avg. Water" value={report.avgWaterLiters} suffix="L" tone="text-sky-600 dark:text-sky-400 bg-sky-500/10" />
              <StatCard icon={Moon} label="Avg. Sleep" value={report.avgSleepHours} suffix="h" tone="text-purple-600 dark:text-purple-300 bg-purple-500/10" />
              <StatCard icon={Footprints} label="Avg. Activity" value={report.avgSteps} suffix=" steps" tone="text-emerald-600 dark:text-emerald-300 bg-emerald-500/10" className="col-span-2 sm:col-span-1" />
            </div>

            <div className="surface-card p-5">
              <p className="flex items-center gap-1.5 text-sm font-semibold text-slate-900 dark:text-white">
                <Sparkles className="h-4 w-4 text-brand-500" /> AI Suggestions
              </p>
              <ul className="mt-3 space-y-1.5">
                {report.aiSuggestions.map((s) => (
                  <li key={s} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {!data ? (
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-64 w-full" />
          ))}
        </div>
      ) : (
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <ChartCard title="BMI Trend" subtitle="Last 6 months">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.bmi} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                <CartesianGrid {...gridProps} />
                <XAxis dataKey="month" {...axisProps} />
                <YAxis {...axisProps} domain={['dataMin - 1', 'dataMax + 1']} />
                <Tooltip {...tooltipStyle} />
                <Line type="monotone" dataKey="value" stroke="#1aab6f" strokeWidth={2.5} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Water Intake" subtitle="This week, in liters">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.water} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                <defs>
                  <linearGradient id="waterGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b9df5" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#3b9df5" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid {...gridProps} />
                <XAxis dataKey="day" {...axisProps} />
                <YAxis {...axisProps} />
                <Tooltip {...tooltipStyle} />
                <Area type="monotone" dataKey="liters" stroke="#3b9df5" strokeWidth={2} fill="url(#waterGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Sleep" subtitle="Hours per night, this week">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.sleep} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                <CartesianGrid {...gridProps} />
                <XAxis dataKey="day" {...axisProps} />
                <YAxis {...axisProps} />
                <Tooltip {...tooltipStyle} />
                <Bar dataKey="hours" fill="#a78bfa" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Steps" subtitle="Daily count, this week">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.steps} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                <defs>
                  <linearGradient id="stepsFullGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#1aab6f" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#1aab6f" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid {...gridProps} />
                <XAxis dataKey="day" {...axisProps} />
                <YAxis {...axisProps} />
                <Tooltip {...tooltipStyle} />
                <Area type="monotone" dataKey="count" stroke="#1aab6f" strokeWidth={2} fill="url(#stepsFullGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Calories" subtitle="Daily intake (kcal), this week">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.calories} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                <CartesianGrid {...gridProps} />
                <XAxis dataKey="day" {...axisProps} />
                <YAxis {...axisProps} />
                <Tooltip {...tooltipStyle} />
                <Bar dataKey="kcal" fill="#f5a524" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      )}
    </div>
  );
}
