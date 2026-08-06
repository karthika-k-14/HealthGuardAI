import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Skeleton } from '../common/Skeleton';

import React from 'react';

const DEFAULT_COLORS = ['#1aab6f', '#3b9df5', '#f5a524', '#f43f5e', '#a855f7', '#94a3b8'];

/**
 * Generic donut/pie distribution chart card, reused wherever a page
 * needs a category breakdown (platform activity by role, category
 * distribution, etc.) instead of redefining Pie/Cell/Legend styling.
 *
 * data: [{ name: string, value: number }]
 */
export default function DistributionPieChart({ title, subtitle, data, colors = DEFAULT_COLORS, height = 220 }) {
  return (
    <div className="surface-card p-6">
      {title && <p className="text-sm font-semibold text-slate-900 dark:text-white">{title}</p>}
      {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
      <div className="mt-4" style={{ height }}>
        {!data ? (
          <Skeleton className="h-full w-full" />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} dataKey="value" nameKey="name" innerRadius={45} outerRadius={75} paddingAngle={2}>
                {data.map((entry, i) => (
                  <Cell key={entry.name} fill={colors[i % colors.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 10, border: 'none', fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
