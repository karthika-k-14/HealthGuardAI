import React, { useEffect, useState } from 'react';
import { BrainCircuit, MapPin, ClipboardList, TriangleAlert, Siren, Stethoscope, Sparkles } from 'lucide-react';
import { fetchVillageAnalytics } from '../../../api/villageApi';
import { villageRiskTone, normalizeRiskLevel, getVillageAIRecommendation } from '../../../constants/villageRisk';
import Badge from '../../../components/common/Badge';
import { SkeletonGrid } from '../../../components/common/Skeleton';

/**
 * AI Public Health Intelligence Center.
 *
 * Groups AI-driven analytics by village for the Health Officer, fed
 * entirely by live surveillance statistics via fetchVillageAnalytics().
 */
export default function PublicHealthIntelligenceWidget() {
  const [data, setData] = useState(null);

  useEffect(() => {
    let mounted = true;
    fetchVillageAnalytics().then((res) => {
      if (mounted) setData(res);
    });
    return () => {
      mounted = false;
    };
  }, []);

  if (!data) return <SkeletonGrid count={6} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" cardClassName="p-5" />;

  const villages = data.villages || [];

  return (
    <div className="surface-card p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400">
            <BrainCircuit className="h-4.5 w-4.5" />
          </span>
          <div>
            <p className="text-sm font-semibold text-slate-900 dark:text-white">AI Public Health Intelligence Center</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {data.district ? `${data.district}${data.state ? `, ${data.state}` : ''}` : 'District analytics'} · village-wise AI assessment trends
            </p>
          </div>
        </div>
        <Badge tone="neutral">{villages.length} villages tracked</Badge>
      </div>

      {villages.length === 0 ? (
        <p className="mt-6 text-center text-sm text-slate-400">No village analytics available yet.</p>
      ) : (
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {villages.map((village) => {
            const riskLevel = normalizeRiskLevel(village.riskLevel);
            return (
              <div
                key={village.name}
                className="rounded-xl border border-slate-200/70 p-4 dark:border-white/10"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="flex items-center gap-1.5 text-sm font-semibold text-slate-900 dark:text-white">
                    <MapPin className="h-3.5 w-3.5 text-brand-500" /> {village.name}
                  </p>
                  <Badge tone={villageRiskTone(riskLevel)}>{riskLevel} risk</Badge>
                </div>

                <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-lg bg-slate-50 p-2 dark:bg-white/5">
                    <p className="flex items-center justify-center gap-1 text-[10px] font-medium uppercase tracking-wide text-slate-400">
                      <ClipboardList className="h-3 w-3" /> Assessed
                    </p>
                    <p className="mt-0.5 text-sm font-semibold text-slate-800 dark:text-slate-100">
                      {village.totalAssessments ?? 0}
                    </p>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-2 dark:bg-white/5">
                    <p className="flex items-center justify-center gap-1 text-[10px] font-medium uppercase tracking-wide text-slate-400">
                      <TriangleAlert className="h-3 w-3" /> High Risk
                    </p>
                    <p className="mt-0.5 text-sm font-semibold text-slate-800 dark:text-slate-100">
                      {village.highRiskCases ?? 0}
                    </p>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-2 dark:bg-white/5">
                    <p className="flex items-center justify-center gap-1 text-[10px] font-medium uppercase tracking-wide text-slate-400">
                      <Siren className="h-3 w-3" /> Critical
                    </p>
                    <p className="mt-0.5 text-sm font-semibold text-slate-800 dark:text-slate-100">
                      {village.criticalCases ?? 0}
                    </p>
                  </div>
                </div>

                <p className="mt-3 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                  <Stethoscope className="h-3.5 w-3.5 shrink-0 text-brand-500" />
                  Most common: <span className="font-medium text-slate-700 dark:text-slate-200">{village.topDisease || 'N/A'}</span>
                </p>

                <div className="mt-3 flex items-start gap-1.5 rounded-lg bg-brand-50 p-2.5 text-xs text-brand-700 dark:bg-brand-500/10 dark:text-brand-300">
                  <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  {getVillageAIRecommendation(riskLevel)}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
