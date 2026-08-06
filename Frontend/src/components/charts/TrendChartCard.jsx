import { AreaChart, Area, LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Skeleton } from '../common/Skeleton';

import React from 'react';

const gridProps = { strokeDasharray: '3 3', className: 'stroke-slate-100 dark:stroke-white/5' };
const axisProps = { tick: { fontSize: 11 }, axisLine: false, tickLine: false };
const tooltipStyle = { contentStyle: { borderRadius: 10, border: 'none', fontSize: 12 } };

/**
 * Generic time-series chart card (area or line) reused across
 * dashboards instead of every page redefining gradients/margins/axis
 * styling by hand.
 *
 * data: [{ [xKey]: string, [yKey]: number }]
 */
export default function TrendChartCard({
  title,
  subtitle,
  data,
  xKey,
  yKey,
  color = '#1aab6f',
  variant = 'area',
  height = 220,
  showGrid = true,
}) {
  const gradientId = `trend-${xKey}-${yKey}`.replace(/[^a-zA-Z0-9-]/g, '');

  return (
    <div className="surface-card p-6">
      {title && <p className="text-sm font-semibold text-slate-900 dark:text-white">{title}</p>}
      {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
      <div className="mt-4" style={{ height }}>
        {!data ? (
          <Skeleton className="h-full w-full" />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            {variant === 'line' ? (
              <LineChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                {showGrid && <CartesianGrid {...gridProps} />}
                <XAxis dataKey={xKey} {...axisProps} />
                <YAxis {...axisProps} />
                <Tooltip {...tooltipStyle} />
                <Line type="monotone" dataKey={yKey} stroke={color} strokeWidth={2.5} dot={{ r: 3 }} />
              </LineChart>
            ) : (
              <AreaChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                <defs>
                  <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity={0.4} />
                    <stop offset="100%" stopColor={color} stopOpacity={0} />
                  </linearGradient>
                </defs>
                {showGrid && <CartesianGrid {...gridProps} />}
                <XAxis dataKey={xKey} {...axisProps} />
                <YAxis {...axisProps} />
                <Tooltip {...tooltipStyle} />
                <Area type="monotone" dataKey={yKey} stroke={color} strokeWidth={2.5} fill={`url(#${gradientId})`} />
              </AreaChart>
            )}
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
