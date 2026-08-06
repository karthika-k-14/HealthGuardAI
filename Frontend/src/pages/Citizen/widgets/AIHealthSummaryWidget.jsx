import React, { useEffect, useState } from 'react';
import { Brain, Tags, Activity, MapPin } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { useCitizenCases } from '../../../contexts/CaseContext';
import { fetchNearestPHCs } from '../../../api/hospitalApi';
import { getDecisionForUrgency, URGENCY_TONE } from '../../../constants/urgency';
import Badge from '../../../components/common/Badge';

/**
 * AI Health Summary — the Citizen dashboard's window into the AI
 * pipeline's most recent output for this citizen (Disease
 * Classification + Urgency Prediction + Decision Engine), reading
 * from the same shared case store CaseTrackerWidget uses so it never
 * duplicates fetch logic. Only renders once the citizen has at least
 * one AI-generated case.
 */
export default function AIHealthSummaryWidget() {
  const { user } = useAuth();
  const { cases, isLoading } = useCitizenCases(user?.name);
  const [nearestPHCs, setNearestPHCs] = useState([]);

  const latest = cases?.[0];
  const decision = latest ? getDecisionForUrgency(latest.riskLevel) : null;

  useEffect(() => {
    if (decision?.showNearestPHC) {
      fetchNearestPHCs(2).then(setNearestPHCs);
    } else {
      setNearestPHCs([]);
    }
  }, [decision?.showNearestPHC]);

  if (isLoading || !latest) return null;

  return (
    <div className="surface-card space-y-4 p-5">
      <div className="flex items-center justify-between">
        <p className="flex items-center gap-1.5 text-sm font-semibold text-slate-900 dark:text-white">
          <Brain className="h-4 w-4 text-brand-500" /> AI Health Summary
        </p>
        <Badge tone={URGENCY_TONE[latest.riskLevel]}>{latest.riskLevel} urgency</Badge>
      </div>

      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="rounded-lg bg-slate-50 p-2.5 dark:bg-white/5">
          <p className="flex items-center gap-1 font-medium text-slate-500 dark:text-slate-400">
            <Tags className="h-3 w-3" /> Disease category
          </p>
          <p className="mt-1 text-sm font-semibold text-slate-800 dark:text-slate-100">{latest.diseaseCategory || 'General Illness'}</p>
        </div>
        <div className="rounded-lg bg-slate-50 p-2.5 dark:bg-white/5">
          <p className="flex items-center gap-1 font-medium text-slate-500 dark:text-slate-400">
            <Activity className="h-3 w-3" /> Reported condition
          </p>
          <p className="mt-1 text-sm font-semibold text-slate-800 dark:text-slate-100">{latest.disease || '—'}</p>
        </div>
      </div>

      {decision && (
        <div className="rounded-xl bg-brand-50 px-3 py-2.5 text-xs text-brand-700 dark:bg-brand-500/10 dark:text-brand-300">
          <span className="font-semibold">{decision.title}:</span> {decision.summary}
        </div>
      )}

      {nearestPHCs.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Nearby PHCs</p>
          {nearestPHCs.map((phc) => (
            <div key={phc.id} className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
              <MapPin className="h-3 w-3 text-brand-500" /> {phc.name} · {phc.distanceKm} km
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
