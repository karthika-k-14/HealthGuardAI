import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { Stethoscope, Info, TriangleAlert, HeartPulse, ClipboardList, Languages, Brain, Tags, Activity, Workflow, MapPin, ChevronDown } from 'lucide-react';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import CaseTimeline from '../../components/common/CaseTimeline';
import { runPipelineFromSymptoms } from '../../api/aiPipelineApi';
import { fetchNearestPHCs } from '../../api/hospitalApi';
import { useCaseContext } from '../../contexts/CaseContext';
import { useAuth } from '../../contexts/AuthContext';
import { URGENCY_LEVELS } from '../../constants/urgency';
import { cn } from '../../utils/cn';

const SYMPTOM_OPTIONS = [
  'Fever', 'Headache', 'Cough', 'Sore throat', 'Fatigue', 'Joint pain',
  'Nausea', 'Chills', 'Rash', 'Diarrhea', 'Abdominal pain', 'Sensitivity to light',
  'Difficulty breathing', 'Chest pain', 'Severe bleeding', 'Unconsciousness',
];
const GENDER_OPTIONS = ['Female', 'Male', 'Other'];
const RISK_TONE = { Low: 'brand', Medium: 'amber', High: 'rose', Critical: 'critical' };
const STEP_ICON = { 'Language Detection': Languages, 'Intent Detection': Brain, 'Disease Category Classification': Tags, 'Urgency Prediction': Activity, 'Decision Engine': Workflow };

function toggle(list, item) {
  return list.includes(item) ? list.filter((i) => i !== item) : [...list, item];
}

// AI Pipeline trace, shown as a collapsible strip above the
// assessment so a citizen (or an auditor) can see exactly how the
// AI arrived at its urgency/decision, not just the final answer.
function PipelineTrace({ steps }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl border border-slate-200/70 dark:border-white/10">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-3 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-300"
      >
        <span>AI Pipeline Trace</span>
        <ChevronDown className={cn('h-3.5 w-3.5 transition-transform', open && 'rotate-180')} />
      </button>
      {open && (
        <div className="space-y-1.5 border-t border-slate-200/70 p-3 dark:border-white/10">
          {steps.map((s) => {
            const Icon = STEP_ICON[s.step] || Info;
            return (
              <div key={s.step} className="flex items-start gap-2 text-xs">
                <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-500" />
                <div>
                  <span className="font-medium text-slate-700 dark:text-slate-200">{s.step}:</span>{' '}
                  <span className="text-slate-500 dark:text-slate-400">{s.result}</span>
                  {s.detail && <p className="text-[11px] text-slate-400">{s.detail}</p>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function SymptomChecker() {
  const { user } = useAuth();
  const { submitCase, shareLocation } = useCaseContext();
  const [symptoms, setSymptoms] = useState([]);
  const [age, setAge] = useState(30);
  const [gender, setGender] = useState('Female');
  const [pipeline, setPipeline] = useState(null);
  const [nearestPHCs, setNearestPHCs] = useState([]);
  const [workflowCase, setWorkflowCase] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSharingLocation, setIsSharingLocation] = useState(false);

  const runCheck = async () => {
    setIsLoading(true);
    setWorkflowCase(null);
    setNearestPHCs([]);

    // Full pipeline: Language Detection -> Intent Detection ->
    // Disease Category Classification -> Urgency Prediction ->
    // Decision Engine (see aiPipelineApi.runPipelineFromSymptoms).
    const trace = await runPipelineFromSymptoms({ symptoms, age, gender });
    setPipeline(trace);

    const { urgencyLevel, decision, symptomCheckResult } = trace;

    if (decision.showNearestPHC) {
      const phcs = await fetchNearestPHCs(2);
      setNearestPHCs(phcs);
    }

    // High/Critical create a case through the shared workflow engine.
    // Critical additionally reaches the Health Officer immediately —
    // handled inside reportSymptomCase/submitCase, not duplicated here.
    if (decision.createsCase) {
      const record = await submitCase({
        citizenName: user?.name || 'Citizen',
        riskLevel: urgencyLevel,
        symptoms,
        disease: symptomCheckResult.possibleDiseases?.[0]?.name,
        diseaseCategory: symptomCheckResult.diseaseCategory,
        age,
        gender,
      });
      setWorkflowCase(record);
      toast.success(
        urgencyLevel === URGENCY_LEVELS.CRITICAL
          ? 'Emergency guidance provided. Share your location when ready to notify healthcare workers.'
          : `Follow-up case created — ${record.assignedAsha} will check in to confirm you visited the PHC.`
      );
    }

    setIsLoading(false);
  };

  // Only fires when the citizen explicitly taps "Share Location" —
  // never automatically. Requests browser GPS permission; if granted,
  // the coordinates are stored on the case and ASHA + the Health
  // Officer are notified immediately (see shareEmergencyLocation).
  const handleShareLocation = () => {
    if (!workflowCase) return;
    if (!('geolocation' in navigator)) {
      toast.error('Location sharing is not available on this device.');
      return;
    }
    setIsSharingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const result = await shareLocation(workflowCase.id, { lat: latitude, lng: longitude });
          setWorkflowCase(result.case);
          toast.success('Healthcare workers have been notified.');
        } finally {
          setIsSharingLocation(false);
        }
      },
      () => {
        setIsSharingLocation(false);
        toast.error('Location permission denied. Healthcare workers have not been notified yet.');
      }
    );
  };

  const result = pipeline?.symptomCheckResult;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <span className="section-eyebrow">
          <Stethoscope className="h-3.5 w-3.5" /> AI Symptom Checker
        </span>
        <h1 className="mt-2 font-display text-2xl font-semibold text-slate-900 dark:text-white">
          Check your symptoms
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Select what you're experiencing for a demo AI assessment — not a medical diagnosis.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="surface-card space-y-5 p-6 sm:p-7">
          <div>
            <p className="label-text">Symptoms</p>
            <div className="flex flex-wrap gap-2">
              {SYMPTOM_OPTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSymptoms((prev) => toggle(prev, s))}
                  className={cn(
                    'rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
                    symptoms.includes(s)
                      ? 'border-brand-500 bg-brand-500/10 text-brand-700 dark:text-brand-300'
                      : 'border-slate-200 text-slate-600 hover:border-brand-300 dark:border-white/10 dark:text-slate-300'
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="symptom-age" className="label-text">
                Age: <span className="font-semibold text-brand-600 dark:text-brand-400">{age}</span>
              </label>
              <input
                id="symptom-age"
                type="range"
                min={1}
                max={90}
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
                className="w-full accent-brand-500"
              />
            </div>
            <div>
              <p className="label-text">Gender</p>
              <div className="flex gap-1.5">
                {GENDER_OPTIONS.map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setGender(g)}
                    className={cn(
                      'flex-1 rounded-lg border px-2 py-2 text-xs font-medium transition-colors',
                      gender === g
                        ? 'border-brand-500 bg-brand-500/10 text-brand-700 dark:text-brand-300'
                        : 'border-slate-200 text-slate-600 hover:border-brand-300 dark:border-white/10 dark:text-slate-300'
                    )}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <Button
            variant="primary"
            className="w-full"
            onClick={runCheck}
            isLoading={isLoading}
            disabled={symptoms.length === 0}
          >
            {!isLoading && (
              <>
                <ClipboardList className="h-4 w-4" /> Check symptoms
              </>
            )}
            {isLoading && 'Analyzing…'}
          </Button>
          {symptoms.length === 0 && (
            <p className="text-center text-[11px] text-slate-400">Select at least one symptom to continue.</p>
          )}
        </div>

        <AnimatePresence mode="wait">
          {result ? (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="surface-card space-y-5 p-6 sm:p-7"
            >
              <div className="flex items-center justify-between">
                <p className="flex items-center gap-1.5 text-sm font-semibold text-slate-900 dark:text-white">
                  <HeartPulse className="h-4 w-4 text-brand-500" /> Demo Assessment
                </p>
                <div className="flex items-center gap-1.5">
                  <Badge tone="sky">{result.diseaseCategory}</Badge>
                  <Badge tone={RISK_TONE[result.riskLevel]}>{result.riskLevel} risk</Badge>
                </div>
              </div>

              <PipelineTrace steps={pipeline.steps} />

              <div className="rounded-xl bg-brand-50 px-3 py-2.5 text-sm font-medium text-brand-700 dark:bg-brand-500/10 dark:text-brand-300">
                {pipeline.decision.title}: {pipeline.decision.summary}
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Possible conditions</p>
                <div className="mt-2 space-y-2">
                  {result.possibleDiseases.map((d) => (
                    <div key={d.name} className="flex items-center justify-between rounded-xl border border-slate-200/70 px-3 py-2 text-sm dark:border-white/10">
                      <span className="text-slate-700 dark:text-slate-200">{d.name}</span>
                      <span className="text-xs font-medium text-slate-400">{d.likelihood}% match</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Home care tips</p>
                <ul className="mt-2 space-y-1.5">
                  {result.homeCareTips.map((tip) => (
                    <li key={tip} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-xl bg-brand-50 px-3 py-2.5 text-sm font-medium text-brand-700 dark:bg-brand-500/10 dark:text-brand-300">
                Recommended: {result.recommendedDoctor}
              </div>

              {nearestPHCs.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Nearest PHC</p>
                  {nearestPHCs.map((phc) => (
                    <div key={phc.id} className="flex items-center gap-2 rounded-xl border border-slate-200/70 px-3 py-2 text-sm dark:border-white/10">
                      <MapPin className="h-4 w-4 shrink-0 text-brand-500" />
                      <div>
                        <p className="text-slate-700 dark:text-slate-200">{phc.name}</p>
                        <p className="text-xs text-slate-400">{phc.distanceKm} km · {phc.type}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {result.emergencyWarning && (
                <div className="flex items-start gap-2 rounded-xl bg-signal-rose/10 px-3 py-2.5 text-sm text-signal-rose">
                  <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
                  {result.emergencyWarning}
                </div>
              )}

              {workflowCase && (
                <div className="rounded-xl border border-slate-200/70 p-4 dark:border-white/10">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Your case status
                  </p>
                  <CaseTimeline timeline={workflowCase.timeline} compact />

                  {workflowCase.requiresLocationShare && !workflowCase.locationShared && (
                    <div className="mt-4 rounded-xl bg-signal-rose/10 p-3">
                      <p className="text-xs text-signal-rose">
                        Share your location so your ASHA worker and the Health Officer can be notified immediately.
                      </p>
                      <Button
                        variant="primary"
                        className="mt-2 w-full"
                        onClick={handleShareLocation}
                        isLoading={isSharingLocation}
                      >
                        {!isSharingLocation && (
                          <>
                            <MapPin className="h-4 w-4" /> Share Location
                          </>
                        )}
                        {isSharingLocation && 'Sharing…'}
                      </Button>
                    </div>
                  )}
                  {workflowCase.locationShared && (
                    <p className="mt-3 text-xs font-medium text-brand-600 dark:text-brand-400">
                      Healthcare workers have been notified.
                    </p>
                  )}
                </div>
              )}

              <p className="flex items-start gap-1.5 text-[11px] leading-snug text-slate-400">
                <Info className="mt-0.5 h-3 w-3 shrink-0" />
                Demonstration only — not a medical diagnosis. Consult a healthcare professional for real concerns.
              </p>
            </motion.div>
          ) : (
            <div className="surface-card flex flex-col items-center justify-center gap-2 p-10 text-center text-sm text-slate-400">
              <Stethoscope className="h-6 w-6 text-slate-300" />
              Your results will appear here.
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
