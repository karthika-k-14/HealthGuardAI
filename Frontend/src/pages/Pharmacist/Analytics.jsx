import React, { useEffect, useState } from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, CartesianGrid, ReferenceLine
} from 'recharts';
import {
  Activity,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Package,
  Boxes,
  RefreshCw,
  Layers,
  Sparkles,
  Info,
  ShieldAlert,
  Calendar
} from 'lucide-react';
import { fetchSalesAnalytics } from '../../api/pharmacyApi';
import { Spinner } from '../../components/common/Loader';
import Badge from '../../components/common/Badge';

const CATEGORY_COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4', '#64748b', '#f97316'];

const CustomDemandTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const item = payload[0]?.payload;
    return (
      <div className="rounded-xl border border-slate-200/80 bg-white/95 p-3 text-xs shadow-xl backdrop-blur-md dark:border-white/10 dark:bg-slate-900/95">
        <p className="font-bold text-slate-900 dark:text-white">{label || item?.name}</p>
        <div className="mt-2 space-y-1">
          <p className="text-emerald-600 dark:text-emerald-400">
            <span className="font-medium">Predicted 30-Day Demand: </span>
            <span className="font-bold">{item?.predictedDemand?.toLocaleString()} units</span>
          </p>
          <p className="text-slate-600 dark:text-slate-300">
            <span className="font-medium">Avg Daily Consumption: </span>
            <span className="font-bold">{item?.avgDailyConsumption} units/day</span>
          </p>
          <p className="text-slate-600 dark:text-slate-300">
            <span className="font-medium">Current Stock: </span>
            <span className="font-bold">{item?.currentStock?.toLocaleString()} units</span>
          </p>
          <p className="text-slate-500 dark:text-slate-400">
            <span className="font-medium">Historical Dispensed: </span>
            <span className="font-bold">{item?.totalDispensed?.toLocaleString()} units</span>
          </p>
        </div>
      </div>
    );
  }
  return null;
};

const CustomRiskTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const item = payload[0]?.payload;
    return (
      <div className="rounded-xl border border-rose-200/80 bg-white/95 p-3 text-xs shadow-xl backdrop-blur-md dark:border-rose-900/40 dark:bg-slate-900/95">
        <div className="flex items-center justify-between gap-2">
          <p className="font-bold text-slate-900 dark:text-white">{label || item?.name}</p>
          <span className="rounded-md bg-rose-500/10 px-1.5 py-0.5 font-bold text-rose-600 dark:text-rose-400">
            {item?.riskPercentage}% Risk
          </span>
        </div>
        <div className="mt-2 space-y-1">
          <p className="text-rose-600 dark:text-rose-400">
            <span className="font-medium">Projected Deficit: </span>
            <span className="font-bold">{item?.deficit?.toLocaleString()} units</span>
          </p>
          <p className="text-slate-600 dark:text-slate-300">
            <span className="font-medium">Current Stock: </span>
            <span className="font-bold">{item?.currentStock?.toLocaleString()} units</span>
          </p>
          <p className="text-slate-600 dark:text-slate-300">
            <span className="font-medium">Predicted 30-Day Demand: </span>
            <span className="font-bold">{item?.predictedDemand?.toLocaleString()} units</span>
          </p>
        </div>
      </div>
    );
  }
  return null;
};

const CustomLineTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl border border-slate-200/80 bg-white/95 p-3 text-xs shadow-xl backdrop-blur-md dark:border-white/10 dark:bg-slate-900/95">
        <p className="font-bold text-slate-900 dark:text-white">{label}</p>
        <p className="mt-1 font-semibold text-blue-600 dark:text-blue-400">
          Total Dispensed: <span className="font-bold">{payload[0]?.value?.toLocaleString()} units</span>
        </p>
      </div>
    );
  }
  return null;
};

export default function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const res = await fetchSalesAnalytics();
      setData(res);
    } catch (e) {
      setData({ insufficientData: true });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner size={32} />
      </div>
    );
  }

  const isInsufficient = Boolean(
    !data ||
    data.insufficientData ||
    (!data.predictedDemand?.length && !data.monthlyDispensing?.length)
  );

  if (isInsufficient) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
            Pharmacy Demand & Inventory Analytics
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            AI-assisted medicine demand forecasting and stockout risk tracking.
          </p>
        </div>
        <div className="surface-card flex flex-col items-center justify-center gap-3 p-12 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <Info className="h-7 w-7" />
          </div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Insufficient historical data for prediction.
          </h2>
          <p className="max-w-md text-sm text-slate-500 dark:text-slate-400">
            The demand prediction algorithm requires real historical medicine dispensing transaction records to compute consumption trends.
          </p>
          <button
            onClick={loadAnalytics}
            className="btn-secondary mt-2 inline-flex items-center gap-2 text-xs"
          >
            <RefreshCw className="h-4 w-4" />
            Retry Check
          </button>
        </div>
      </div>
    );
  }

  const kpi = data?.kpi || {};
  const predictedDemand = Array.isArray(data?.predictedDemand) ? data.predictedDemand : [];
  const stockoutRisks = Array.isArray(data?.stockoutRisks) ? data.stockoutRisks : [];
  const monthlyDispensing = Array.isArray(data?.monthlyDispensing) ? data.monthlyDispensing : [];
  const categoryDistribution = Array.isArray(data?.categoryDistribution) ? data.categoryDistribution : [];

  return (
    <div className="space-y-6 pb-8">
      {/* Header & Status Indicator */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
              Pharmacy Demand & Inventory Analytics
            </h1>
            <Badge tone="brand" className="hidden sm:inline-flex gap-1 items-center">
              <Sparkles className="h-3 w-3" />
              AI Demand Engine
            </Badge>
          </div>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Deterministic consumption forecasting and stockout risk prevention powered strictly by real dispensing history.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadAnalytics}
            className="btn-secondary inline-flex items-center gap-2 text-xs"
            title="Refresh analytics from database"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </button>
        </div>
      </div>

      {/* 5 Analytics KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {/* KPI 1: Most Requested Medicine */}
        <div className="surface-card flex flex-col justify-between p-4.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Most Requested
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <Activity className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="truncate font-display text-lg font-bold text-slate-900 dark:text-white" title={kpi.mostRequestedMedicine || 'N/A'}>
              {kpi.mostRequestedMedicine || 'N/A'}
            </h3>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-purple-600 dark:text-purple-400">
                {kpi.mostRequestedCount?.toLocaleString() || 0}
              </span>{' '}
              dispense requests
            </p>
          </div>
        </div>

        {/* KPI 2: Fastest Moving Medicine */}
        <div className="surface-card flex flex-col justify-between p-4.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Fastest Moving
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="truncate font-display text-lg font-bold text-slate-900 dark:text-white" title={kpi.fastestMovingMedicine || 'N/A'}>
              {kpi.fastestMovingMedicine || 'N/A'}
            </h3>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                {kpi.fastestMovingRate || 0}
              </span>{' '}
              units / day
            </p>
          </div>
        </div>

        {/* KPI 3: Slowest Moving Medicine */}
        <div className="surface-card flex flex-col justify-between p-4.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Slowest Moving
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <TrendingDown className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="truncate font-display text-lg font-bold text-slate-900 dark:text-white" title={kpi.slowestMovingMedicine || 'N/A'}>
              {kpi.slowestMovingMedicine || 'N/A'}
            </h3>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-amber-600 dark:text-amber-400">
                {kpi.slowestMovingRate || 0}
              </span>{' '}
              units / day
            </p>
          </div>
        </div>

        {/* KPI 4: Estimated Stockout Risk Count */}
        <div className="surface-card flex flex-col justify-between p-4.5 border-rose-200/70 dark:border-rose-900/30">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Stockout Risk Count
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
              <ShieldAlert className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="font-display text-2xl font-bold text-rose-600 dark:text-rose-400">
              {kpi.stockoutRiskCount || 0}
            </h3>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              Stock &lt; 30-day demand
            </p>
          </div>
        </div>

        {/* KPI 5: Total Medicines Dispensed This Month */}
        <div className="surface-card flex flex-col justify-between p-4.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Dispensed This Month
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Boxes className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="font-display text-2xl font-bold text-blue-600 dark:text-blue-400">
              {kpi.dispensedThisMonth?.toLocaleString() || 0}
            </h3>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              Total units issued
            </p>
          </div>
        </div>
      </div>

      {/* Main Charts Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* CHART 1: Predicted Medicine Demand (Next 30 Days) */}
        <div className="surface-card flex flex-col justify-between p-5">
          <div>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                  Predicted Medicine Demand (Next 30 Days)
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Top 10 medicines with highest expected 30-day demand based on historical daily consumption rate.
                </p>
              </div>
              <Badge tone="brand" className="text-[11px]">Top 10</Badge>
            </div>

            <div className="mt-4 h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={predictedDemand}
                  margin={{ top: 12, right: 12, left: -10, bottom: 25 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 10 }}
                    angle={-25}
                    textAnchor="end"
                    interval={0}
                    height={45}
                  />
                  <YAxis
                    tick={{ fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}
                  />
                  <Tooltip content={<CustomDemandTooltip />} />
                  <Bar
                    dataKey="predictedDemand"
                    name="Predicted Demand"
                    fill="#10b981"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-2 rounded-xl bg-slate-50/80 p-3 text-xs text-slate-600 dark:bg-white/[0.03] dark:text-slate-400">
            <span className="font-semibold text-slate-700 dark:text-slate-200">Prediction Formula: </span>
            Avg Daily Consumption = Total Dispensed / Active Days; Predicted 30-Day Demand = Avg Daily Consumption × 30.
          </div>
        </div>

        {/* CHART 2: Stockout Risk Chart */}
        <div className="surface-card flex flex-col justify-between p-5">
          <div>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                  Stockout Risk Assessment (30-Day Horizon)
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Medicines whose current inventory is lower than predicted 30-day demand.
                </p>
              </div>
              <Badge tone="rose" className="text-[11px]">
                {stockoutRisks.length} At Risk
              </Badge>
            </div>

            <div className="mt-4 h-72">
              {stockoutRisks.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center text-sm text-slate-500">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 mb-2">
                    ✓
                  </div>
                  No stockout risks detected. All inventory exceeds predicted 30-day demand.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={stockoutRisks.slice(0, 10)}
                    layout="vertical"
                    margin={{ top: 10, right: 20, left: 15, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.15} />
                    <XAxis
                      type="number"
                      domain={[0, 100]}
                      unit="%"
                      tick={{ fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      tick={{ fontSize: 10 }}
                      width={110}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip content={<CustomRiskTooltip />} />
                    <Bar
                      dataKey="riskPercentage"
                      name="Risk %"
                      fill="#f43f5e"
                      radius={[0, 6, 6, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="mt-2 rounded-xl bg-rose-50/80 p-3 text-xs text-rose-700 dark:bg-rose-950/20 dark:text-rose-300">
            <span className="font-semibold">Risk Formula: </span>
            (Predicted Demand − Current Stock) / Predicted Demand × 100%. Higher percentage signifies imminent depletion.
          </div>
        </div>
      </div>

      {/* Secondary Charts: Monthly Dispensing Trend & Inventory Therapeutic Breakdown */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* CHART 3: Monthly Dispensing Trend (Last 12 Months) */}
        <div className="surface-card p-5 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                Monthly Dispensing Trend
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Historical dispensing volume across past months showing aggregate utilization.
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
              <Calendar className="h-3.5 w-3.5 text-blue-500" />
              <span>Real Issue History</span>
            </div>
          </div>

          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={monthlyDispensing}
                margin={{ top: 10, right: 16, left: -10, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis
                  tick={{ fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v}
                />
                <Tooltip content={<CustomLineTooltip />} />
                <Line
                  type="monotone"
                  dataKey="dispensed"
                  name="Medicines Dispensed"
                  stroke="#3b82f6"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Therapeutic Category Distribution */}
        <div className="surface-card flex flex-col justify-between p-5">
          <div>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                  Therapeutic Categories
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Inventory assortment by clinical category.
                </p>
              </div>
              <Layers className="h-4 w-4 text-slate-400" />
            </div>

            <div className="mt-3 h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryDistribution}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={48}
                    outerRadius={75}
                    paddingAngle={3}
                  >
                    {categoryDistribution.map((entry, i) => (
                      <Cell key={entry.name || i} fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val, name) => [`${val} Medicines`, name]}
                    contentStyle={{ borderRadius: 10, border: 'none', fontSize: 12 }}
                  />
                  <Legend wrapperStyle={{ fontSize: 11, paddingTop: 4 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-2 text-center text-xs text-slate-400 dark:text-slate-500">
            Total {categoryDistribution.reduce((acc, curr) => acc + (curr.value || 0), 0)} tracked pharmaceutical formulations
          </div>
        </div>
      </div>

      {/* Priority Stockout Risk Remediation Table */}
      {stockoutRisks.length > 0 && (
        <div className="surface-card p-5">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                Stockout Prevention & Replenishment Planning
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Actionable medicine procurement priorities based on 30-day expected consumption deficit.
              </p>
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Formula: <code className="rounded bg-slate-100 px-1.5 py-0.5 dark:bg-white/5">Deficit = Predicted 30-Day Demand − Current Stock</code>
            </div>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200/80 text-slate-500 dark:border-white/10 dark:text-slate-400">
                  <th className="pb-2.5 font-semibold">Medicine</th>
                  <th className="pb-2.5 font-semibold text-right">Current Stock</th>
                  <th className="pb-2.5 font-semibold text-right">Predicted 30-Day Demand</th>
                  <th className="pb-2.5 font-semibold text-right">Deficit Needed</th>
                  <th className="pb-2.5 font-semibold text-right">Risk Score</th>
                  <th className="pb-2.5 font-semibold text-center">Procurement Priority</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/[0.05]">
                {stockoutRisks.map((item, idx) => {
                  const isHighRisk = item.riskPercentage >= 95 || item.currentStock === 0;
                  return (
                    <tr key={item.name || idx} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02]">
                      <td className="py-2.5 font-medium text-slate-900 dark:text-white">
                        {item.name}
                      </td>
                      <td className="py-2.5 text-right font-semibold text-slate-700 dark:text-slate-300">
                        {item.currentStock?.toLocaleString()} units
                      </td>
                      <td className="py-2.5 text-right font-semibold text-slate-700 dark:text-slate-300">
                        {item.predictedDemand?.toLocaleString()} units
                      </td>
                      <td className="py-2.5 text-right font-bold text-rose-600 dark:text-rose-400">
                        +{item.deficit?.toLocaleString()} units
                      </td>
                      <td className="py-2.5 text-right font-semibold text-slate-800 dark:text-slate-200">
                        {item.riskPercentage}%
                      </td>
                      <td className="py-2.5 text-center">
                        <Badge tone={isHighRisk ? 'critical' : 'amber'}>
                          {isHighRisk ? 'Immediate Order' : 'Monitor Stock'}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
