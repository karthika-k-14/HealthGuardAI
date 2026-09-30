import React, { useEffect, useState } from 'react';
import { BrainCircuit, Tags, Activity, TriangleAlert, MapPinned } from 'lucide-react';
import { fetchAIPipelineAnalytics } from '../../../api/officerApi';
import { URGENCY_TONE } from '../../../constants/urgency';
import Badge from '../../../components/common/Badge';
import { SkeletonCard } from '../../../components/common/Skeleton';

/**
 * Rolls up everything the AI pipeline has produced across all
 * citizen cases into one Health Officer view: disease-category
 * breakdown (AI Module 3 output), urgency distribution (Module 4),
 * escalation analytics (how many cases reached Critical/High), and
 * ward-wise trends. Pulls from fetchAIPipelineAnalytics(), which
 * itself reuses the shared case store — no duplicated aggregation
 * logic.
 */
export default function AIPipelineAnalyticsWidget() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchAIPipelineAnalytics().then(setData);
  }, []);

  if (!data) return <SkeletonCard className="h-72" />;

  const diseaseCategoryBreakdown = Array.isArray(data.diseaseCategoryBreakdown) ? data.diseaseCategoryBreakdown : [];
  const wardTrends = Array.isArray(data.wardTrends) ? data.wardTrends : [];
  const urgencyDistribution = Array.isArray(data.urgencyDistribution) ? data.urgencyDistribution : [];
  const escalationAnalytics = data.escalationAnalytics || { criticalEscalations: 0, highEscalations: 0, criticalEscalationRate: 0 };

  const maxCategory = Math.max(1, ...diseaseCategoryBreakdown.map((d) => d.count || 0));
  const maxWard = Math.max(1, ...wardTrends.map((w) => w.count || 0));

  return (
    <div className="surface-card space-y-5 p-5">
      <div className="flex items-center justify-between">
        <p className="flex items-center gap-1.5 text-sm font-semibold text-slate-900 dark:text-white">
          <BrainCircuit className="h-4 w-4 text-brand-500" /> AI Prediction Analytics
        </p>
        <Badge tone="neutral">{data.totalAICases} AI-processed cases</Badge>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
            <Tags className="h-3.5 w-3.5" /> Disease category breakdown
          </p>
          <div className="space-y-2">
            {diseaseCategoryBreakdown.map((d) => (
              <div key={d.category} className="text-xs">
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                  <span>{d.category}</span>
                  <span className="font-medium">{d.count}</span>
                </div>
                <div className="mt-1 h-1.5 rounded-full bg-slate-100 dark:bg-white/10">
                  <div
                    className="h-1.5 rounded-full bg-brand-500"
                    style={{ width: `${(d.count / maxCategory) * 100}%` }}
                  />
                </div>
              </div>
            ))}
            {diseaseCategoryBreakdown.length === 0 && (
              <p className="text-xs text-slate-400">No classified cases yet.</p>
            )}
          </div>
        </div>

        <div>
          <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
            <Activity className="h-3.5 w-3.5" /> Urgency distribution
          </p>
          <div className="flex flex-wrap gap-2">
            {urgencyDistribution.map((u) => (
              <Badge key={u.level} tone={URGENCY_TONE[u.level]}>
                {u.level}: {u.count}
              </Badge>
            ))}
          </div>

          <p className="mb-2 mt-4 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
            <TriangleAlert className="h-3.5 w-3.5" /> Escalation analytics
          </p>
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="rounded-lg bg-slate-50 p-2 dark:bg-white/5">
              <p className="text-base font-semibold text-rose-600 dark:text-rose-400">{escalationAnalytics.criticalEscalations ?? 0}</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Critical</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-2 dark:bg-white/5">
              <p className="text-base font-semibold text-amber-600 dark:text-amber-400">{escalationAnalytics.highEscalations ?? 0}</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">High</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-2 dark:bg-white/5">
              <p className="text-base font-semibold text-slate-700 dark:text-slate-200">{escalationAnalytics.criticalEscalationRate ?? 0}%</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Critical rate</p>
            </div>
          </div>
        </div>
      </div>

      <div>
        <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
          <MapPinned className="h-3.5 w-3.5" /> Ward-wise trends
        </p>
        <div className="space-y-2">
          {wardTrends.map((w) => (
            <div key={w.ward} className="text-xs">
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                <span>{w.ward}</span>
                <span className="font-medium">{w.count} cases</span>
              </div>
              <div className="mt-1 h-1.5 rounded-full bg-slate-100 dark:bg-white/10">
                <div className="h-1.5 rounded-full bg-sky-500" style={{ width: `${(w.count / maxWard) * 100}%` }} />
              </div>
            </div>
          ))}
          {wardTrends.length === 0 && <p className="text-xs text-slate-400">No ward data yet.</p>}
        </div>
      </div>
    </div>
  );
}
