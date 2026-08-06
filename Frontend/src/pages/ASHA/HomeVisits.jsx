import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { CalendarCheck, CalendarClock, CheckCircle2, RotateCw, UserPlus, Send, TriangleAlert } from 'lucide-react';
import { fetchVisits } from '../../api/ashaApi';
import { useAshaCases } from '../../contexts/CaseContext';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import CaseTimeline from '../../components/common/CaseTimeline';
import { SkeletonGrid } from '../../components/common/Skeleton';

const RISK_TONE = { Low: 'brand', Medium: 'amber', High: 'rose', Critical: 'critical' };

export default function HomeVisits() {
  const { cases, isLoading, completeVisit, forwardToOfficer } = useAshaCases();
  const [visits, setVisits] = useState(null);
  const [completingId, setCompletingId] = useState(null);
  const [forwardingId, setForwardingId] = useState(null);
  const [drafts, setDrafts] = useState({});

  const updateDraft = (caseId, field, value) => {
    setDrafts((prev) => ({ ...prev, [caseId]: { ...prev[caseId], [field]: value } }));
  };

  useEffect(() => {
    let mounted = true;
    fetchVisits().then((data) => {
      if (mounted) setVisits(data);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const assignedCases = cases.filter((c) => c.status !== 'Completed');
  const criticalCount = assignedCases.filter((c) => c.riskLevel === 'High').length;

  const handleCompleteVisit = async (caseId) => {
    setCompletingId(caseId);
    try {
      const { outbreakTriggered } = await completeVisit(caseId);
      toast.success(
        outbreakTriggered
          ? 'Visit marked complete — outbreak threshold reached, Health Officer and Admin notified.'
          : 'Visit marked complete — citizen notified.'
      );
    } finally {
      setCompletingId(null);
    }
  };

  const handleForward = async (caseId) => {
    const draft = drafts[caseId] || {};
    setForwardingId(caseId);
    try {
      await forwardToOfficer(caseId, {
        notes: draft.notes || '',
        vitals: {
          bp: draft.bp || '',
          sugar: draft.sugar || '',
          temp: draft.temp || '',
          pulse: draft.pulse || '',
        },
      });
      toast.success('Case forwarded to Health Officer for review.');
    } finally {
      setForwardingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-slate-900 dark:text-white">Home Visits</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Manage today's schedule, upcoming visits, and completed visit notes.
        </p>
      </div>

      {isLoading && <SkeletonGrid count={3} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" />}

      {assignedCases.length > 0 && (
        <div className="surface-card p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-signal-rose/10 text-signal-rose">
                <UserPlus className="h-4 w-4" />
              </span>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">Citizen-Assigned Cases</p>
            </div>
            {criticalCount > 0 && (
              <Badge tone="rose">
                <TriangleAlert className="mr-1 h-3 w-3" /> {criticalCount} critical patient{criticalCount > 1 ? 's' : ''}
              </Badge>
            )}
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Automatically created from citizen symptom reports and emergency alerts.
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {assignedCases.map((c) => (
              <div key={c.id} className="rounded-xl border border-slate-200/70 p-4 dark:border-white/10">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{c.citizenName}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{c.disease} · {c.ward}</p>
                  </div>
                  <Badge tone={RISK_TONE[c.riskLevel] || 'neutral'}>{c.riskLevel}</Badge>
                </div>
                <div className="mt-3">
                  <CaseTimeline timeline={c.timeline} compact />
                </div>
                {c.status !== 'Visit Completed' && !c.assignedOfficer && (
                  <Button
                    variant="secondary"
                    className="mt-2 w-full text-xs"
                    onClick={() => handleCompleteVisit(c.id)}
                    isLoading={completingId === c.id}
                  >
                    Mark Visit Complete
                  </Button>
                )}

                {c.status === 'Visit Completed' && !c.assignedOfficer && (
                  <div className="mt-3 space-y-2 border-t border-slate-200/70 pt-3 dark:border-white/10">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Vitals & notes</p>
                      {c.riskLevel === 'High' && <Badge tone="rose">Critical — forward now</Badge>}
                    </div>
                    <div className="grid grid-cols-4 gap-1.5">
                      <input
                        placeholder="BP"
                        className="input-field px-2 py-1.5 text-xs"
                        value={drafts[c.id]?.bp || ''}
                        onChange={(e) => updateDraft(c.id, 'bp', e.target.value)}
                      />
                      <input
                        placeholder="Sugar"
                        className="input-field px-2 py-1.5 text-xs"
                        value={drafts[c.id]?.sugar || ''}
                        onChange={(e) => updateDraft(c.id, 'sugar', e.target.value)}
                      />
                      <input
                        placeholder="Temp"
                        className="input-field px-2 py-1.5 text-xs"
                        value={drafts[c.id]?.temp || ''}
                        onChange={(e) => updateDraft(c.id, 'temp', e.target.value)}
                      />
                      <input
                        placeholder="Pulse"
                        className="input-field px-2 py-1.5 text-xs"
                        value={drafts[c.id]?.pulse || ''}
                        onChange={(e) => updateDraft(c.id, 'pulse', e.target.value)}
                      />
                    </div>
                    <textarea
                      placeholder="Visit notes for the Health Officer"
                      rows={2}
                      className="input-field w-full px-2 py-1.5 text-xs"
                      value={drafts[c.id]?.notes || ''}
                      onChange={(e) => updateDraft(c.id, 'notes', e.target.value)}
                    />
                    <Button
                      variant="primary"
                      className="w-full text-xs"
                      onClick={() => handleForward(c.id)}
                      isLoading={forwardingId === c.id}
                    >
                      {forwardingId !== c.id && <Send className="h-3.5 w-3.5" />} Forward to Health Officer
                    </Button>
                  </div>
                )}

                {c.assignedOfficer && (
                  <p className="mt-3 flex items-center gap-1.5 border-t border-slate-200/70 pt-3 text-xs text-brand-600 dark:border-white/10 dark:text-brand-400">
                    <Send className="h-3.5 w-3.5" /> Forwarded to {c.assignedOfficer}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {!visits && <SkeletonGrid count={3} className="grid gap-6 lg:grid-cols-3" />}

      {visits && (
        <div className="grid gap-6 lg:grid-cols-3">
          <section className="surface-card p-5">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400">
                <CalendarCheck className="h-4 w-4" />
              </span>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">Today's Visits</p>
            </div>
            <div className="mt-4 space-y-3">
              {visits.today.map((v) => (
                <div key={v.id} className="rounded-xl border border-slate-200/70 p-3 dark:border-white/10">
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{v.familyName}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{v.type}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-xs text-slate-400">{v.time}</span>
                    <Badge tone="amber">{v.status}</Badge>
                  </div>
                </div>
              ))}
              {visits.today.length === 0 && <p className="text-sm text-slate-400">No visits scheduled today.</p>}
            </div>
          </section>

          <section className="surface-card p-5">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400">
                <CalendarClock className="h-4 w-4" />
              </span>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">Upcoming Visits</p>
            </div>
            <div className="mt-4 space-y-3">
              {visits.upcoming.map((v) => (
                <div key={v.id} className="rounded-xl border border-slate-200/70 p-3 dark:border-white/10">
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{v.familyName}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{v.type}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-xs text-slate-400">{new Date(v.date).toLocaleDateString()}</span>
                    {v.followUp && (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-brand-600 dark:text-brand-400">
                        <RotateCw className="h-3 w-3" /> Follow-up
                      </span>
                    )}
                  </div>
                </div>
              ))}
              {visits.upcoming.length === 0 && <p className="text-sm text-slate-400">Nothing scheduled ahead.</p>}
            </div>
          </section>

          <section className="surface-card p-5">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400">
                <CheckCircle2 className="h-4 w-4" />
              </span>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">Completed Visits</p>
            </div>
            <div className="mt-4 space-y-3">
              {visits.completed.map((v) => (
                <div key={v.id} className="rounded-xl border border-slate-200/70 p-3 dark:border-white/10">
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{v.familyName}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{v.type}</p>
                  <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">{v.notes}</p>
                  <p className="mt-1 text-xs text-slate-400">{new Date(v.date).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
