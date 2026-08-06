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

const POLL_INTERVAL_MS = 6000;

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
  const { isAuthenticated } = useAuth();
  const [cases, setCases] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    const data = await fetchAllCases();
    setCases(data);
    setIsLoading(false);
    return data;
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      setCases([]);
      setIsLoading(true);
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
  const myCases = useMemo(
    () => cases.filter((c) => c.citizenName === citizenName),
    [cases, citizenName]
  );
  return { cases: myCases, ...rest };
}

export function useAshaCases() {
  const { cases, ...rest } = useCaseContext();
  const assigned = useMemo(() => cases.filter((c) => c.assignedAsha), [cases]);
  return { cases: assigned, ...rest };
}

export function useOfficerCases() {
  const { cases, ...rest } = useCaseContext();
  const assigned = useMemo(() => cases.filter((c) => c.assignedOfficer), [cases]);
  const pending = useMemo(
    () => assigned.filter((c) => c.status === 'Officer Reviewing' || c.status === 'Lab Test Requested'),
    [assigned]
  );
  const rejected = useMemo(
    () => assigned.filter((c) => c.timeline.some((t) => t.label === 'Officer Rejected')),
    [assigned]
  );
  const approved = useMemo(
    () => assigned.filter((c) => c.referralNote && !rejected.includes(c)),
    [assigned, rejected]
  );
  const critical = useMemo(() => assigned.filter((c) => c.riskLevel === 'High' && c.status !== 'Completed'), [
    assigned,
  ]);
  return { cases: assigned, pending, approved, rejected, critical, ...rest };
}

export function useAllCasesForAdmin() {
  return useCaseContext();
}
