import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { Activity, Sparkles, CheckCircle2, PackageCheck, ChevronDown, ChevronUp, MapPin } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { useCitizenCases } from '../../../contexts/CaseContext';
import Badge from '../../../components/common/Badge';
import Button from '../../../components/common/Button';
import CaseTimeline, { getCaseProgressPercent } from '../../../components/common/CaseTimeline';
import { SkeletonCard } from '../../../components/common/Skeleton';

const RISK_TONE = { Low: 'brand', Medium: 'amber', High: 'rose', Critical: 'critical' };

/**
 * Shows the citizen's own in-progress case — created automatically by
 * the AI Symptom Checker / Emergency Center — as it moves through
 * ASHA visit, Health Officer review, and pharmacy dispensing. Reads
 * from the shared CaseContext, so it updates the moment any other
 * role (ASHA, Officer, Pharmacist) acts on the case. Only renders
 * once a case exists, so it's invisible for a citizen with no active
 * reports (no empty-state clutter on the main dashboard).
 */
export default function CaseTrackerWidget() {
  const { user } = useAuth();
  const { cases, isLoading, collectCitizenMedicine, finishCase, shareLocation } = useCitizenCases(user?.name);
  const [actingId, setActingId] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [isSharingLocation, setIsSharingLocation] = useState(false);

  if (isLoading) {
    return <SkeletonCard className="h-64" />;
  }

  if (cases.length === 0) {
    return null;
  }

  const active = cases.find((c) => c.status !== 'Completed') || cases[0];
  const pastCases = cases.filter((c) => c.status === 'Completed' && c.id !== active.id);
  const progress = getCaseProgressPercent(active.timeline);

  const handleCollect = async (caseId) => {
    setActingId(caseId);
    try {
      await collectCitizenMedicine(caseId);
      toast.success('Medicine collection confirmed — recovery monitoring started.');
    } finally {
      setActingId(null);
    }
  };

  const handleShareLocation = (caseId) => {
    if (!('geolocation' in navigator)) {
      toast.error('Location sharing is not available on this device.');
      return;
    }
    setIsSharingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          await shareLocation(caseId, { lat: latitude, lng: longitude });
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

  const handleClose = async (caseId) => {
    setActingId(caseId);
    try {
      await finishCase(caseId);
      toast.success('Marked as recovered — case closed. Stay healthy!');
    } finally {
      setActingId(null);
    }
  };

  return (
    <div className="surface-card space-y-4 p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400">
            <Activity className="h-4 w-4" />
          </span>
          <p className="text-sm font-semibold text-slate-900 dark:text-white">My Case Tracker</p>
        </div>
        <Badge tone={RISK_TONE[active.riskLevel] || 'neutral'}>{active.riskLevel} risk</Badge>
      </div>

      <div className="text-xs text-slate-500 dark:text-slate-400">
        Case {active.id} · {active.patientId} · {active.disease} · {active.ward}
        {active.assignedAsha && <> · ASHA: {active.assignedAsha}</>}
        {active.assignedOfficer && <> · Officer: {active.assignedOfficer}</>}
      </div>

      <div>
        <div className="mb-1 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>Recovery Progress</span>
          <span className="font-semibold text-slate-700 dark:text-slate-200">{progress}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
          <div
            className="h-full rounded-full bg-brand-500 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {active.referralNote && (
        <div className="rounded-xl bg-brand-50 p-3 text-xs dark:bg-brand-500/10">
          <p className="flex items-center gap-1.5 font-semibold text-brand-700 dark:text-brand-300">
            <Sparkles className="h-3.5 w-3.5" /> PHC Referral Note
          </p>
          <p className="mt-1 text-slate-600 dark:text-slate-300">
            {active.referralNote.recommendedMedicines.join(', ') || 'Advisory issued'} — referred by {active.referralNote.referredBy}
          </p>
        </div>
      )}

      <CaseTimeline timeline={active.timeline} compact />

      {active.requiresLocationShare && !active.locationShared && (
        <Button
          variant="primary"
          className="w-full text-xs"
          onClick={() => handleShareLocation(active.id)}
          isLoading={isSharingLocation}
        >
          {!isSharingLocation && <MapPin className="h-3.5 w-3.5" />} Share Location
        </Button>
      )}
      {active.locationShared && (
        <p className="flex items-center gap-1.5 text-xs font-medium text-brand-600 dark:text-brand-400">
          <CheckCircle2 className="h-3.5 w-3.5" /> Healthcare workers have been notified.
        </p>
      )}

      {active.status === 'Medicine Ready' && (
        <Button
          variant="primary"
          className="w-full text-xs"
          onClick={() => handleCollect(active.id)}
          isLoading={actingId === active.id}
        >
          {actingId !== active.id && <PackageCheck className="h-3.5 w-3.5" />} Confirm Medicine Collected
        </Button>
      )}

      {active.status === 'Recovery Monitoring' && (
        <Button
          variant="primary"
          className="w-full text-xs"
          onClick={() => handleClose(active.id)}
          isLoading={actingId === active.id}
        >
          {actingId !== active.id && <CheckCircle2 className="h-3.5 w-3.5" />} Mark as Recovered / Close Case
        </Button>
      )}

      {pastCases.length > 0 && (
        <div className="border-t border-slate-200/70 pt-3 dark:border-white/10">
          <button
            type="button"
            onClick={() => setShowHistory((v) => !v)}
            className="flex w-full items-center justify-between text-xs font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
          >
            <span>{pastCases.length} past case{pastCases.length > 1 ? 's' : ''} resolved (Health History)</span>
            {showHistory ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>
          {showHistory && (
            <div className="mt-3 space-y-2">
              {pastCases.map((c) => (
                <div key={c.id} className="rounded-lg bg-slate-50 p-2.5 text-xs dark:bg-white/5">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-slate-700 dark:text-slate-200">{c.disease}</span>
                    <span className="text-slate-400">
                      {c.closedDate ? new Date(c.closedDate).toLocaleDateString() : ''}
                    </span>
                  </div>
                  {c.referralNote && (
                    <p className="mt-1 text-slate-500 dark:text-slate-400">
                      Medicine: {c.referralNote.recommendedMedicines.join(', ') || '—'}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
