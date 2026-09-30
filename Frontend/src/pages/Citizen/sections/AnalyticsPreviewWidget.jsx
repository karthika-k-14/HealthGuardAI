import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Utensils, CheckCircle2, Siren } from 'lucide-react';
import { useCaseContext } from '../../../contexts/CaseContext';
import { PATHS } from '../../../constants/routes';
import Badge from '../../../components/common/Badge';
import { isValidAssessment } from '../../../utils/assessmentUtils';

export default function AnalyticsPreviewWidget() {
  const { latestAssessment, latestDiagnosis } = useCaseContext();
  const currentAssessment = latestAssessment || latestDiagnosis;

  const hasAssessment = isValidAssessment(currentAssessment);

  const rawSeverity = (currentAssessment?.riskLevel || currentAssessment?.severity || 'LOW').toUpperCase();
  const severity = rawSeverity === 'MEDIUM' ? 'MODERATE' : rawSeverity;
  const conditionName = currentAssessment?.prediction || currentAssessment?.predictedCondition || 'Symptom Assessment';
  const symptoms = currentAssessment?.symptoms || [];

  return (
    <div className="surface-card p-6 flex flex-col justify-between space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <Utensils className="h-4 w-4" />
          </span>
          <div>
            <p className="text-sm font-semibold text-slate-900 dark:text-white">AI Nutrition Planner</p>
            <p className="text-[11px] text-slate-400">Symptom-Driven Recovery</p>
          </div>
        </div>
        <Link
          to={PATHS.CITIZEN_ANALYTICS}
          className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400"
        >
          Open Planner <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      {hasAssessment ? (
        <>
          {/* Diagnosis Summary Strip */}
          <div className="rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/70 dark:border-white/10 p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900 dark:text-white">{conditionName}</span>
                {severity === 'LOW' && <Badge tone="brand">Low</Badge>}
                {severity === 'MODERATE' && <Badge tone="amber">Moderate</Badge>}
                {severity === 'HIGH' && <Badge tone="rose">High Risk</Badge>}
                {severity === 'CRITICAL' && <Badge tone="critical">Critical</Badge>}
                {severity === 'EMERGENCY' && <Badge tone="critical">Emergency</Badge>}
              </div>
            </div>
          </div>

          {/* Content Preview */}
          {severity === 'HIGH' || severity === 'CRITICAL' || severity === 'EMERGENCY' ? (
            <div className="rounded-xl bg-rose-500/10 border border-rose-500/20 p-3 text-xs text-rose-700 dark:text-rose-300 font-medium flex items-center gap-2">
              <Siren className="h-4 w-4 text-rose-600 shrink-0" />
              <span>Your symptoms require medical attention. Consult a doctor immediately.</span>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" /> Symptoms Being Addressed:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {symptoms.slice(0, 4).map((sym, idx) => {
                  const symText = typeof sym === 'object' && sym !== null ? (sym.name || sym.symptom || JSON.stringify(sym)) : String(sym);
                  return (
                    <span key={idx} className="rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 text-[11px] font-medium">
                      ✓ {symText}
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/10 p-4 text-center space-y-2">
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            No active symptom assessment. Run Symptom Checker to generate your AI Nutrition Plan.
          </p>
        </div>
      )}
    </div>
  );
}
