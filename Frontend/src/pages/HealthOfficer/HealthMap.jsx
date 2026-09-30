// v2 — Outbreak Predictions & Health Map Dashboard — real PostgreSQL data only (2026-09-20)
import React, { useEffect, useState, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend
} from 'recharts';
import {
  MapPinned, AlertTriangle, ShieldCheck, TrendingUp, Activity, Users,
  RefreshCw, Clock, Flame, AlertOctagon
} from 'lucide-react';
import { forecastingApi } from '../../api/forecastingApi';
import toast from 'react-hot-toast';

// ─────────────────────────────────────────────────────────────────────────────
// Risk Level Config
// ─────────────────────────────────────────────────────────────────────────────
const RISK_CONFIG = {
  CRITICAL: {
    color:      '#ef4444',
    bg:         'bg-red-500/15',
    border:     'border-red-500/30',
    text:       'text-red-400',
    badgeBg:    'bg-red-500/20',
    dot:        '#ef4444',
    label:      'Critical',
    threshold:  50,
  },
  HIGH: {
    color:      '#f97316',
    bg:         'bg-orange-500/15',
    border:     'border-orange-500/30',
    text:       'text-orange-400',
    badgeBg:    'bg-orange-500/20',
    dot:        '#f97316',
    label:      'High',
    threshold:  31,
  },
  MEDIUM: {
    color:      '#eab308',
    bg:         'bg-yellow-500/15',
    border:     'border-yellow-500/30',
    text:       'text-yellow-400',
    badgeBg:    'bg-yellow-500/20',
    dot:        '#eab308',
    label:      'Medium',
    threshold:  16,
  },
  LOW: {
    color:      '#84cc16',
    bg:         'bg-lime-500/15',
    border:     'border-lime-500/30',
    text:       'text-lime-400',
    badgeBg:    'bg-lime-500/20',
    dot:        '#84cc16',
    label:      'Low',
    threshold:  6,
  },
  SAFE: {
    color:      '#10b981',
    bg:         'bg-emerald-500/15',
    border:     'border-emerald-500/30',
    text:       'text-emerald-400',
    badgeBg:    'bg-emerald-500/20',
    dot:        '#10b981',
    label:      'Safe',
    threshold:  0,
  },
};

const DISEASE_COLORS = [
  '#f43f5e', '#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#06b6d4', '#ec4899', '#a3e635'
];

// ─────────────────────────────────────────────────────────────────────────────
// Risk Badge
// ─────────────────────────────────────────────────────────────────────────────
const RiskBadge = ({ level }) => {
  const cfg = RISK_CONFIG[level] || RISK_CONFIG.SAFE;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold tracking-wide ${cfg.badgeBg} ${cfg.text} border ${cfg.border}`}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: cfg.color }} />
      {cfg.label}
    </span>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Risk Score Progress Bar
// ─────────────────────────────────────────────────────────────────────────────
const RiskScoreBar = ({ score, level }) => {
  const cfg = RISK_CONFIG[level] || RISK_CONFIG.SAFE;
  const pct = Math.min(100, (score / 60) * 100);
  return (
    <div className="relative h-2 w-full overflow-hidden rounded-full bg-slate-800">
      <div
        className="absolute inset-y-0 left-0 rounded-full transition-all duration-700"
        style={{ width: `${pct}%`, backgroundColor: cfg.color }}
      />
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Custom Tooltip for Bar Chart
// ─────────────────────────────────────────────────────────────────────────────
const BarTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        backgroundColor: '#0f172a',
        border: '1px solid #334155',
        borderRadius: '0.75rem',
        padding: '10px 14px',
        fontSize: '0.72rem',
        color: '#f8fafc',
        minWidth: 140
      }}
    >
      <p style={{ fontWeight: 700, marginBottom: 4, color: '#94a3b8' }}>{label}</p>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: payload[0]?.fill }} />
        <span>Risk Score: </span>
        <span style={{ fontWeight: 700 }}>{payload[0]?.value}</span>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Custom Tooltip for Pie Chart
// ─────────────────────────────────────────────────────────────────────────────
const PieTooltipCustom = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        backgroundColor: '#0f172a',
        border: '1px solid #334155',
        borderRadius: '0.75rem',
        padding: '10px 14px',
        fontSize: '0.72rem',
        color: '#f8fafc',
        minWidth: 130
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: payload[0]?.fill }} />
        <span style={{ color: '#cbd5e1' }}>{payload[0]?.name}:</span>
        <span style={{ fontWeight: 700 }}>{payload[0]?.value}</span>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Bubble Chart — Village Risk Bubble Visualization
// ─────────────────────────────────────────────────────────────────────────────
const BubbleCanvas = ({ villages }) => {
  if (!villages?.length) return null;

  const MAX_BUBBLE = 80;
  const MIN_BUBBLE = 28;
  const maxScore = Math.max(...villages.map(v => v.riskScore), 1);

  // Lay villages in a responsive grid
  return (
    <div className="flex flex-wrap items-end justify-center gap-4 py-4">
      {villages.map((v, idx) => {
        const cfg = RISK_CONFIG[v.riskLevel] || RISK_CONFIG.SAFE;
        const size = MIN_BUBBLE + ((v.riskScore / maxScore) * (MAX_BUBBLE - MIN_BUBBLE));
        const shortName = v.village.length > 14 ? v.village.slice(0, 12) + '…' : v.village;

        return (
          <div key={v.village} className="flex flex-col items-center gap-1.5">
            <div className="relative flex items-center justify-center">
              {/* Outer pulse ring for HIGH/CRITICAL */}
              {(v.riskLevel === 'CRITICAL' || v.riskLevel === 'HIGH') && (
                <span
                  className="absolute animate-ping rounded-full opacity-30"
                  style={{
                    width: size + 20,
                    height: size + 20,
                    backgroundColor: cfg.color
                  }}
                />
              )}
              <div
                className="relative flex items-center justify-center rounded-full border-2 transition-transform duration-300 hover:scale-105 cursor-default"
                style={{
                  width: size,
                  height: size,
                  backgroundColor: cfg.color + '28',
                  borderColor: cfg.color,
                }}
                title={`${v.village} — Risk: ${v.riskLevel} (Score: ${v.riskScore})\nTotal Cases: ${v.totalCases} | Escalated: ${v.escalatedReferrals}`}
              >
                <span className="text-[11px] font-bold" style={{ color: cfg.color }}>
                  {v.riskScore}
                </span>
              </div>
            </div>
            <p className="text-center text-[10px] font-semibold text-slate-300 max-w-[80px] leading-tight">{shortName}</p>
            <RiskBadge level={v.riskLevel} />
          </div>
        );
      })}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Summary Card
// ─────────────────────────────────────────────────────────────────────────────
const SummaryCard = ({ icon: Icon, label, value, iconColor, valueColor }) => (
  <div className="surface-card rounded-2xl border border-slate-800/80 bg-slate-900/60 p-5">
    <div className="flex items-center justify-between">
      <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</span>
      <Icon className={`h-5 w-5 ${iconColor}`} />
    </div>
    <p className={`mt-3 text-3xl font-bold ${valueColor}`}>{value}</p>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────
export default function HealthMap() {
  const [data, setData]         = useState(null);
  const [loading, setLoading]   = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await forecastingApi.getOfficerHealthMap();
      console.log('[HealthMap] API response:', res);
      setData(res);
      if (isManual) toast.success('Health map data refreshed');
    } catch (err) {
      console.error('[HealthMap] Failed to load health map data:', err);
      toast.error('Failed to fetch outbreak intelligence data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  // ── Derived data ──────────────────────────────────────────────────────────
  const villages = useMemo(() => data?.villages || [], [data]);
  const summary  = useMemo(() => data?.summary || {}, [data]);

  // Bar chart: villages vs risk score
  const barData = useMemo(() =>
    villages.map(v => ({
      village: v.village.length > 16 ? v.village.slice(0, 14) + '…' : v.village,
      riskScore: v.riskScore,
      fill: RISK_CONFIG[v.riskLevel]?.color || '#10b981',
      fullName: v.village,
    })),
    [villages]
  );

  // Pie chart: disease distribution
  const pieData = useMemo(() =>
    (data?.diseaseDistribution || []).slice(0, 7).map((d, idx) => ({
      name: d.disease,
      value: d.count,
      fill: DISEASE_COLORS[idx % DISEASE_COLORS.length],
    })),
    [data]
  );

  // Line chart: monthly trends
  const trendData = useMemo(() =>
    (data?.monthlyTrends || []).map(m => ({ month: m.month, count: m.count })),
    [data]
  );

  // ── Loading skeleton ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-80 animate-pulse rounded-lg bg-slate-800" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-24 animate-pulse rounded-2xl bg-slate-800/60" />
          ))}
        </div>
        <div className="h-64 animate-pulse rounded-2xl bg-slate-800/40" />
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="h-72 animate-pulse rounded-2xl bg-slate-800/40" />
          <div className="h-72 animate-pulse rounded-2xl bg-slate-800/40" />
        </div>
      </div>
    );
  }

  const hasData = villages.length > 0;

  return (
    <div className="space-y-6 pb-12">

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-500/10 text-rose-400">
              <Flame className="h-5 w-5" />
            </span>
            <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Outbreak Predictions
            </h1>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/10 px-2.5 py-0.5 text-xs font-semibold text-rose-400 border border-rose-500/20">
              <Activity className="h-3 w-3" />
              District Outbreak Intelligence
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Village risk scores calculated from verified PostgreSQL surveillance data.
            Risk Score = Cases × Severity Weights + Escalated Referrals × 5.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => loadData(true)}
            disabled={refreshing}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2 text-sm font-medium text-slate-200 transition-colors hover:bg-slate-700 hover:text-white disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'Refreshing…' : 'Refresh Data'}</span>
          </button>
        </div>
      </div>

      {/* ── Formula Banner ───────────────────────────────────────────────── */}
      <div className="surface-card rounded-2xl border border-rose-500/20 bg-gradient-to-r from-rose-950/20 via-slate-900/60 to-slate-900/60 p-4 backdrop-blur-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-rose-500/10 p-2.5 text-rose-400 border border-rose-500/20">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Risk Score Algorithm</h3>
              <p className="text-xs text-slate-400">
                Formula:{' '}
                <span className="font-mono text-cyan-400 font-semibold">
                  (Total × 1) + (Medium × 2) + (High × 3) + (Critical × 4) + (Escalated × 5)
                </span>
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {[['Safe', '0–5', '#10b981'], ['Low', '6–15', '#84cc16'], ['Medium', '16–30', '#eab308'], ['High', '31–50', '#f97316'], ['Critical', '50+', '#ef4444']].map(([label, range, color]) => (
              <span key={label} className="flex items-center gap-1.5 rounded-md bg-slate-800/80 px-2 py-1 text-slate-300 border border-slate-700">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
                {label} ({range})
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Summary Cards ────────────────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <SummaryCard
          icon={MapPinned}
          label="Villages Monitored"
          value={summary.totalVillagesMonitored ?? 0}
          iconColor="text-cyan-400"
          valueColor="text-white"
        />
        <SummaryCard
          icon={AlertTriangle}
          label="High Risk Villages"
          value={summary.highRiskVillages ?? 0}
          iconColor="text-orange-400"
          valueColor="text-orange-400"
        />
        <SummaryCard
          icon={Flame}
          label="Critical Villages"
          value={summary.criticalVillages ?? 0}
          iconColor="text-rose-400"
          valueColor="text-rose-400"
        />
        <SummaryCard
          icon={Activity}
          label="Active Validated Cases"
          value={summary.activeCases ?? 0}
          iconColor="text-cyan-400"
          valueColor="text-white"
        />
        <SummaryCard
          icon={AlertOctagon}
          label="Escalated Referrals"
          value={summary.escalatedReferrals ?? 0}
          iconColor="text-amber-400"
          valueColor="text-amber-400"
        />
        <SummaryCard
          icon={ShieldCheck}
          label="Verified Reports"
          value={summary.verifiedReports ?? 0}
          iconColor="text-emerald-400"
          valueColor="text-emerald-400"
        />
      </div>

      {/* ── No Data State ────────────────────────────────────────────────── */}
      {!hasData && (
        <div className="surface-card rounded-2xl border border-slate-700/40 bg-slate-900/60 p-10 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-800 text-slate-500">
            <MapPinned className="h-8 w-8" />
          </div>
          <h3 className="mt-4 text-lg font-bold text-white">No surveillance data available</h3>
          <p className="mt-2 text-sm text-slate-400">
            Outbreak intelligence will populate once ASHA workers submit disease surveillance reports.
          </p>
        </div>
      )}

      {hasData && (
        <>
          {/* ── Bubble Visualization ─────────────────────────────────────── */}
          <div className="surface-card rounded-2xl border border-slate-800/80 bg-slate-900/60 p-5">
            <div className="flex items-center gap-2 mb-2">
              <Flame className="h-5 w-5 text-rose-400" />
              <h3 className="text-base font-semibold text-white">Village Risk Bubble Map</h3>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Bubble size = Risk Score · Color = Risk Level · Sorted by highest risk descending
            </p>
            <BubbleCanvas villages={villages} />
            {/* Legend */}
            <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-slate-800 pt-3 text-xs text-slate-400">
              {['SAFE', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map(lvl => {
                const cfg = RISK_CONFIG[lvl];
                return (
                  <span key={lvl} className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: cfg.color }} />
                    {cfg.label}
                  </span>
                );
              })}
            </div>
          </div>

          {/* ── Village Risk Table ───────────────────────────────────────── */}
          <div className="surface-card rounded-2xl border border-slate-800/80 bg-slate-900/60 p-5">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="h-5 w-5 text-amber-400" />
              <h3 className="text-base font-semibold text-white">Villages Ranked by Risk Score</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="border-b border-slate-800 bg-slate-950/40 text-[11px] uppercase tracking-wider text-slate-400">
                  <tr>
                    <th className="py-3 px-4 font-semibold">#</th>
                    <th className="py-3 px-4 font-semibold">Village</th>
                    <th className="py-3 px-3 font-semibold text-right">Total Cases</th>
                    <th className="py-3 px-3 font-semibold text-right">Verified</th>
                    <th className="py-3 px-3 font-semibold text-center">Critical</th>
                    <th className="py-3 px-3 font-semibold text-center">High</th>
                    <th className="py-3 px-3 font-semibold text-center">Medium</th>
                    <th className="py-3 px-3 font-semibold text-center">Escalated</th>
                    <th className="py-3 px-3 font-semibold">Top Disease</th>
                    <th className="py-3 px-3 font-semibold text-right">Risk Score</th>
                    <th className="py-3 px-3 font-semibold text-center">Risk Level</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-sans">
                  {villages.map((v, idx) => {
                    const cfg = RISK_CONFIG[v.riskLevel] || RISK_CONFIG.SAFE;
                    return (
                      <tr key={v.village} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-4">
                          <span className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${idx === 0 ? 'bg-rose-500/20 text-rose-400' : 'bg-slate-800 text-slate-400'}`}>
                            {idx + 1}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <MapPinned className="h-3.5 w-3.5 shrink-0" style={{ color: cfg.color }} />
                            <span className="font-semibold text-white">{v.village}</span>
                          </div>
                          <div className="mt-1 w-full max-w-[120px]">
                            <RiskScoreBar score={v.riskScore} level={v.riskLevel} />
                          </div>
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-white">{v.totalCases}</td>
                        <td className="py-3 px-3 text-right font-mono text-emerald-400">{v.verifiedCases}</td>
                        <td className="py-3 px-3 text-center font-mono text-rose-400">{v.criticalCases}</td>
                        <td className="py-3 px-3 text-center font-mono text-orange-400">{v.highCases}</td>
                        <td className="py-3 px-3 text-center font-mono text-yellow-400">{v.mediumCases}</td>
                        <td className="py-3 px-3 text-center font-mono text-amber-400">{v.escalatedReferrals}</td>
                        <td className="py-3 px-3">
                          <span className="rounded-md bg-indigo-500/10 px-2 py-0.5 text-xs text-indigo-300 border border-indigo-500/20 font-medium">
                            {v.topDisease === 'None' ? '—' : v.topDisease}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-sm" style={{ color: cfg.color }}>
                          {v.riskScore}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <RiskBadge level={v.riskLevel} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── Risk Score Bar Chart ─────────────────────────────────────── */}
          <div className="surface-card rounded-2xl border border-slate-800/80 bg-slate-900/60 p-5">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-5 w-5 text-cyan-400" />
              <h3 className="text-base font-semibold text-white">Village Risk Distribution</h3>
            </div>
            <p className="text-xs text-slate-400 mb-4">Risk Score per village — higher score = greater outbreak risk</p>
            <div className="h-56 w-full">
              {barData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="village" stroke="#64748b" tick={{ fontSize: 11 }} />
                    <YAxis stroke="#64748b" tick={{ fontSize: 11 }} allowDecimals={false} />
                    <Tooltip content={<BarTooltip />} />
                    <Bar dataKey="riskScore" name="Risk Score" radius={[5, 5, 0, 0]}>
                      {barData.map((entry, idx) => (
                        <Cell key={`cell-${idx}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-slate-500">
                  No risk data available
                </div>
              )}
            </div>
          </div>

          {/* ── Disease Breakdown + Outbreak Trend ──────────────────────── */}
          <div className="grid gap-6 lg:grid-cols-2">

            {/* Disease Distribution Pie */}
            <div className="surface-card rounded-2xl border border-slate-800/80 bg-slate-900/60 p-5 flex flex-col">
              <div className="flex items-center gap-2 mb-1">
                <Activity className="h-5 w-5 text-indigo-400" />
                <h3 className="text-base font-semibold text-white">Disease Breakdown</h3>
              </div>
              <p className="text-xs text-slate-400 mb-4">Distribution of verified disease cases across district</p>
              <div className="h-52 w-full my-auto">
                {pieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={48}
                        outerRadius={76}
                        paddingAngle={4}
                      >
                        {pieData.map((entry, idx) => (
                          <Cell key={`pie-${idx}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip content={<PieTooltipCustom />} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-xs text-slate-500">
                    No disease data available
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs mt-2">
                {pieData.map(item => (
                  <div key={item.name} className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: item.fill }} />
                    <span className="text-slate-300 font-medium truncate">{item.name}:</span>
                    <span className="text-slate-400 font-bold">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Outbreak Trend Line Chart */}
            <div className="surface-card rounded-2xl border border-slate-800/80 bg-slate-900/60 p-5">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="h-5 w-5 text-emerald-400" />
                <h3 className="text-base font-semibold text-white">Outbreak Trend</h3>
              </div>
              <p className="text-xs text-slate-400 mb-4">Monthly verified case count from surveillance records</p>
              <div className="h-52 w-full">
                {trendData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="month" stroke="#64748b" tick={{ fontSize: 11 }} />
                      <YAxis stroke="#64748b" tick={{ fontSize: 11 }} allowDecimals={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0f172a',
                          borderColor: '#334155',
                          borderRadius: '0.75rem',
                          color: '#f8fafc',
                          fontSize: '0.72rem'
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="count"
                        name="Verified Cases"
                        stroke="#10b981"
                        strokeWidth={2.5}
                        dot={{ r: 5, fill: '#10b981', strokeWidth: 2, stroke: '#065f46' }}
                        activeDot={{ r: 7 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-xs text-slate-500">
                    No trend data available
                  </div>
                )}
              </div>
              {trendData.length > 0 && (
                <div className="mt-3 flex items-center gap-4 text-xs text-slate-400 border-t border-slate-800 pt-3">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                    Verified case incidence per month
                  </span>
                  <span className="ml-auto text-emerald-400 font-semibold">
                    Total: {trendData.reduce((s, t) => s + t.count, 0)} cases
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* ── Footer Note ─────────────────────────────────────────────── */}
          <div className="flex items-center gap-2 rounded-xl border border-slate-700/40 bg-slate-900/40 px-4 py-2.5 text-xs text-slate-400">
            <Clock className="h-3.5 w-3.5 text-slate-500 shrink-0" />
            <span>
              All data sourced strictly from <span className="text-cyan-400 font-medium">healthguard_db</span> PostgreSQL.
              Only <span className="text-emerald-400 font-medium">VERIFIED</span> and <span className="text-amber-400 font-medium">ESCALATED</span> reports are used for risk calculations.
              Refresh to see latest surveillance data.
            </span>
          </div>
        </>
      )}
    </div>
  );
}
