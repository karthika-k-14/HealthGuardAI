// v3 — removed Case Severity Distribution section (2026-09-20)
import React, { useEffect, useState, useMemo } from 'react';
import {
  Activity,
  ShieldCheck,
  TrendingUp,
  MapPin,
  RefreshCw,
  Clock,
  AlertOctagon,
  FileCheck2,
  Flame
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import toast from 'react-hot-toast';
import { forecastingApi } from '../../api/forecastingApi';
import Badge from '../../components/common/Badge';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------



const RISK_BADGES = {
  'Critical Risk': { tone: 'rose',    label: 'Critical Risk' },
  'High Risk':     { tone: 'rose',    label: 'High Risk'     },
  'Medium Risk':   { tone: 'amber',   label: 'Medium Risk'   },
  'Low Risk':      { tone: 'emerald', label: 'Low Risk'      }
};

// Palette for per-disease area lines (safe for recharts)
const DISEASE_COLORS = [
  '#f43f5e', '#3b82f6', '#8b5cf6', '#10b981',
  '#f59e0b', '#06b6d4', '#ec4899', '#a3e635'
];

// ---------------------------------------------------------------------------
// Custom Tooltip for Timeline chart
// Shows real disease names from diseaseKeyMap
// ---------------------------------------------------------------------------
const TimelineTooltip = ({ active, payload, label, diseaseKeyMap }) => {
  if (!active || !payload || !payload.length) return null;
  // Filter out null values — these are dates where a disease has no verified reports
  const visibleEntries = payload.filter(entry => entry.value != null && entry.value > 0);
  if (!visibleEntries.length) return null;
  return (
    <div
      style={{
        backgroundColor: '#0f172a',
        border: '1px solid #334155',
        borderRadius: '0.75rem',
        padding: '10px 14px',
        fontSize: '0.72rem',
        color: '#f8fafc',
        minWidth: 160
      }}
    >
      <p style={{ fontWeight: 700, marginBottom: 6, color: '#94a3b8', borderBottom: '1px solid #1e293b', paddingBottom: 4 }}>{label}</p>
      {visibleEntries.map((entry) => {
        const realName = diseaseKeyMap?.[entry.dataKey] || entry.dataKey.replace(/_/g, ' ');
        return (
          <div key={entry.dataKey} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
            <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: entry.color, flexShrink: 0 }} />
            <span style={{ color: '#cbd5e1', flex: 1 }}>{realName}:</span>
            <span style={{ fontWeight: 700, color: entry.color }}>{entry.value}</span>
          </div>
        );
      })}
    </div>
  );
};


// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function DistrictAnalytics() {
  const [intel, setIntel]       = useState(null);
  const [loading, setLoading]   = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await forecastingApi.getOfficerDiseaseIntelligence();
      setIntel(res);
      if (isManual) toast.success('Disease intelligence analytics refreshed');
    } catch (err) {
      console.error('Failed to load disease intelligence data:', err);
      toast.error('Failed to fetch surveillance intelligence');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  // -------------------------------------------------------------------------
  // Derived chart datasets
  // -------------------------------------------------------------------------

  // Disease Distribution Pie
  const diseasePieData = useMemo(() => {
    if (!intel?.diseaseDistribution?.length) return [];
    return intel.diseaseDistribution.slice(0, 6).map((item, idx) => ({
      name:  item.disease,
      value: item.count,
      color: DISEASE_COLORS[idx % DISEASE_COLORS.length]
    }));
  }, [intel]);

  // Village Bar Chart
  const villageBarData = useMemo(() => {
    if (!intel?.villageDistribution?.length) return [];
    return intel.villageDistribution.slice(0, 8).map(item => ({
      village: item.village.length > 14 ? item.village.substring(0, 12) + '…' : item.village,
      cases:   item.count
    }));
  }, [intel]);

  // --------------------------
  // Timeline / Trend AreaChart
  // --------------------------
  // The backend emits recharts-safe sanitised keys like "Tuberculosis_TB"
  // and a diseaseKeyMap {"Tuberculosis_TB": "Tuberculosis (TB)", ...} for labels.
  const diseaseKeyMap = useMemo(() => intel?.diseaseKeyMap || {}, [intel]);

  const timelineData = useMemo(() => {
    if (!intel?.timelineTrends?.length) {
      console.log('[DistrictAnalytics] No timelineTrends in response:', intel);
      return [];
    }
    const DISEASE_KEYS = ['Dengue', 'COVID_19', 'Tuberculosis_TB', 'Malaria', 'Viral_Fever', 'Other'];
    const data = intel.timelineTrends.map(item => {
      const entry = {
        ...item,
        // Use backend-provided displayDate if present, otherwise compute from date
        displayDate: item.displayDate
          || (typeof item.date === 'string' && item.date.length >= 7
            ? item.date.slice(5)
            : String(item.date))
      };
      // Replace 0 with null for disease keys so recharts renders a gap (no dot, no line)
      // on dates where that disease has no verified reports.
      // This is the key fix: prevents flat-zero ghost lines for absent diseases.
      DISEASE_KEYS.forEach(k => {
        if (entry[k] === 0) entry[k] = null;
      });
      return entry;
    });
    console.log('[DistrictAnalytics] timelineData (0→null for absent diseases):', data);
    return data;
  }, [intel]);


  // Extract disease safe-keys that have at least 1 case across all dates.
  // IMPORTANT: Only include a key if its total across all dates > 0.
  // This prevents ghost zero-lines for diseases with no verified reports.
  // We also enforce the canonical order so the chart legend is consistent.
  const CANONICAL_DISEASE_ORDER = ['Dengue', 'COVID_19', 'Tuberculosis_TB', 'Malaria', 'Viral_Fever', 'Other'];

  const trendKeys = useMemo(() => {
    if (!timelineData.length) return [];

    // Sum each disease key across all dates
    const keyTotals = {};
    timelineData.forEach(item => {
      Object.keys(item).forEach(k => {
        if (k !== 'date' && k !== 'total' && k !== 'displayDate') {
          keyTotals[k] = (keyTotals[k] || 0) + (item[k] || 0);
        }
      });
    });

    // Only include keys with at least 1 case, in canonical order
    const activeKeys = CANONICAL_DISEASE_ORDER.filter(k => (keyTotals[k] || 0) > 0);

    // Also include any non-canonical keys with cases (edge case safety)
    const extraKeys = Object.keys(keyTotals)
      .filter(k => !CANONICAL_DISEASE_ORDER.includes(k) && keyTotals[k] > 0);

    const result = [...activeKeys, ...extraKeys];
    console.log('[DistrictAnalytics] trendKeys (active only):', result);
    console.log('[DistrictAnalytics] keyTotals (all diseases summed):', keyTotals);
    return result;
  }, [timelineData, intel]);


  // -------------------------------------------------------------------------
  // Loading skeleton
  // -------------------------------------------------------------------------
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-72 animate-pulse rounded-lg bg-slate-800" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-28 animate-pulse rounded-2xl bg-slate-800/60" />
          ))}
        </div>
        <div className="h-96 animate-pulse rounded-2xl bg-slate-800/40" />
      </div>
    );
  }

  const hasApprovedCases = (intel?.totalApprovedReports || 0) > 0;

  return (
    <div className="space-y-6 pb-12">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500/10 text-brand-400">
              <Activity className="h-5 w-5" />
            </span>
            <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Disease Intelligence Dashboard
            </h1>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-cyan-500/10 px-2.5 py-0.5 text-xs font-semibold text-cyan-400 border border-cyan-500/20">
              <ShieldCheck className="h-3 w-3" />
              Health Officer Surveillance
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Real-time disease intelligence, outbreak risk scoring, and village surveillance hotspots — strictly from verified PostgreSQL records.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => loadData(true)}
            disabled={refreshing}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2 text-sm font-medium text-slate-200 transition-colors hover:bg-slate-700 hover:text-white disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'Refreshing…' : 'Refresh Surveillance'}</span>
          </button>
        </div>
      </div>

      {/* ── Outbreak Risk Formula Banner ────────────────────────────────── */}
      <div className="surface-card rounded-2xl border border-brand-500/20 bg-gradient-to-r from-brand-950/20 via-slate-900/60 to-slate-900/60 p-4 backdrop-blur-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-brand-500/10 p-2.5 text-brand-400 border border-brand-500/20">
              <Flame className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Outbreak Risk Score Algorithm</h3>
              <p className="text-xs text-slate-400">
                Formula:{' '}
                <span className="font-mono text-cyan-400 font-semibold">
                  Outbreak Risk Score = Case Count × Severity Weight × Growth Rate
                </span>
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {[['Low','1'],['Medium','2'],['High','3'],['Critical','4']].map(([label, wt]) => (
              <span key={label} className="rounded-md bg-slate-800/80 px-2 py-1 text-slate-300 border border-slate-700">
                {label} = {wt}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── KPI Cards ───────────────────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Active Validated Cases */}
        <div className="surface-card rounded-2xl border border-slate-800/80 bg-slate-900/60 p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Active Validated Cases</span>
            <Activity className="h-5 w-5 text-cyan-400" />
          </div>
          <p className="mt-3 text-3xl font-bold text-white">{intel?.totalActiveCases ?? 0}</p>
          <div className="mt-1 flex items-center gap-1.5 text-xs text-cyan-400">
            <span>Verified in PostgreSQL</span>
          </div>
        </div>

        {/* Approved Reports */}
        <div className="surface-card rounded-2xl border border-slate-800/80 bg-slate-900/60 p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Approved Reports</span>
            <FileCheck2 className="h-5 w-5 text-emerald-400" />
          </div>
          <p className="mt-3 text-3xl font-bold text-emerald-400">{intel?.totalApprovedReports ?? 0}</p>
          <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-400">
            <span>Out of {intel?.totalSubmittedReports ?? 0} submitted</span>
          </div>
        </div>

        {/* Verification Rate */}
        <div className="surface-card rounded-2xl border border-slate-800/80 bg-slate-900/60 p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Verification Rate</span>
            <ShieldCheck className="h-5 w-5 text-indigo-400" />
          </div>
          <p className="mt-3 text-3xl font-bold text-indigo-400">{intel?.approvalRate ?? 0}%</p>
          <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-400">
            <span>Health Officer validation rate</span>
          </div>
        </div>

        {/* High Risk Villages */}
        <div className="surface-card rounded-2xl border border-slate-800/80 bg-slate-900/60 p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">High Risk Villages</span>
            <AlertOctagon className="h-5 w-5 text-rose-400" />
          </div>
          <p className="mt-3 text-3xl font-bold text-rose-400">{intel?.highRiskVillages?.length ?? 0}</p>
          <div className="mt-1 flex items-center gap-1.5 text-xs text-rose-400/80">
            <span>Surveillance hotspots</span>
          </div>
        </div>
      </div>

      {/* ── No-data banner ──────────────────────────────────────────────── */}
      {!hasApprovedCases && (
        <div className="surface-card rounded-2xl border border-cyan-500/30 bg-cyan-950/10 p-6 text-center backdrop-blur-md">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Clock className="h-7 w-7" />
          </div>
          <h3 className="mt-3 text-lg font-bold text-white">
            Surveillance Reports Awaiting Verification
          </h3>
          <p className="mx-auto mt-1.5 max-w-lg text-xs text-slate-400">
            There are currently{' '}
            <span className="font-semibold text-cyan-300">
              {intel?.totalSubmittedReports ?? 0} field reports
            </span>{' '}
            submitted by ASHA workers. Once verified through Disease Surveillance, all
            analytics will populate automatically.
          </p>
        </div>
      )}

      {/* ── Outbreak Detection & Village Risk Hotspots Table ─────────────── */}
      <div className="surface-card rounded-2xl border border-slate-800/80 bg-slate-900/60 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <Flame className="h-5 w-5 text-rose-500" />
              <h3 className="text-base font-semibold text-white">
                Outbreak Detection &amp; Village Risk Hotspots
              </h3>
            </div>
            <p className="text-xs text-slate-400">
              Ranked by Outbreak Risk Score (Cases × Severity Weight × Growth Rate)
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="border-b border-slate-800 bg-slate-950/40 text-[11px] uppercase tracking-wider text-slate-400">
              <tr>
                <th className="py-3 px-4 font-semibold">Village / Area</th>
                <th className="py-3 px-3 font-semibold">Prevalent Disease</th>
                <th className="py-3 px-3 font-semibold text-right">Case Count</th>
                <th className="py-3 px-3 font-semibold text-center">Severity Wt</th>
                <th className="py-3 px-3 font-semibold text-center">Growth Rate</th>
                <th className="py-3 px-3 font-semibold text-right">Outbreak Risk Score</th>
                <th className="py-3 px-3 font-semibold text-center">Risk Level</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {intel?.highRiskVillages?.length > 0 ? (
                intel.highRiskVillages.map((item, idx) => {
                  // All fields come directly as primitives from the backend (no nested lookup needed)
                  const diseaseName  = item.prevalentDisease || item.disease || 'General';
                  const sevWeight    = item.severityWeight    ?? item.outbreakRisk?.weight    ?? '—';
                  const growthRate   = item.growthRate        ?? item.outbreakRisk?.growthRate ?? '—';
                  const riskScore    = item.outbreakRiskScore ?? item.outbreakRisk?.score      ?? '—';
                  const riskLevel    = item.riskLevel         ?? item.outbreakRisk?.level      ?? 'Low Risk';
                  const badge        = RISK_BADGES[riskLevel] || { tone: 'rose', label: riskLevel };

                  return (
                    <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-white">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-cyan-400 shrink-0" />
                          <span>{item.village}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-3">
                        <span className="rounded-md bg-indigo-500/10 px-2 py-0.5 text-xs text-indigo-300 border border-indigo-500/20 font-medium">
                          {diseaseName}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-right font-mono font-bold text-white">
                        {item.caseCount}
                      </td>
                      <td className="py-3.5 px-3 text-center font-mono text-slate-300">
                        {sevWeight}×
                      </td>
                      <td className="py-3.5 px-3 text-center font-mono text-slate-300">
                        {typeof growthRate === 'number' ? growthRate.toFixed(2) : growthRate}×
                      </td>
                      <td className="py-3.5 px-3 text-right font-mono font-bold text-rose-400 text-sm">
                        {typeof riskScore === 'number' ? riskScore.toFixed(1) : riskScore}
                      </td>
                      <td className="py-3.5 px-3 text-center">
                        <Badge tone={badge.tone}>{badge.label}</Badge>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-xs text-slate-500">
                    No active high-risk village outbreaks detected.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Charts: Village Distribution + Disease Share ─────────────────── */}
      <div className="grid gap-6 lg:grid-cols-2">

        {/* Village-wise Disease Distribution (Bar) */}
        <div className="surface-card rounded-2xl border border-slate-800/80 bg-slate-900/60 p-5">
          <h3 className="text-base font-semibold text-white">Village-wise Disease Distribution</h3>
          <p className="text-xs text-slate-400 mb-4">Total validated surveillance cases per village</p>
          <div className="h-80 w-full">
            {villageBarData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={villageBarData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="village" stroke="#64748b" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#64748b" tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '0.75rem',
                      color: '#f8fafc',
                      fontSize: '0.75rem'
                    }}
                  />
                  <Bar dataKey="cases" name="Cases" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-500">
                Awaiting validated reports for village charting
              </div>
            )}
          </div>
        </div>

        {/* Active Disease Share (Pie) */}
        <div className="surface-card rounded-2xl border border-slate-800/80 bg-slate-900/60 p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-semibold text-white">Active Disease Share</h3>
            <p className="text-xs text-slate-400 mb-4">Breakdown by diagnosed pathology across district</p>
          </div>
          <div className="h-64 w-full my-auto">
            {diseasePieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={diseasePieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={4}
                  >
                    {diseasePieData.map((entry, idx) => (
                      <Cell key={`pie-${idx}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '0.75rem',
                      color: '#f8fafc',
                      fontSize: '0.75rem'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-500">
                No active disease breakdown available
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs mt-4">
            {diseasePieData.map(item => (
              <div key={item.name} className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                <span className="text-slate-300 font-medium truncate">{item.name}:</span>
                <span className="text-slate-400 font-bold">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Disease Surveillance Trends (AreaChart) ──────────────────────── */}
      {/*
        ROOT-CAUSE FIX: recharts cannot use parentheses or hyphens in dataKey
        (e.g. "Tuberculosis (TB)" or "COVID-19"). The backend now emits safe
        keys ("Tuberculosis_TB", "COVID_19") and a diseaseKeyMap for labels.
        We use a custom tooltip to translate safe keys → real disease names.
      */}
      <div className="surface-card rounded-2xl border border-slate-800/80 bg-slate-900/60 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-cyan-400" />
              <h3 className="text-base font-semibold text-white">Disease Surveillance Trends</h3>
            </div>
            <p className="text-xs text-slate-400">Validated case incidence over timeline by pathology</p>
          </div>

          {/* Legend dots */}
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="h-2 w-2 rounded-full bg-cyan-400" />
              Total
            </span>
            {trendKeys.slice(0, 5).map((sk, i) => (
              <span key={sk} className="flex items-center gap-1.5 text-slate-400">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: DISEASE_COLORS[(i + 1) % DISEASE_COLORS.length] }}
                />
                {/* Show real disease name from map, fallback to safe key */}
                {diseaseKeyMap[sk] || sk.replace(/_/g, ' ')}
              </span>
            ))}
          </div>
        </div>

        <div className="h-80 w-full">
          {timelineData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={timelineData}
                margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
              >
                <defs>
                  <linearGradient id="totalTrendGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#06b6d4" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="displayDate" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} allowDecimals={false} />

                {/* Custom tooltip that translates safe keys → real disease names */}
                <Tooltip
                  content={<TimelineTooltip diseaseKeyMap={diseaseKeyMap} />}
                />

                {/* Total cases area */}
                <Area
                  type="monotone"
                  dataKey="total"
                  name="Total"
                  stroke="#06b6d4"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#totalTrendGrad)"
                  dot={{ r: 4, fill: '#06b6d4' }}
                />

                {/* Per-disease lines using recharts-safe keys */}
                {/* connectNulls={false} = lines only appear on dates with actual cases */}
                {trendKeys.map((sk, idx) => (
                  <Area
                    key={sk}
                    type="monotone"
                    dataKey={sk}
                    name={diseaseKeyMap[sk] || sk}
                    stroke={DISEASE_COLORS[(idx + 1) % DISEASE_COLORS.length]}
                    strokeWidth={1.5}
                    fill="none"
                    dot={{ r: 3, fill: DISEASE_COLORS[(idx + 1) % DISEASE_COLORS.length] }}
                    connectNulls={false}
                  />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-slate-500">
              Awaiting validated reports for chronological trend analysis
            </div>
          )}
        </div>
      </div>


    </div>
  );
}
