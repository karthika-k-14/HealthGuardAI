import React, { useEffect, useState, useMemo } from 'react';
import toast from 'react-hot-toast';
import {
  CalendarCheck,
  CalendarClock,
  CheckCircle2,
  Plus,
  Calendar,
  Eye,
  Filter,
  History,
  CheckSquare,
  Clock,
  UserX,
} from 'lucide-react';
import { fetchAshaVisits, scheduleHomeVisit, completeHomeVisit, fetchVisitStatistics } from '../../api/ashaVisitApi';
import { fetchAssignedCitizens } from '../../api/ashaAssignedApi';
import { fetchFamilyByCitizen } from '../../api/ashaFamilyApi';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import { SkeletonGrid } from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';

const VISIT_TYPES = [
  'Routine Checkup',
  'Pregnancy Follow-up',
  'Child Health',
  'Immunization Follow-up',
  'Elderly Care',
  'Disease Surveillance',
];

export default function HomeVisits() {
  const [visits, setVisits] = useState([]);
  const [stats, setStats] = useState({
    totalVisits: 0,
    scheduledVisits: 0,
    completedVisits: 0,
    missedVisits: 0,
  });
  const [assignedCitizens, setAssignedCitizens] = useState([]);
  const [familyMap, setFamilyMap] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  // Filter state (Requirement 8: Scheduled, Completed, Missed)
  const [activeFilter, setActiveFilter] = useState('ALL');

  // Schedule Visit Modal
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedCitizenKey, setSelectedCitizenKey] = useState('');
  const [visitType, setVisitType] = useState('Routine Checkup');
  const [visitDate, setVisitDate] = useState(new Date().toISOString().slice(0, 10));
  const [visitNotes, setVisitNotes] = useState('');

  // Details Modal
  const [selectedVisitDetail, setSelectedVisitDetail] = useState(null);

  // Complete Visit Modal Form
  const [activeVisitToComplete, setActiveVisitToComplete] = useState(null);
  const [observationsInput, setObservationsInput] = useState('');
  const [symptomsInput, setSymptomsInput] = useState('None');
  const [bpInput, setBpInput] = useState('');
  const [weightInput, setWeightInput] = useState('');
  const [tempInput, setTempInput] = useState('');
  const [recommendationsInput, setRecommendationsInput] = useState('');
  const [followUpRequired, setFollowUpRequired] = useState(false);
  const [nextVisitDateInput, setNextVisitDateInput] = useState(new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10));
  const [riskLevelInput, setRiskLevelInput] = useState('Low');
  const [completeNotesInput, setCompleteNotesInput] = useState('');

  // Requirement 9: Checklist findings
  const [bpChecked, setBpChecked] = useState(false);
  const [immunizationVerified, setImmunizationVerified] = useState(false);
  const [pregnancyFollowUp, setPregnancyFollowUp] = useState(false);
  const [symptomsFound, setSymptomsFound] = useState(false);
  const [referralRequired, setReferralRequired] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [vList, sData, cList] = await Promise.all([
        fetchAshaVisits(),
        fetchVisitStatistics(),
        fetchAssignedCitizens(),
      ]);

      setVisits(vList || []);
      setStats(sData || { totalVisits: 0, scheduledVisits: 0, completedVisits: 0, missedVisits: 0 });
      setAssignedCitizens(cList || []);

      // Load family records for assigned citizens
      const map = {};
      await Promise.all(
        (cList || []).map(async (c) => {
          const fam = await fetchFamilyByCitizen(c.id);
          if (fam) map[String(c.id)] = fam;
        })
      );
      setFamilyMap(map);
    } catch (e) {
      toast.error('Failed to load home visit records.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Requirement 3: Build formatted dropdown options (Citizen Name - Family Head Name - Village Name)
  const citizenOptions = useMemo(() => {
    return assignedCitizens.map((c) => {
      const citizenName = c.name || c.citizenName || c.fullName || 'Citizen';
      const fam = familyMap[String(c.id)];
      const familyHeadName = fam ? (fam.headOfFamily || fam.headName || `${citizenName} Family`) : `${citizenName} Family`;
      const villageName = c.village || c.villageName || c.address || fam?.village || 'Coimbatore Village';
      const familyId = fam?.id || null;

      return {
        key: String(c.id),
        citizenId: c.id,
        familyId,
        citizenName,
        familyHeadName,
        villageName,
        displayText: `${citizenName} - ${familyHeadName} - ${villageName}`,
      };
    });
  }, [assignedCitizens, familyMap]);

  // Requirement 8: Filters (Scheduled, Completed, Missed)
  const todayStr = new Date().toISOString().slice(0, 10);
  const filteredVisits = useMemo(() => {
    if (activeFilter === 'SCHEDULED') {
      return visits.filter((v) => String(v.status).toUpperCase() === 'SCHEDULED' && v.visitDate >= todayStr);
    }
    if (activeFilter === 'COMPLETED') {
      return visits.filter((v) => String(v.status).toUpperCase() === 'COMPLETED');
    }
    if (activeFilter === 'MISSED') {
      return visits.filter(
        (v) => String(v.status).toUpperCase() === 'MISSED' || (String(v.status).toUpperCase() === 'SCHEDULED' && v.visitDate < todayStr)
      );
    }
    return visits;
  }, [visits, activeFilter, todayStr]);

  const scheduledList = useMemo(() => visits.filter((v) => String(v.status).toUpperCase() === 'SCHEDULED'), [visits]);
  const completedHistoryList = useMemo(() => visits.filter((v) => String(v.status).toUpperCase() === 'COMPLETED'), [visits]);

  // Schedule Submit (Requirements 1, 3, 6)
  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCitizenKey) {
      toast.error('Please select an assigned citizen.');
      return;
    }

    const opt = citizenOptions.find((o) => o.key === selectedCitizenKey);
    if (!opt) {
      toast.error('Invalid citizen selection.');
      return;
    }

    try {
      await scheduleHomeVisit({
        citizenId: opt.citizenId,
        familyId: opt.familyId,
        citizenName: opt.citizenName,
        village: opt.villageName,
        visitType,
        visitDate,
        notes: visitNotes,
      });

      toast.success(`Home visit scheduled for ${opt.citizenName} on ${visitDate}`);
      setShowScheduleModal(false);
      setSelectedCitizenKey('');
      setVisitNotes('');
      loadData();
    } catch (e) {
      toast.error('Failed to schedule visit.');
    }
  };

  const openCompleteModal = (v) => {
    setActiveVisitToComplete(v);
    setObservationsInput(v.observations || '');
    setSymptomsInput(v.symptoms || 'None');
    setBpInput(v.bloodPressure || '120/80');
    setWeightInput(v.weight || '');
    setTempInput(v.temperature || '');
    setRecommendationsInput(v.recommendations || '');
    setFollowUpRequired(Boolean(v.followUpRequired));
    setNextVisitDateInput(v.nextVisitDate || new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10));
    setRiskLevelInput(v.riskLevel || 'Low');
    setCompleteNotesInput(v.notes || '');

    // Reset checklist notes
    setBpChecked(Boolean(v.bpChecked));
    setImmunizationVerified(Boolean(v.immunizationVerified));
    setPregnancyFollowUp(Boolean(v.pregnancyFollowUp));
    setSymptomsFound(Boolean(v.symptomsFound));
    setReferralRequired(Boolean(v.referralRequired));
  };

  const handleCompleteSubmit = async (e) => {
    e.preventDefault();
    if (!activeVisitToComplete) return;
    if (!observationsInput.trim()) {
      toast.error('Health observations are required before completing visit.');
      return;
    }

    try {
      await completeHomeVisit(activeVisitToComplete.visitId || activeVisitToComplete.id, {
        observations: observationsInput,
        symptoms: symptomsInput,
        bloodPressure: bpInput,
        weight: weightInput,
        temperature: tempInput,
        recommendations: recommendationsInput,
        followUpRequired,
        nextVisitDate: nextVisitDateInput,
        riskLevel: riskLevelInput,
        notes: completeNotesInput,

        // Checklist notes
        bpChecked,
        immunizationVerified,
        pregnancyFollowUp,
        symptomsFound,
        referralRequired,
      });

      toast.success(followUpRequired ? 'Visit COMPLETED — Automated follow-up visit scheduled!' : 'Visit marked COMPLETED successfully!');
      setActiveVisitToComplete(null);
      loadData();
    } catch (e) {
      toast.error('Failed to complete home visit.');
    }
  };

  const hasAssignedCitizens = assignedCitizens.length > 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-2xl font-semibold text-slate-900 dark:text-white">Home Visit Management</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Schedule, complete, and track home visits for assigned citizens and families in your village.
          </p>
        </div>

        {/* Requirement 5: Disable Schedule Visit button when no assigned citizens exist */}
        <Button
          variant="primary"
          onClick={() => setShowScheduleModal(true)}
          disabled={!hasAssignedCitizens}
          title={!hasAssignedCitizens ? 'No citizens assigned. Contact Admin to assign citizens.' : 'Schedule Home Visit'}
        >
          <Plus className="h-4 w-4" /> Schedule Home Visit
        </Button>
      </div>

      {/* Requirement 4: Alert if no assigned citizens exist */}
      {!isLoading && !hasAssignedCitizens && (
        <div className="surface-card flex items-center gap-3 p-4 border-l-4 border-l-amber-500 bg-amber-500/10 text-amber-800 dark:text-amber-300">
          <UserX className="h-5 w-5 text-amber-600 shrink-0" />
          <div>
            <p className="font-bold text-sm">No citizens assigned</p>
            <p className="text-xs text-amber-700 dark:text-amber-400">Contact Admin to assign citizens to your profile before scheduling home visits.</p>
          </div>
        </div>
      )}

      {/* Dashboard Statistics Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="surface-card p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400">Total Visits</p>
            <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{stats.totalVisits}</p>
          </div>
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400">
            <CalendarCheck className="h-5 w-5" />
          </span>
        </div>

        <div className="surface-card p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400">Scheduled Visits</p>
            <p className="mt-1 text-2xl font-bold text-amber-500">{stats.scheduledVisits}</p>
          </div>
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
            <CalendarClock className="h-5 w-5" />
          </span>
        </div>

        <div className="surface-card p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400">Completed Visits</p>
            <p className="mt-1 text-2xl font-bold text-emerald-600 dark:text-emerald-400">{stats.completedVisits}</p>
          </div>
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-5 w-5" />
          </span>
        </div>

        <div className="surface-card p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400">Missed Visits</p>
            <p className="mt-1 text-2xl font-bold text-rose-600 dark:text-rose-400">{stats.missedVisits}</p>
          </div>
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
            <Clock className="h-5 w-5" />
          </span>
        </div>
      </div>

      {/* Requirement 8: Filters Bar (Scheduled, Completed, Missed) */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 pb-4 dark:border-white/10">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Filter Visits:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'ALL', label: `All Visits (${visits.length})` },
            { id: 'SCHEDULED', label: `Scheduled (${stats.scheduledVisits})` },
            { id: 'COMPLETED', label: `Completed (${stats.completedVisits})` },
            { id: 'MISSED', label: `Missed (${stats.missedVisits})` },
          ].map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setActiveFilter(f.id)}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
                activeFilter === f.id
                  ? 'bg-brand-600 text-white shadow-xs'
                  : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-300'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading && <SkeletonGrid count={6} className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3" />}

      {!isLoading && filteredVisits.length === 0 && (
        <EmptyState
          icon={CalendarCheck}
          title="No visits found"
          description="No home visits match the selected filter category."
        />
      )}

      {/* Scheduled & History Sections */}
      {!isLoading && filteredVisits.length > 0 && (
        <div className="space-y-8">
          {(activeFilter === 'ALL' || activeFilter === 'SCHEDULED') && scheduledList.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-amber-500" />
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Scheduled Home Visits ({scheduledList.length})
                </h2>
              </div>

              {/* Requirement 1: Scheduled Home Visit Card format */}
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {scheduledList.map((v) => (
                  <div key={v.visitId || v.id} className="surface-card flex flex-col justify-between gap-4 p-5 border-l-4 border-l-amber-500">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-base font-bold text-slate-900 dark:text-white">{v.citizenName}</p>
                          <p className="text-xs font-medium text-brand-600 dark:text-brand-400">{v.village || 'Coimbatore Village'}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{v.visitType}</p>
                        </div>
                        <Badge tone="amber">SCHEDULED</Badge>
                      </div>

                      <div className="space-y-1 text-xs text-slate-500 dark:text-slate-400">
                        <p className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                          Visit Date: <strong className="font-semibold text-slate-700 dark:text-slate-200">{v.visitDate}</strong>
                        </p>
                        {v.notes && <p className="italic text-slate-500">&quot;{v.notes}&quot;</p>}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/60 dark:border-white/10">
                      <button
                        type="button"
                        onClick={() => setSelectedVisitDetail(v)}
                        className="inline-flex items-center justify-center gap-1 rounded-xl border border-slate-200 bg-white py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
                      >
                        <Eye className="h-3.5 w-3.5" /> View Details
                      </button>

                      {/* Requirement 7: Complete Visit button */}
                      <button
                        type="button"
                        onClick={() => openCompleteModal(v)}
                        className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 py-2 text-xs font-bold text-white hover:bg-emerald-700 shadow-xs"
                      >
                        <CheckSquare className="h-3.5 w-3.5" /> Complete Visit
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Completed History Section */}
          {(activeFilter === 'ALL' || activeFilter === 'COMPLETED') && completedHistoryList.length > 0 && (
            <div className="space-y-4 pt-4 border-t border-slate-200/60 dark:border-white/10">
              <div className="flex items-center gap-2">
                <History className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Visit History — Completed Records ({completedHistoryList.length})
                </h2>
              </div>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {completedHistoryList.map((v) => {

                  return (
                    <div key={v.visitId || v.id} className="surface-card flex flex-col justify-between gap-4 p-5 border-l-4 border-l-emerald-500">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-base font-bold text-slate-900 dark:text-white">{v.citizenName}</p>
                            <p className="text-xs text-brand-600 dark:text-brand-400 font-medium">{v.village}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{v.visitType}</p>
                          </div>
                          <Badge tone="brand">COMPLETED</Badge>
                        </div>

                        <div className="space-y-1.5 text-xs text-slate-500 dark:text-slate-400">
                          <p className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                            Date: <strong className="font-semibold text-slate-700 dark:text-slate-200">{v.visitDate}</strong>
                          </p>
                          {v.observations && (
                            <p className="text-slate-700 dark:text-slate-200 font-medium">
                              <strong>Observations:</strong> {v.observations}
                            </p>
                          )}

                          {/* Requirement 9 Checklist Badges display */}
                          <div className="flex flex-wrap gap-1 pt-1">
                            {v.bpChecked && <Badge tone="brand">BP Checked</Badge>}
                            {v.immunizationVerified && <Badge tone="brand">Immunization Verified</Badge>}
                            {v.pregnancyFollowUp && <Badge tone="rose">Pregnancy Follow-up</Badge>}
                            {v.symptomsFound && <Badge tone="amber">Symptoms Found</Badge>}
                            {v.referralRequired && <Badge tone="rose">Referral Required</Badge>}
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end pt-2 border-t border-slate-200/60 dark:border-white/10">
                        <button
                          type="button"
                          onClick={() => setSelectedVisitDetail(v)}
                          className="inline-flex items-center gap-1 text-xs font-bold text-brand-600 hover:text-brand-700 dark:text-brand-400"
                        >
                          <Eye className="h-3.5 w-3.5" /> View Report Details
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Requirement 3: Schedule Home Visit Modal with exact Dropdown format */}
      <Modal open={showScheduleModal} onClose={() => setShowScheduleModal(false)} title="Schedule Home Visit">
        <form onSubmit={handleScheduleSubmit} className="space-y-4 text-sm">
          <div>
            <label className="label-text font-bold text-slate-800 dark:text-slate-100">
              Select Assigned Citizen &amp; Household <span className="text-rose-500">*</span>
            </label>

            {/* Requirement 3: Format: Citizen Name - Family Head Name - Village Name */}
            <select
              required
              value={selectedCitizenKey}
              onChange={(e) => setSelectedCitizenKey(e.target.value)}
              className="input-field text-sm"
            >
              <option value="">-- Select Citizen - Family - Village --</option>
              {citizenOptions.map((o) => (
                <option key={o.key} value={o.key}>
                  {o.displayText}
                </option>
              ))}
            </select>

            <p className="mt-1 text-[11px] text-slate-400">
              Format: Citizen Name - Family Head Name - Village Name
            </p>
          </div>

          <div>
            <label className="label-text">Visit Type</label>
            <select value={visitType} onChange={(e) => setVisitType(e.target.value)} className="input-field text-sm">
              {VISIT_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="label-text">Visit Date</label>
            <input
              type="date"
              required
              value={visitDate}
              onChange={(e) => setVisitDate(e.target.value)}
              className="input-field text-sm"
            />
          </div>

          <div>
            <label className="label-text">Notes &amp; Objectives</label>
            <textarea
              rows={2}
              value={visitNotes}
              onChange={(e) => setVisitNotes(e.target.value)}
              placeholder="e.g. Conduct routine antenatal care checkup, record family vitals…"
              className="input-field text-sm"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setShowScheduleModal(false)}>Cancel</Button>
            <Button type="submit" variant="primary" disabled={!hasAssignedCitizens}>Schedule Visit</Button>
          </div>
        </form>
      </Modal>

      {/* Complete Visit Modal Form with Requirement 9 Findings Checklist */}
      <Modal
        open={!!activeVisitToComplete}
        onClose={() => setActiveVisitToComplete(null)}
        title={`Complete Home Visit - ${activeVisitToComplete?.citizenName}`}
      >
        <form onSubmit={handleCompleteSubmit} className="space-y-4 text-sm">
          <div>
            <label className="label-text font-bold text-slate-800 dark:text-slate-100">
              Health Observations <span className="text-rose-500">* (Required)</span>
            </label>
            <textarea
              required
              rows={3}
              value={observationsInput}
              onChange={(e) => setObservationsInput(e.target.value)}
              placeholder="Enter health observations, physical condition, and checkup findings…"
              className="input-field text-sm"
            />
          </div>

          {/* Requirement 9: Checklist Notes after completion */}
          <div className="space-y-2 rounded-xl bg-slate-50 p-3.5 dark:bg-white/5 border border-slate-200/80 dark:border-white/10">
            <p className="text-xs font-bold text-slate-800 dark:text-slate-100">ASHA Visit Findings &amp; Checklist Notes:</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={bpChecked}
                  onChange={(e) => setBpChecked(e.target.checked)}
                  className="rounded border-slate-300 text-brand-600 focus:ring-brand-500 h-4 w-4"
                />
                BP Checked
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={immunizationVerified}
                  onChange={(e) => setImmunizationVerified(e.target.checked)}
                  className="rounded border-slate-300 text-brand-600 focus:ring-brand-500 h-4 w-4"
                />
                Immunization Verified
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={pregnancyFollowUp}
                  onChange={(e) => setPregnancyFollowUp(e.target.checked)}
                  className="rounded border-slate-300 text-rose-600 focus:ring-rose-500 h-4 w-4"
                />
                Pregnancy Follow-up
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={symptomsFound}
                  onChange={(e) => setSymptomsFound(e.target.checked)}
                  className="rounded border-slate-300 text-amber-600 focus:ring-amber-500 h-4 w-4"
                />
                Disease Symptoms Found
              </label>

              <label className="flex items-center gap-2 cursor-pointer col-span-2">
                <input
                  type="checkbox"
                  checked={referralRequired}
                  onChange={(e) => setReferralRequired(e.target.checked)}
                  className="rounded border-slate-300 text-rose-600 focus:ring-rose-500 h-4 w-4"
                />
                Referral Required (Alerts Health Officer)
              </label>
            </div>
          </div>

          <div>
            <label className="label-text">Observed Symptoms</label>
            <input
              value={symptomsInput}
              onChange={(e) => setSymptomsInput(e.target.value)}
              placeholder="e.g. Cough, Mild fever, Headaches, None"
              className="input-field text-sm"
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="label-text">Blood Pressure</label>
              <input
                value={bpInput}
                onChange={(e) => setBpInput(e.target.value)}
                placeholder="120/80"
                className="input-field text-sm"
              />
            </div>
            <div>
              <label className="label-text">Weight (kg)</label>
              <input
                type="number"
                step="0.1"
                value={weightInput}
                onChange={(e) => setWeightInput(e.target.value)}
                placeholder="60"
                className="input-field text-sm"
              />
            </div>
            <div>
              <label className="label-text">Temp (°F)</label>
              <input
                type="number"
                step="0.1"
                value={tempInput}
                onChange={(e) => setTempInput(e.target.value)}
                placeholder="98.6"
                className="input-field text-sm"
              />
            </div>
          </div>

          <div>
            <label className="label-text">Recommendations &amp; Action Plan</label>
            <input
              value={recommendationsInput}
              onChange={(e) => setRecommendationsInput(e.target.value)}
              placeholder="e.g. Prescribe iron supplements, recommend dietary changes…"
              className="input-field text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label-text">Risk Level</label>
              <select value={riskLevelInput} onChange={(e) => setRiskLevelInput(e.target.value)} className="input-field text-sm">
                <option value="Low">Low Risk</option>
                <option value="Medium">Medium Risk</option>
                <option value="High">High Risk (Notifies Health Officer)</option>
                <option value="Critical">Critical Emergency</option>
              </select>
            </div>
            <div>
              <label className="label-text">Next Visit Date</label>
              <input
                type="date"
                value={nextVisitDateInput}
                onChange={(e) => setNextVisitDateInput(e.target.value)}
                className="input-field text-sm"
              />
            </div>
          </div>

          <div className="rounded-xl bg-brand-50 p-3 dark:bg-brand-950/20 border border-brand-200/60 dark:border-brand-900/30">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-brand-800 dark:text-brand-300">
              <input
                type="checkbox"
                checked={followUpRequired}
                onChange={(e) => setFollowUpRequired(e.target.checked)}
                className="rounded border-brand-300 text-brand-600 focus:ring-brand-500 h-4 w-4"
              />
              Follow-up Visit Required (Automatically creates a new SCHEDULED follow-up visit)
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setActiveVisitToComplete(null)}>Cancel</Button>
            <Button type="submit" variant="primary">Submit Completed Visit</Button>
          </div>
        </form>
      </Modal>

      {/* Details Modal */}
      <Modal open={!!selectedVisitDetail} onClose={() => setSelectedVisitDetail(null)} title={`Visit Record - ${selectedVisitDetail?.citizenName}`}>
        {selectedVisitDetail && (
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-4 dark:bg-white/5 text-xs">
              <div>
                <p className="text-slate-400">Citizen Name</p>
                <p className="font-bold text-slate-800 dark:text-slate-100">{selectedVisitDetail.citizenName}</p>
              </div>
              <div>
                <p className="text-slate-400">Village</p>
                <p className="font-semibold text-slate-800 dark:text-slate-100">{selectedVisitDetail.village || 'Coimbatore Village'}</p>
              </div>
              <div>
                <p className="text-slate-400">Visit Type</p>
                <p className="font-semibold text-slate-800 dark:text-slate-100">{selectedVisitDetail.visitType}</p>
              </div>
              <div>
                <p className="text-slate-400">Visit Date</p>
                <p className="font-semibold text-slate-800 dark:text-slate-100">{selectedVisitDetail.visitDate}</p>
              </div>
            </div>

            {selectedVisitDetail.observations && (
              <div className="space-y-1">
                <p className="font-bold text-slate-800 dark:text-slate-100">Observations</p>
                <p className="rounded-xl bg-slate-50 p-3 text-xs text-slate-600 dark:bg-white/5 dark:text-slate-300">
                  {selectedVisitDetail.observations}
                </p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
