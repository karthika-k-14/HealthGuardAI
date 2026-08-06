import React, { useEffect, useState } from 'react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  ResponsiveContainer, XAxis, YAxis, Tooltip, Legend,
} from 'recharts';
import { fetchSalesAnalytics } from '../../api/pharmacyApi';
import { getMedicineStatistics } from '../../api/analyticsApi';
import { Spinner } from '../../components/common/Loader';

const COLORS = ['#1aab6f', '#3b9df5', '#f5a524', '#f43f5e', '#a855f7', '#94a3b8'];

export default function Analytics() {
  const [data, setData] = useState(null);

  useEffect(() => {
    let mounted = true;
    async function loadAnalytics() {
      const sales = await fetchSalesAnalytics().catch(() => ({}));
      try {
        const medStats = await getMedicineStatistics();
        if (mounted && medStats && medStats.categoryBreakdown) {
          const categoryDist = Object.entries(medStats.categoryBreakdown).map(([name, value]) => ({ name, value }));
          setData({
            ...sales,
            categoryDistribution: categoryDist.length > 0 ? categoryDist : sales.categoryDistribution,
            medicineStats: medStats,
          });
          return;
        }
      } catch (e) {
        // fallback
      }
      if (mounted) setData(sales);
    }
    loadAnalytics();
    return () => {
      mounted = false;
    };
  }, []);

  if (!data) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner size={28} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-slate-900 dark:text-white">Analytics</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Sales, usage, and stock trends for your pharmacy.</p>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="surface-card p-5">
          <p className="text-sm font-semibold text-slate-900 dark:text-white">Monthly Sales</p>
          <div className="mt-3 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.monthlySales} margin={{ top: 5, right: 8, left: -12, bottom: 0 }}>
                <defs>
                  <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#1aab6f" stopOpacity={0.45} />
                    <stop offset="100%" stopColor="#1aab6f" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 10, border: 'none', fontSize: 12 }} />
                <Area type="monotone" dataKey="sales" stroke="#1aab6f" strokeWidth={2.5} fill="url(#salesGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="surface-card p-5">
          <p className="text-sm font-semibold text-slate-900 dark:text-white">Inventory Usage (weekly)</p>
          <div className="mt-3 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.inventoryUsage} margin={{ top: 5, right: 8, left: -12, bottom: 0 }}>
                <XAxis dataKey="week" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 10, border: 'none', fontSize: 12 }} />
                <Bar dataKey="used" fill="#3b9df5" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="surface-card p-5">
          <p className="text-sm font-semibold text-slate-900 dark:text-white">Top Medicines</p>
          <div className="mt-3 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.topMedicines} layout="vertical" margin={{ top: 5, right: 16, left: 8, bottom: 0 }}>
                <XAxis type="number" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={120} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 10, border: 'none', fontSize: 12 }} />
                <Bar dataKey="unitsSold" fill="#1aab6f" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="surface-card p-5">
          <p className="text-sm font-semibold text-slate-900 dark:text-white">Category Distribution</p>
          <div className="mt-3 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data.categoryDistribution} dataKey="value" nameKey="name" innerRadius={45} outerRadius={75} paddingAngle={2}>
                  {data.categoryDistribution.map((entry, i) => (
                    <Cell key={entry.name} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 10, border: 'none', fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="surface-card p-5 lg:col-span-2">
          <p className="text-sm font-semibold text-slate-900 dark:text-white">Stock Level Trend</p>
          <div className="mt-3 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.stockTrends} margin={{ top: 5, right: 8, left: -12, bottom: 0 }}>
                <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 10, border: 'none', fontSize: 12 }} />
                <Line type="monotone" dataKey="stockLevel" stroke="#a855f7" strokeWidth={2.5} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
