import React, { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import {
  ClipboardList,
  Stethoscope,
  Check,
  X,
  HelpCircle,
  Sparkles,
  TriangleAlert,
  FlaskConical,
  Building2,
  CircleCheckBig,
  MapPinned,
} from 'lucide-react';
import { useOfficerCases } from '../../contexts/CaseContext';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import CaseTimeline from '../../components/common/CaseTimeline';
import { SkeletonGrid } from '../../components/common/Skeleton';

const RISK_TONE = { Low: 'brand', Medium: 'amber', High: 'rose', Critical: 'critical' };

export default function CaseReviews() {
  const { cases, pending, approved, rejected, critical, isLoading, reviewCase, finishCase } = useOfficerCases();
  const [drafts, setDrafts] = useState({});
  const [actingId, setActingId] = useState(null);

  const updateDraft = (caseId, field, value) => {
    setDrafts((prev) => ({ ...prev, [caseId]: { ...prev[caseId], [field]: value } }));
  };

  const handleDecision = async (caseId, decision) => {
    const draft = drafts[caseId] || {};
    setActingId(`${caseId}:${decision}`);
    try {
      const medicines = draft.medicines
        ? draft.medicines.split(',').map((m) => m.trim()).filter(Boolean)
        : [];
      await reviewCase(caseId, decision, {
        medicines,
        note: draft.note || '',
        hospitalName: draft.hospitalName || '',
      });
      const messages = {
        approve: 'Prescription generated and sent to the Pharmacist.',
        reject: 'Case reviewed — no medication needed. Case closed.',
        more_info: 'Sent back to the ASHA worker for more information.',
        lab_test: 'Lab test requested — case stays open pending results.',
        refer_hospital: 'Citizen referred to hospital. Local case closed.',
      };
      toast.success(messages[decision]);
    } finally {
      setActingId(null);
    }
  };

  const handleClose = async (caseId) => {
    setActingId(`${caseId}:close`);
    try {
      await finishCase(caseId);
      toast.success('Case closed.');
    } finally {
      setActingId(null);
    }
  };

  const villageStats = useMemo(() => {
    const byVillage = {};
    cases.forEach((c) => {
      if (!byVillage[c.ward]) byVillage[c.ward] = { total: 0, critical: 0 };
      byVillage[c.ward].total += 1;
      if (c.riskLevel === 'High') byVillage[c.ward].critical += 1;
    });
    return Object.entries(byVillage)
      .map(([ward, stats]) => ({ ward, ...stats }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  }, [cases]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-slate-900 dark:text-white">Case Reviews</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Cases forwarded by ASHA workers after a home visit, awaiting clinical review.
        </p>
      </div>

      {isLoading && <SkeletonGrid count={3} className="grid gap-5 lg:grid-cols-2" />}

      {!isLoading && cases.length === 0 && (
        <div className="surface-card flex flex-col items-center justify-center gap-2 p-10 text-center">
          <ClipboardList className="h-8 w-8 text-slate-300 dark:text-white/20" />
          <p className="text-sm font-medium text-slate-600 dark:text-slate-300">No forwarded cases yet</p>
          <p className="text-xs text-slate-400">
            Cases will appear here once an ASHA worker completes a home visit and forwards it for review.
          </p>
        </div>
      )}

      {!isLoading && cases.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="surface-card flex items-center gap-3 p-4">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-300">
              <ClipboardList className="h-4 w-4" />
            </span>
            <div>
              <p className="font-display text-lg font-semibold text-slate-900 dark:text-white">{pending.length}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Pending Reviews</p>
            </div>
          </div>
          <div className="surface-card flex items-center gap-3 p-4">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400">
              <CircleCheckBig className="h-4 w-4" />
            </span>
            <div>
              <p className="font-display text-lg font-semibold text-slate-900 dark:text-white">{approved.length}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Approved Cases</p>
            </div>
          </div>
          <div className="surface-card flex items-center gap-3 p-4">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-500/10 text-slate-600 dark:text-slate-300">
              <X className="h-4 w-4" />
            </span>
            <div>
              <p className="font-display text-lg font-semibold text-slate-900 dark:text-white">{rejected.length}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Rejected Cases</p>
            </div>
          </div>
          <div className="surface-card flex items-center gap-3 p-4">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-signal-rose/10 text-signal-rose">
              <TriangleAlert className="h-4 w-4" />
            </span>
            <div>
              <p className="font-display text-lg font-semibold text-slate-900 dark:text-white">{critical.length}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Critical Alerts</p>
            </div>
          </div>
        </div>
      )}

      {villageStats.length > 0 && (
        <div className="surface-card p-5">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400">
              <MapPinned className="h-4 w-4" />
            </span>
            <p className="text-sm font-semibold text-slate-900 dark:text-white">Village Analytics</p>
          </div>
          <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
            {villageStats.map((v) => (
              <div key={v.ward} className="rounded-lg bg-slate-50 p-2.5 text-xs dark:bg-white/5">
                <p className="font-medium text-slate-700 dark:text-slate-200">{v.ward}</p>
                <p className="mt-0.5 text-slate-500 dark:text-slate-400">
                  {v.total} case{v.total > 1 ? 's' : ''}{v.critical > 0 ? ` · ${v.critical} critical` : ''}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {pending.length > 0 && (
        <div>
          <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
            Awaiting Review ({pending.length})
          </p>
          <div className="grid gap-5 lg:grid-cols-2">
            {pending.map((c) => (
              <div key={c.id} className="surface-card space-y-4 p-5">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400">
                      <Stethoscope className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">{c.citizenName}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {c.patientId} · {c.disease} · {c.ward}
                      </p>
                    </div>
                  </div>
                  <Badge tone={RISK_TONE[c.riskLevel] || 'neutral'}>{c.riskLevel} risk</Badge>
                </div>

                <div className="rounded-xl bg-slate-50 p-3 text-xs dark:bg-white/5">
                  <p className="font-semibold uppercase tracking-wide text-slate-400">AI Report</p>
                  <p className="mt-1 text-slate-600 dark:text-slate-300">
                    Symptoms: {(c.symptoms || []).join(', ') || '—'}
                  </p>
                  <p className="mt-1 text-slate-500 dark:text-slate-400">
                    Age: {c.age ?? '—'} · Gender: {c.gender ?? '—'} · Priority: {c.priority}
                  </p>
                </div>

                {(c.vitals?.bp || c.vitals?.sugar || c.vitals?.temp || c.vitals?.pulse) && (
                  <div className="grid grid-cols-4 gap-2 text-center text-xs">
                    <div className="rounded-lg bg-slate-50 p-2 dark:bg-white/5">
                      <p className="text-slate-400">BP</p>
                      <p className="font-medium text-slate-700 dark:text-slate-200">{c.vitals.bp || '—'}</p>
                    </div>
                    <div className="rounded-lg bg-slate-50 p-2 dark:bg-white/5">
                      <p className="text-slate-400">Sugar</p>
                      <p className="font-medium text-slate-700 dark:text-slate-200">{c.vitals.sugar || '—'}</p>
                    </div>
                    <div className="rounded-lg bg-slate-50 p-2 dark:bg-white/5">
                      <p className="text-slate-400">Temp</p>
                      <p className="font-medium text-slate-700 dark:text-slate-200">{c.vitals.temp || '—'}</p>
                    </div>
                    <div className="rounded-lg bg-slate-50 p-2 dark:bg-white/5">
                      <p className="text-slate-400">Pulse</p>
                      <p className="font-medium text-slate-700 dark:text-slate-200">{c.vitals.pulse || '—'}</p>
                    </div>
                  </div>
                )}

                {c.visitNotes && (
                  <div className="rounded-xl bg-brand-50 p-3 text-xs dark:bg-brand-500/10">
                    <p className="font-semibold uppercase tracking-wide text-brand-700 dark:text-brand-300">
                      ASHA Visit Notes
                    </p>
                    <p className="mt-1 text-slate-600 dark:text-slate-300">{c.visitNotes}</p>
                  </div>
                )}

                <CaseTimeline timeline={c.timeline} compact />

                <div className="space-y-2 border-t border-slate-200/70 pt-3 dark:border-white/10">
                  <input
                    placeholder="Medicines to prescribe (comma-separated)"
                    className="input-field w-full text-xs"
                    value={drafts[c.id]?.medicines || ''}
                    onChange={(e) => updateDraft(c.id, 'medicines', e.target.value)}
                  />
                  <input
                    placeholder="Hospital name (for referral)"
                    className="input-field w-full text-xs"
                    value={drafts[c.id]?.hospitalName || ''}
                    onChange={(e) => updateDraft(c.id, 'hospitalName', e.target.value)}
                  />
                  <textarea
                    placeholder="Note (visible to citizen / ASHA depending on decision)"
                    rows={2}
                    className="input-field w-full text-xs"
                    value={drafts[c.id]?.note || ''}
                    onChange={(e) => updateDraft(c.id, 'note', e.target.value)}
                  />
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="primary"
                      className="flex-1 text-xs"
                      onClick={() => handleDecision(c.id, 'approve')}
                      isLoading={actingId === `${c.id}:approve`}
                    >
                      {actingId !== `${c.id}:approve` && <Check className="h-3.5 w-3.5" />} Approve & Prescribe
                    </Button>
                    <Button
                      variant="secondary"
                      className="flex-1 text-xs"
                      onClick={() => handleDecision(c.id, 'reject')}
                      isLoading={actingId === `${c.id}:reject`}
                    >
                      {actingId !== `${c.id}:reject` && <X className="h-3.5 w-3.5" />} Reject
                    </Button>
                    <Button
                      variant="ghost"
                      className="flex-1 text-xs"
                      onClick={() => handleDecision(c.id, 'more_info')}
                      isLoading={actingId === `${c.id}:more_info`}
                    >
                      {actingId !== `${c.id}:more_info` && <HelpCircle className="h-3.5 w-3.5" />} More Info
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="ghost"
                      className="flex-1 text-xs"
                      onClick={() => handleDecision(c.id, 'lab_test')}
                      isLoading={actingId === `${c.id}:lab_test`}
                    >
                      {actingId !== `${c.id}:lab_test` && <FlaskConical className="h-3.5 w-3.5" />} Request Lab Test
                    </Button>
                    <Button
                      variant="ghost"
                      className="flex-1 text-xs"
                      onClick={() => handleDecision(c.id, 'refer_hospital')}
                      isLoading={actingId === `${c.id}:refer_hospital`}
                    >
                      {actingId !== `${c.id}:refer_hospital` && <Building2 className="h-3.5 w-3.5" />} Refer Hospital
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {(approved.length > 0 || rejected.length > 0) && (
        <div>
          <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
            Reviewed ({approved.length + rejected.length})
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[...approved, ...rejected].map((c) => (
              <div key={c.id} className="surface-card p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{c.citizenName}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{c.disease} · {c.ward}</p>
                  </div>
                  <Badge tone={RISK_TONE[c.riskLevel] || 'neutral'}>{c.status}</Badge>
                </div>
                {c.referralNote && (
                  <p className="mt-2 flex items-center gap-1.5 text-xs text-brand-600 dark:text-brand-400">
                    <Sparkles className="h-3.5 w-3.5" /> {c.referralNote.recommendedMedicines.join(', ') || 'Advisory issued'}
                  </p>
                )}
                <div className="mt-3">
                  <CaseTimeline timeline={c.timeline} compact />
                </div>
                {c.status !== 'Completed' && (
                  <Button
                    variant="secondary"
                    className="mt-3 w-full text-xs"
                    onClick={() => handleClose(c.id)}
                    isLoading={actingId === `${c.id}:close`}
                  >
                    Close Case
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
