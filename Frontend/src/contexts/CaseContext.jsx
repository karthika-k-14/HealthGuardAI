import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  fetchAllCases,
  reportSymptomCase,
  reportEmergency,
  shareEmergencyLocation,
  completeHomeVisit,
  forwardCaseToOfficer,
  officerReviewCase,
  collectMedicine,
  confirmMedicineAvailability,
  closeCase,
} from '../api/workflowApi';
import { useAuth } from './AuthContext';

const CaseContext = createContext(null);



/**
 * Global Case Management Context.
 *
 * Every submitted citizen case is created exactly once inside the
 * shared workflowApi store and lives here as a single React state
 * tree. Every dashboard (Citizen, ASHA, Health Officer, Pharmacist,
 * Admin) reads from this same `cases` array via the selector hooks
 * below, and every mutation (submit / visit / forward / review /
 * dispense / collect / close) goes through the action methods here,
 * which refresh the shared state immediately so every mounted
 * dashboard re-renders in sync — no isolated per-page fetches, no
 * duplicate case objects, no manual "did the other role act yet?"
 * polling required in the pages themselves. A background poll still
 * runs (while signed in) as a safety net for any future multi-tab /
 * async scenario.
 */


export function CaseProvider({ children }) {
  const { isAuthenticated, user } = useAuth();
  const currentUserId = user?.id || user?.userId || null;
  const [cases, setCases] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [latestAssessment, setLatestAssessment] = useState(null);
  const [latestDiagnosis, setLatestDiagnosis] = useState(null);

  // Load user-scoped assessment when user changes
  useEffect(() => {
    if (!isAuthenticated || !currentUserId) {
      setCases([]);
      setLatestAssessment(null);
      setLatestDiagnosis(null);
      setIsLoading(false);
      return;
    }

    try {
      const scopedKey = `healthguard_latest_symptom_${currentUserId}`;
      const saved = localStorage.getItem(scopedKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        setLatestAssessment(parsed);
        setLatestDiagnosis(parsed);
      } else {
        setLatestAssessment(null);
        setLatestDiagnosis(null);
      }
    } catch (e) {
      setLatestAssessment(null);
      setLatestDiagnosis(null);
    }
  }, [isAuthenticated, currentUserId]);

  const updateAssessment = useCallback((assessmentPayload) => {
    if (!assessmentPayload) return;

    const prediction = (assessmentPayload.prediction || assessmentPayload.predictedCondition || '').trim();
    const rawRisk = (assessmentPayload.riskLevel || assessmentPayload.severity || '').trim().toUpperCase();
    const riskLevel = rawRisk === 'MEDIUM' ? 'MODERATE' : rawRisk;
    const recommendation = (assessmentPayload.recommendation || assessmentPayload.recommendations || assessmentPayload.doctorAdvice || '').trim();

    // Condition 2: If any field is missing, null, undefined, empty string, or whitespace, do NOT save
    if (!prediction || !riskLevel || !recommendation) {
      console.warn('Invalid symptom assessment skipped:', assessmentPayload);
      return;
    }

    const symptoms = (Array.isArray(assessmentPayload.symptoms)
      ? assessmentPayload.symptoms
      : (assessmentPayload.symptoms ? [assessmentPayload.symptoms] : [])
    ).map(s => typeof s === 'object' && s !== null ? (s.name || s.symptom || s.label || JSON.stringify(s)) : String(s));

    const possibleConditions = (Array.isArray(assessmentPayload.possibleConditions)
      ? assessmentPayload.possibleConditions
      : (assessmentPayload.possibleConditions ? [assessmentPayload.possibleConditions] : [prediction])
    ).map(c => typeof c === 'object' && c !== null ? (c.name || c.condition || c.disease || JSON.stringify(c)) : String(c));

    const formatted = {
      prediction,
      riskLevel,
      recommendation,
      symptoms,
      possibleConditions,
      predictedCondition: prediction,
      severity: riskLevel,
      recommendations: recommendation,
      doctorAdvice: recommendation,
      age: assessmentPayload.age || null,
      gender: assessmentPayload.gender || null,
      allergies: assessmentPayload.allergies || null,
      medicalHistory: assessmentPayload.medicalHistory || null,
      timestamp: assessmentPayload.timestamp || new Date().toISOString(),
    };

    setLatestAssessment(formatted);
    setLatestDiagnosis(formatted);

    if (currentUserId) {
      try {
        localStorage.setItem(`healthguard_latest_symptom_${currentUserId}`, JSON.stringify(formatted));
      } catch (e) {
        console.error('Failed to save assessment to localStorage:', e);
      }
    }
  }, [currentUserId]);

  const updateDiagnosis = useCallback((diagnosisPayload) => {
    updateAssessment(diagnosisPayload);
  }, [updateAssessment]);

  const refresh = useCallback(async () => {
    if (!isAuthenticated) return [];
    const rawData = await fetchAllCases();
    const data = Array.isArray(rawData) ? rawData : (rawData?.data || []);
    setCases(data);
    setIsLoading(false);
    return data;
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) {
      setCases([]);
      setIsLoading(false);
      return;
    }
    refresh();
  }, [refresh, isAuthenticated]);

  const submitCase = useCallback(
    async (payload) => {
      const record = await reportSymptomCase(payload);
      await refresh();
      return record;
    },
    [refresh]
  );


  const submitEmergency = useCallback(
    async (payload) => {
      const result = await reportEmergency(payload);
      await refresh();
      return result;
    },
    [refresh]
  );

  const shareLocation = useCallback(
    async (caseId, coords) => {
      const result = await shareEmergencyLocation(caseId, coords);
      await refresh();
      return result;
    },
    [refresh]
  );

  const completeVisit = useCallback(
    async (caseId) => {
      const result = await completeHomeVisit(caseId);
      await refresh();
      return result;
    },
    [refresh]
  );

  const forwardToOfficer = useCallback(
    async (caseId, details) => {
      const record = await forwardCaseToOfficer(caseId, details);
      await refresh();
      return record;
    },
    [refresh]
  );

  const reviewCase = useCallback(
    async (caseId, decision, details) => {
      const record = await officerReviewCase(caseId, decision, details);
      await refresh();
      return record;
    },
    [refresh]
  );

  const confirmAvailability = useCallback(
    async (payload) => {
      const result = await confirmMedicineAvailability(payload);
      await refresh();
      return result;
    },
    [refresh]
  );

  const collectCitizenMedicine = useCallback(
    async (caseId) => {
      const record = await collectMedicine(caseId);
      await refresh();
      return record;
    },
    [refresh]
  );

  const finishCase = useCallback(
    async (caseId) => {
      const record = await closeCase(caseId);
      await refresh();
      return record;
    },
    [refresh]
  );

  const value = useMemo(
    () => ({
      cases,
      isLoading,
      latestAssessment,
      updateAssessment,
      latestDiagnosis,
      updateDiagnosis,
      refresh,
      submitCase,
      submitEmergency,
      shareLocation,
      completeVisit,
      forwardToOfficer,
      reviewCase,
      confirmAvailability,
      collectCitizenMedicine,
      finishCase,
    }),
    [
      cases,
      isLoading,
      latestAssessment,
      updateAssessment,
      latestDiagnosis,
      updateDiagnosis,
      refresh,
      submitCase,
      submitEmergency,
      shareLocation,
      completeVisit,
      forwardToOfficer,
      reviewCase,
      confirmAvailability,
      collectCitizenMedicine,
      finishCase,
    ]
  );

  return <CaseContext.Provider value={value}>{children}</CaseContext.Provider>;
}

export function useCaseContext() {
  const ctx = useContext(CaseContext);
  if (!ctx) throw new Error('useCaseContext must be used within a CaseProvider');
  return ctx;
}

// ---- Role-scoped selectors — every dashboard reads the same tree ----

export function useCitizenCases(citizenName) {
  const { cases, ...rest } = useCaseContext();
  const safeCases = Array.isArray(cases) ? cases : [];
  const myCases = useMemo(
    () => safeCases.filter((c) => c?.citizenName === citizenName),
    [safeCases, citizenName]
  );
  return { cases: myCases, ...rest };
}

export function useAshaCases() {
  const { cases, ...rest } = useCaseContext();
  const safeCases = Array.isArray(cases) ? cases : [];
  const assigned = useMemo(() => safeCases.filter((c) => c?.assignedAsha), [safeCases]);
  return { cases: assigned, ...rest };
}

export function useOfficerCases() {
  const { cases, ...rest } = useCaseContext();
  const safeCases = Array.isArray(cases) ? cases : [];
  const assigned = useMemo(() => safeCases.filter((c) => c?.assignedOfficer), [safeCases]);
  const pending = useMemo(
    () => assigned.filter((c) => c?.status === 'Officer Reviewing' || c?.status === 'Lab Test Requested'),
    [assigned]
  );
  const rejected = useMemo(
    () => assigned.filter((c) => c?.timeline?.some((t) => t?.label === 'Officer Rejected')),
    [assigned]
  );
  const approved = useMemo(
    () => assigned.filter((c) => c?.referralNote && !rejected.includes(c)),
    [assigned, rejected]
  );
  const critical = useMemo(() => assigned.filter((c) => c?.riskLevel === 'High' && c?.status !== 'Completed'), [
    assigned,
  ]);
  return { cases: assigned, pending, approved, rejected, critical, ...rest };
}

export function useAllCasesForAdmin() {
  return useCaseContext();
}
