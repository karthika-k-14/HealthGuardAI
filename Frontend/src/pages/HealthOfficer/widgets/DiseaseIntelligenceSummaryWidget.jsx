import React, { useEffect, useState } from 'react';
import { Activity, Flame, ShieldAlert, ArrowUpRight, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PATHS } from '../../../constants/routes';
import { forecastingApi } from '../../../api/forecastingApi';
import Badge from '../../../components/common/Badge';

export default function DiseaseIntelligenceSummaryWidget() {
  const [intel, setIntel] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const res = await forecastingApi.getOfficerDiseaseIntelligence();
        if (mounted) setIntel(res);
      } catch (e) {
        console.error('Failed to load disease intelligence summary:', e);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const topHotspot = intel?.highRiskVillages?.[0];
  const activeCases = intel?.totalActiveCases || 0;
  const criticalCases = intel?.severityBreakdown?.CRITICAL || 0;

  return (
    <div className="surface-card flex flex-col justify-between rounded-2xl border border-slate-800/80 bg-slate-900/60 p-5 backdrop-blur-md">
      <div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-500/10 text-rose-400">
              <Flame className="h-4 w-4" />
            </span>
            <h3 className="text-sm font-semibold text-white">Disease Intelligence &amp; Outbreaks</h3>
          </div>
          <Link
            to={PATHS.OFFICER_ANALYTICS}
            className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-0.5 font-medium"
          >
            <span>View Intel</span>
            <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>

        <p className="mt-1 text-xs text-slate-400">
          Validated field surveillance risk scoring
        </p>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-3">
            <span className="text-[11px] font-medium text-slate-400 uppercase">Active Cases</span>
            <p className="text-xl font-bold text-white mt-0.5">{activeCases}</p>
            <span className="text-[10px] text-cyan-400">Validated reports</span>
          </div>

          <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-3">
            <span className="text-[11px] font-medium text-rose-300 uppercase">Critical Severity</span>
            <p className="text-xl font-bold text-rose-400 mt-0.5">{criticalCases}</p>
            <span className="text-[10px] text-rose-400/80">Immediate attention</span>
          </div>
        </div>

        {topHotspot ? (
          <div className="mt-3 rounded-xl border border-amber-500/20 bg-amber-500/10 p-2.5 text-xs text-amber-300 flex items-center justify-between">
            <div>
              <span className="font-semibold">{topHotspot.village}</span>
              <span className="text-amber-400/80 ml-1">({topHotspot.disease || topHotspot.prevalentDisease || 'General'})</span>
            </div>
            <span className="font-mono font-bold text-rose-400">
              Score: {topHotspot.outbreakRisk?.score ?? topHotspot.outbreakRiskScore ?? 0}
            </span>
          </div>
        ) : (
          <div className="mt-3 rounded-xl border border-slate-800 bg-slate-950/30 p-2.5 text-[11px] text-slate-400 text-center">
            {activeCases > 0 ? 'No critical outbreak clusters identified' : 'Awaiting validated reports for cluster scoring'}
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
        <span className="text-slate-400">Outbreak Risk Algorithm</span>
        <span className="font-mono text-cyan-400 text-[11px]">Cases × Wt × Growth</span>
      </div>
    </div>
  );
}
