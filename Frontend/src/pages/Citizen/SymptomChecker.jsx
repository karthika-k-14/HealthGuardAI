import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  Stethoscope,
  HeartPulse,
  MapPin,
  Utensils,
  Send,
  RefreshCw,
  CheckCircle2,
  Shield,
  Activity
} from 'lucide-react';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import { assessSymptoms } from '../../api/symptomApi';
import { createEmergencyAlert, analyzeSymptomUrgency } from '../../api/emergencyApi';
import { fetchNearestPHCs } from '../../api/hospitalApi';
import { useCaseContext } from '../../contexts/CaseContext';
import { useAuth } from '../../contexts/AuthContext';
import { PATHS } from '../../constants/routes';
import { cn } from '../../utils/cn';
import { isValidSymptomAssessment } from '../../utils/assessmentUtils';

const QUICK_SYMPTOM_PRESETS = [
  'Fever, chills, right leg swelling, tender swelling',
  'Chest pain, shortness of breath, dizziness',
  'High fever, headache, body pain for 3 days',
  'Severe cough, sore throat, fatigue',
  'Stomach pain, nausea, diarrhea since yesterday',
];

const COMMON_SYMPTOMS = [
  'Fever', 'Chills', 'Leg Swelling', 'Tender Swelling', 'Chest Pain',
  'Breathing Difficulty', 'Headache', 'Cough', 'Sore Throat', 'Fatigue',
  'Nausea', 'Vomiting', 'Diarrhea', 'Abdominal Pain', 'Rash'
];

export default function SymptomChecker() {
  const { user } = useAuth();
  const { submitCase, updateAssessment, updateDiagnosis } = useCaseContext();

  const [inputMessage, setInputMessage] = useState('');
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [isAssessing, setIsAssessing] = useState(false);
  const [assessmentResult, setAssessmentResult] = useState(null);
  const [isComplete, setIsComplete] = useState(false);
  const [, setWorkflowCase] = useState(null);
  const [nearestPHCs, setNearestPHCs] = useState([]);

  // Submit symptom text or selected symptoms to Backend AI Microservice
  const handleProcessInput = async (textToProcess = '') => {
    const query = textToProcess || inputMessage.trim() || selectedSymptoms.join(', ');
    if (!query || !query.trim()) {
      toast.error('Please enter or select your symptoms to check.');
      return;
    }

    setIsAssessing(true);
    setInputMessage('');

    // Add User Message to conversation history
    const userMsg = { id: `u_${Date.now()}`, role: 'user', content: query };
    setChatMessages((prev) => [...prev, userMsg]);

    // Call backend real AI assessment: POST /api/ai/symptoms
    let backendAssessment = await assessSymptoms({
      userId: user?.id || 1,
      symptoms: query
    });

    const isValid = Boolean(
      backendAssessment &&
      backendAssessment.prediction &&
      typeof backendAssessment.prediction === 'string' &&
      backendAssessment.prediction.trim() &&
      backendAssessment.riskLevel &&
      typeof backendAssessment.riskLevel === 'string' &&
      backendAssessment.riskLevel.trim() &&
      backendAssessment.recommendation &&
      typeof backendAssessment.recommendation === 'string' &&
      backendAssessment.recommendation.trim()
    );

    if (isValid) {
      // Step 1: Run Backend Urgency Classification Engine
      let calculatedUrgency = 'LOW';
      let urgencyScore = 0.2;
      let urgencyResult = null;
      try {
        urgencyResult = await analyzeSymptomUrgency({
          symptoms: query,
          diseaseCategory: backendAssessment.prediction.trim(),
          urgencyScore: backendAssessment.riskLevel === 'CRITICAL' || backendAssessment.riskLevel === 'EMERGENCY' ? 0.95 : backendAssessment.riskLevel === 'HIGH' ? 0.75 : 0.45
        });
        if (urgencyResult?.urgencyLevel) {
          calculatedUrgency = urgencyResult.urgencyLevel;
          urgencyScore = urgencyResult.urgencyScore || 0.75;
        }
      } catch (e) {
        console.warn('Backend urgency analysis fallback:', e);
      }

      if (calculatedUrgency === 'LOW' && (backendAssessment.riskLevel === 'CRITICAL' || backendAssessment.riskLevel === 'EMERGENCY')) {
        calculatedUrgency = 'CRITICAL';
        urgencyScore = 0.95;
      } else if (calculatedUrgency === 'LOW' && backendAssessment.riskLevel === 'HIGH') {
        calculatedUrgency = 'HIGH';
        urgencyScore = 0.75;
      }

      let createdAlert = null;
      if (calculatedUrgency === 'HIGH' || calculatedUrgency === 'CRITICAL') {
        try {
          createdAlert = await createEmergencyAlert({
            citizenId: user?.id || user?.userId,
            citizenName: user?.name || user?.fullName || 'Citizen',
            symptoms: query,
            diseaseCategory: backendAssessment.prediction.trim(),
            urgencyLevel: calculatedUrgency,
            urgencyScore: urgencyScore,
            village: user?.village || user?.citizenProfile?.village || '',
            district: user?.district || 'Coimbatore',
            notes: `Auto-escalated from Symptom Checker. AI Prediction: ${backendAssessment.prediction.trim()}.`
          });
        } catch (alertErr) {
          console.error('Failed to create emergency alert:', alertErr);
        }
      }

      const finalAssessment = {
        symptomSummary: backendAssessment.symptoms || query,
        severity: backendAssessment.riskLevel.trim(),
        riskLevel: backendAssessment.riskLevel.trim(),
        urgencyLevel: calculatedUrgency,
        urgencyScore: urgencyScore,
        emergencyAlert: createdAlert,
        prediction: backendAssessment.prediction.trim(),
        possibleConditions: [{ name: backendAssessment.prediction.trim() }],
        recommendation: backendAssessment.recommendation.trim(),
        recommendations: backendAssessment.recommendation.trim(),
        doctorAdvice: backendAssessment.recommendation.trim(),
        timestamp: backendAssessment.createdAt || new Date().toISOString(),
      };

      setAssessmentResult(finalAssessment);
      setIsComplete(true);

      // Save to global CaseContext for AI Nutrition Planner separately from chat messages
      const saveFn = updateAssessment || updateDiagnosis;
      if (saveFn) {
        saveFn(finalAssessment);
      }

      // Assistant Message: Final Clinical Assessment Announcement
      const assistantMsg = {
        id: `a_${Date.now()}`,
        role: 'assistant',
        content: `Clinical triage assessment completed based on your reported symptoms (${finalAssessment.symptomSummary}). Urgency classified as ${calculatedUrgency}.`,
        isFinal: true,
      };
      setChatMessages((prev) => [...prev, assistantMsg]);

      // If HIGH or CRITICAL urgency, notify citizen and fetch nearest PHCs
      if (calculatedUrgency === 'CRITICAL') {
        fetchNearestPHCs(3).then(setNearestPHCs);
        toast.error('Critical condition detected. HealthGuard AI has automatically escalated your case for immediate medical attention.', { duration: 6000 });
      } else if (calculatedUrgency === 'HIGH') {
        fetchNearestPHCs(2).then(setNearestPHCs);
        toast.success('High urgency condition detected. Your assigned ASHA Worker has been informed.', { duration: 5000 });
      } else if (calculatedUrgency === 'MEDIUM') {
        fetchNearestPHCs(2).then(setNearestPHCs);
      }
    } else {
      toast.error('AI service unavailable. Please try again later.');
      const assistantMsg = {
        id: `a_${Date.now()}`,
        role: 'assistant',
        content: 'AI service unavailable. Please try again later.',
        isFinal: true,
      };
      setChatMessages((prev) => [...prev, assistantMsg]);
    }

    setIsAssessing(false);
  };

  // Requirement 9: Explicit Start New Assessment
  const handleStartNewAssessment = () => {
    setAssessmentResult(null);
    setIsComplete(false);
    setChatMessages([]);
    setSelectedSymptoms([]);
    setInputMessage('');
    setWorkflowCase(null);
    setNearestPHCs([]);
    toast.success('Started a new symptom assessment session.');
  };


  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-12">
      {/* Header Banner */}
      <div className="surface-card p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="section-eyebrow">
            <Stethoscope className="h-3.5 w-3.5 text-brand-500" /> Clinical Triage Intelligence
          </span>
          <h1 className="mt-2 font-display text-2xl font-semibold text-slate-900 dark:text-white sm:text-3xl">
            Symptom Assessment Assistant
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Stateful multi-symptom triage. Memory is maintained throughout your session.
          </p>
        </div>

        <button
          type="button"
          onClick={handleStartNewAssessment}
          className="btn-secondary text-xs flex items-center gap-1.5 shrink-0 cursor-pointer"
        >
          <RefreshCw className="h-3.5 w-3.5 text-brand-500" />
          <span>Start New Assessment</span>
        </button>
      </div>

      {/* Main Grid: Input / Conversation + Assessment Results */}
      <div className="space-y-6">
        {/* Quick Test Presets (Requirement 8) */}
        <div className="surface-card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Activity className="h-3.5 w-3.5 text-brand-500" /> Quick Preset Clinical Inputs (Click to test instant assessment):
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {QUICK_SYMPTOM_PRESETS.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleProcessInput(preset)}
                disabled={isAssessing || isComplete}
                className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:border-brand-500 hover:bg-brand-500/5 dark:border-white/10 dark:bg-surface-darkcard dark:text-slate-300 transition-all cursor-pointer disabled:opacity-50"
              >
                &quot;{preset}&quot;
              </button>
            ))}
          </div>
        </div>

        {/* Symptom Input & Chat History Card */}
        <div className="surface-card p-6 space-y-5">
          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Select or type your symptoms:
            </p>
            <div className="flex flex-wrap gap-1.5">
              {COMMON_SYMPTOMS.map((sym) => {
                const isSelected = selectedSymptoms.includes(sym);
                return (
                  <button
                    key={sym}
                    type="button"
                    disabled={isComplete}
                    onClick={() => {
                      if (isSelected) {
                        setSelectedSymptoms((prev) => prev.filter((s) => s !== sym));
                      } else {
                        setSelectedSymptoms((prev) => [...prev, sym]);
                      }
                    }}
                    className={cn(
                      'rounded-full border px-3 py-1 text-xs font-medium transition-colors cursor-pointer disabled:opacity-60',
                      isSelected
                        ? 'border-brand-500 bg-brand-500/15 text-brand-700 dark:text-brand-300 font-bold ring-1 ring-brand-500/20'
                        : 'border-slate-200 text-slate-600 hover:border-brand-400 dark:border-white/10 dark:text-slate-300'
                    )}
                  >
                    {isSelected ? '✓ ' : '+ '}{sym}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Textarea & Submit */}
          {!isComplete && (
            <div className="space-y-3 pt-2">
              <div className="relative">
                <textarea
                  rows={3}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Describe what you are experiencing (e.g. 'Fever, chills, right leg swelling, tender swelling')..."
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 p-4 text-xs font-medium text-slate-900 placeholder-slate-400 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-white/10 dark:bg-white/[0.02] dark:text-white dark:focus:bg-surface-darkcard"
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  {selectedSymptoms.length > 0 ? `Selected symptoms: ${selectedSymptoms.join(', ')}` : 'AI Triage Session Active'}
                </span>
                <Button
                  variant="primary"
                  onClick={() => handleProcessInput()}
                  isLoading={isAssessing}
                  disabled={!inputMessage.trim() && selectedSymptoms.length === 0}
                  className="px-6 text-xs font-bold"
                >
                  <Send className="h-3.5 w-3.5" /> Evaluate Symptoms
                </Button>
              </div>
            </div>
          )}

          {/* Conversation History / Follow-Up Q&A Stream */}
          {chatMessages.length > 0 && (
            <div className="mt-4 border-t border-slate-200/60 pt-4 dark:border-white/10 space-y-3">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Triage Conversation Log</p>
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {chatMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={cn(
                      'rounded-2xl p-3.5 text-xs font-medium max-w-[85%]',
                      msg.role === 'user'
                        ? 'ml-auto bg-brand-600 text-white rounded-br-none'
                        : 'bg-slate-100 dark:bg-white/10 text-slate-800 dark:text-slate-200 rounded-bl-none border border-slate-200/60 dark:border-white/10'
                    )}
                  >
                    <p className="leading-relaxed">{msg.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Requirement 6, 7 & 12: Final Clinical Assessment Result Card */}
        <AnimatePresence>
          {isComplete && assessmentResult && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="surface-card p-6 sm:p-8 space-y-6 border-l-4 border-l-brand-500 shadow-xl"
            >
              {/* Header Badge */}
              <div className="flex items-center justify-between flex-wrap gap-4 pb-4 border-b border-slate-200/60 dark:border-white/10">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-brand-500" />
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    Clinical Triage Evaluation Complete
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-400">Urgency Level:</span>
                  {assessmentResult.urgencyLevel === 'LOW' && <Badge tone="brand">LOW</Badge>}
                  {assessmentResult.urgencyLevel === 'MEDIUM' && <Badge tone="sky">MEDIUM</Badge>}
                  {assessmentResult.urgencyLevel === 'HIGH' && <Badge tone="rose">HIGH</Badge>}
                  {assessmentResult.urgencyLevel === 'CRITICAL' && <Badge tone="critical">CRITICAL</Badge>}
                </div>
              </div>

              {/* Automated AI Escalation Status Banner */}
              {assessmentResult.urgencyLevel === 'CRITICAL' && (
                <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-rose-700 dark:text-rose-300 space-y-1">
                  <div className="flex items-center gap-2 font-bold text-sm text-rose-600 dark:text-rose-400">
                    <HeartPulse className="h-5 w-5 animate-pulse" />
                    <span>🚨 Critical Condition Detected</span>
                  </div>
                  <p className="text-xs leading-relaxed font-medium">
                    HealthGuard AI has automatically escalated your case for immediate medical attention. Your assigned ASHA Worker and Health Authorities have been alerted.
                  </p>
                </div>
              )}
              {assessmentResult.urgencyLevel === 'HIGH' && (
                <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-amber-800 dark:text-amber-200 space-y-1">
                  <div className="flex items-center gap-2 font-bold text-sm text-amber-600 dark:text-amber-400">
                    <Activity className="h-5 w-5" />
                    <span>⚠️ High Urgency Condition Detected</span>
                  </div>
                  <p className="text-xs leading-relaxed font-medium">
                    Your assigned ASHA Worker has been informed and an automated emergency case has been created for priority evaluation.
                  </p>
                </div>
              )}
              {assessmentResult.urgencyLevel === 'MEDIUM' && (
                <div className="rounded-xl border border-sky-500/30 bg-sky-500/10 p-4 text-sky-800 dark:text-sky-200 space-y-1">
                  <p className="text-xs leading-relaxed font-medium">
                    <strong>Moderate Condition:</strong> Outpatient consultation at a Primary Health Centre (PHC) is recommended. Review the clinical guidance and nearby PHCs below.
                  </p>
                </div>
              )}
              {assessmentResult.urgencyLevel === 'LOW' && (
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-800 dark:text-emerald-200 space-y-1">
                  <p className="text-xs leading-relaxed font-medium">
                    <strong>Mild Condition:</strong> No emergency alert required. Follow the self-care recommendations and hydration guidance below.
                  </p>
                </div>
              )}

              {/* Requirement 6: Clinical Details Grid */}
              <div className="grid gap-4 md:grid-cols-2 text-xs">
                {/* Symptom Summary */}
                <div className="rounded-xl bg-slate-50 dark:bg-white/[0.02] p-4 border border-slate-200/60 dark:border-white/10 space-y-2">
                  <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Stethoscope className="h-4 w-4 text-brand-500" /> Symptom Summary:
                  </span>
                  <p className="text-slate-700 dark:text-slate-300 font-semibold text-sm">
                    {assessmentResult.symptomSummary}
                  </p>
                  {assessmentResult.bodyPartsSummary !== 'Not specified' && (
                    <p className="text-slate-500 text-[11px]">Affected Areas: {assessmentResult.bodyPartsSummary}</p>
                  )}
                </div>

                {/* Possible Conditions */}
                <div className="rounded-xl bg-slate-50 dark:bg-white/[0.02] p-4 border border-slate-200/60 dark:border-white/10 space-y-2">
                  <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Shield className="h-4 w-4 text-emerald-500" /> Possible Conditions:
                  </span>
                  <div className="space-y-1">
                    {assessmentResult.possibleConditions.map((cond, idx) => (
                      <div key={idx} className="flex items-center justify-between text-slate-700 dark:text-slate-300 font-semibold">
                        <span>• {cond.name}</span>
                        {cond.likelihood && <span className="font-mono text-brand-600 dark:text-brand-400">{cond.likelihood} Match</span>}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recommendations */}
                <div className="rounded-xl bg-slate-50 dark:bg-white/[0.02] p-4 border border-slate-200/60 dark:border-white/10 space-y-2">
                  <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <HeartPulse className="h-4 w-4 text-brand-500" /> Clinical Recommendations:
                  </span>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                    {assessmentResult.recommendations}
                  </p>
                </div>

                {/* Doctor Consultation Advice */}
                <div className="rounded-xl bg-slate-50 dark:bg-white/[0.02] p-4 border border-slate-200/60 dark:border-white/10 space-y-2">
                  <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Activity className="h-4 w-4 text-indigo-500" /> Doctor Consultation Advice:
                  </span>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                    {assessmentResult.doctorAdvice}
                  </p>
                </div>
              </div>

              {/* Nearest PHCs / Emergency Info */}
              {nearestPHCs.length > 0 && (
                <div className="space-y-3 pt-2">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Nearest Primary Health Centres</p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {nearestPHCs.map((phc) => (
                      <div key={phc.id} className="flex items-center justify-between rounded-xl border border-slate-200/70 p-3 text-xs dark:border-white/10">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-brand-500 shrink-0" />
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white">{phc.name}</p>
                            <p className="text-slate-400">{phc.distanceKm} km · {phc.type}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Requirement 12 & 9: Bottom Actions */}
              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                {isValidSymptomAssessment(assessmentResult) && (
                  <Link
                    to={PATHS.CITIZEN_NUTRITION_PLANNER}
                    className="btn-primary flex-1 flex items-center justify-center gap-2 py-3 text-xs font-bold shadow-lg shadow-brand-500/20"
                  >
                    <Utensils className="h-4 w-4" />
                    <span>Generate Nutrition Plan</span>
                  </Link>
                )}

                <button
                  type="button"
                  onClick={handleStartNewAssessment}
                  className="btn-secondary flex-1 flex items-center justify-center gap-2 py-3 text-xs font-bold cursor-pointer"
                >
                  <RefreshCw className="h-4 w-4 text-brand-500" />
                  <span>Start New Assessment</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
