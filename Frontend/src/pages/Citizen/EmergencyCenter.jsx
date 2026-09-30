import React, { useEffect, useState, useCallback } from 'react';
import {
  Siren,
  ShieldAlert,
  PhoneCall,
  MapPin,
  Clock,
  UserCheck,
  Building2,
  Droplets,
  HeartPulse,
  Activity,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  RefreshCw,
  Sparkles,
  Phone,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { fetchDashboardSummary } from '../../api/dashboardApi';
import {
  fetchCitizenEmergencyAlerts,
  fetchFacilitiesHospitals,
  fetchFacilitiesPHCs,
  fetchFacilitiesBloodBanks
} from '../../api/emergencyApi';
import Badge from '../../components/common/Badge';

const WORKFLOW_STEPS = [
  'Alert Created',
  'ASHA Notified',
  'Citizen Contacted',
  'Visit Scheduled',
  'Visit Completed',
  'Escalated',
  'Resolved'
];

export default function EmergencyCenter() {
  const { user } = useAuth();
  const citizenId = user?.citizenId || user?.userId || user?.id || 1;

  const [summary, setSummary] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [hospitals, setHospitals] = useState([]);
  const [phcs, setPhcs] = useState([]);
  const [bloodBanks, setBloodBanks] = useState([]);
  const [facilityTab, setFacilityTab] = useState('hospitals'); // hospitals, phcs, bloodbanks
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      const [sumData, alertList, hospList, phcList, bbList] = await Promise.all([
        fetchDashboardSummary(citizenId),
        fetchCitizenEmergencyAlerts(citizenId),
        fetchFacilitiesHospitals(),
        fetchFacilitiesPHCs(),
        fetchFacilitiesBloodBanks()
      ]);

      if (sumData) setSummary(sumData);
      if (alertList && alertList.length > 0) {
        setAlerts(alertList);
        setSelectedAlert(alertList[0]);
      } else {
        setAlerts([]);
        setSelectedAlert(null);
      }
      if (hospList) setHospitals(hospList);
      if (phcList) setPhcs(phcList);
      if (bbList) setBloodBanks(bbList);
    } catch (err) {
      console.error('Error loading Emergency Center data:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [citizenId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Determine current stage index in workflow
  const getWorkflowStepIndex = (status) => {
    const s = (status || '').toUpperCase();
    if (s === 'RESOLVED') return 6;
    if (s === 'ESCALATED') return 5;
    if (s === 'VISITED' || s === 'VISIT_COMPLETED') return 4;
    if (s === 'VISIT_SCHEDULED') return 3;
    if (s === 'CONTACTED') return 2;
    if (s === 'ASHA_NOTIFIED' || s === 'ASSIGNED') return 1;
    return 0; // Alert Created / Pending
  };

  const currentStepIndex = selectedAlert ? getWorkflowStepIndex(selectedAlert.status) : 0;

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-rose-600 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
              Live Emergency Monitoring Center
            </span>
          </div>
          <h1 className="mt-1 font-display text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
            Emergency Response & ASHA Dispatch Hub
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Real-time tracking of AI-detected health alerts, assigned community workers, and verified facilities.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => loadData(true)}
            disabled={isRefreshing}
            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 dark:border-white/10 dark:bg-slate-800 dark:text-slate-200 transition-colors"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Updating...' : 'Live Refresh'}
          </button>

          <a
            href="tel:108"
            className="flex items-center gap-2 rounded-lg bg-rose-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-rose-700 transition-colors"
          >
            <PhoneCall className="h-4 w-4" />
            Call 108 Ambulance
          </a>
        </div>
      </div>

      {/* SECTION 1: HEALTH MONITORING STATUS OVERVIEW */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {/* Risk Score */}
        <div className="surface-card p-4 border-l-4 border-l-amber-500">
          <span className="text-2xs font-semibold uppercase text-slate-400">Health Risk Score</span>
          <div className="mt-1.5 flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {summary?.healthRiskScore ?? 20.0}
            </span>
            <span className="text-xs text-slate-400">/ 100</span>
          </div>
          <span className="text-2xs text-slate-500 mt-1 block">Live AI Risk Index</span>
        </div>

        {/* Urgency Level */}
        <div className="surface-card p-4 border-l-4 border-l-rose-500">
          <span className="text-2xs font-semibold uppercase text-slate-400">Urgency Level</span>
          <div className="mt-1.5">
            <span className="text-lg font-bold text-rose-600">
              {summary?.currentUrgencyLevel || 'LOW'}
            </span>
          </div>
          <span className="text-2xs text-slate-500 mt-1 block">Triage Status</span>
        </div>

        {/* Latest Assessment */}
        <div className="surface-card p-4 border-l-4 border-l-sky-500">
          <span className="text-2xs font-semibold uppercase text-slate-400">Latest Assessment</span>
          <p className="mt-1.5 text-xs font-semibold text-slate-900 dark:text-white truncate">
            {summary?.latestAssessment?.diseaseCategory || 'General Health'}
          </p>
          <span className="text-2xs text-slate-500 mt-1 block">
            {summary?.latestAssessment?.date || 'Up to date'}
          </span>
        </div>

        {/* Assigned ASHA Worker */}
        <div className="surface-card p-4 border-l-4 border-l-brand-500">
          <span className="text-2xs font-semibold uppercase text-slate-400">Assigned ASHA Worker</span>
          <p className="mt-1.5 text-xs font-bold text-brand-600 dark:text-brand-400">
            {summary?.assignedAshaWorker || 'Assigned ASHA Worker'}
          </p>
          {summary?.ashaWorkerPhone ? (
            <a
              href={`tel:${summary.ashaWorkerPhone}`}
              className="text-2xs text-slate-500 hover:text-brand-600 mt-1 flex items-center gap-1"
            >
              <Phone className="h-2.5 w-2.5" /> {summary.ashaWorkerPhone}
            </a>
          ) : (
            <span className="text-2xs text-slate-400 mt-1 flex items-center gap-1">
              <Phone className="h-2.5 w-2.5" /> Contact PHC
            </span>
          )}
        </div>

        {/* Emergency Status */}
        <div className="surface-card p-4 border-l-4 border-l-purple-500">
          <span className="text-2xs font-semibold uppercase text-slate-400">Emergency Status</span>
          <div className="mt-1.5">
            <span className="inline-flex items-center gap-1 rounded-full bg-purple-500/10 px-2 py-0.5 text-xs font-semibold text-purple-600">
              {alerts.length > 0 ? (alerts[0].status || 'ACTIVE') : 'MONITORING'}
            </span>
          </div>
          <span className="text-2xs text-slate-500 mt-1 block">{alerts.length} Total Alerts Logged</span>
        </div>
      </div>

      {/* SECTION 2 & 3: EMERGENCY ALERT HISTORY & LIVE RESPONSE TIMELINE */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Emergency Alert History List */}
        <div className="surface-card p-5">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-3">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-rose-600" />
              <h2 className="font-display text-base font-semibold text-slate-900 dark:text-white">
                Emergency Alert History
              </h2>
            </div>
            <span className="text-2xs text-slate-400">{alerts.length} Recorded</span>
          </div>

          <div className="mt-4 space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
            {alerts.length > 0 ? (
              alerts.map((al) => (
                <div
                  key={al.id}
                  onClick={() => setSelectedAlert(al)}
                  className={`cursor-pointer rounded-xl border p-3.5 transition-all text-left ${
                    selectedAlert?.id === al.id
                      ? 'border-rose-500 bg-rose-500/10 shadow-sm'
                      : 'border-slate-200/80 bg-slate-50/50 hover:bg-slate-100/60 dark:border-white/5 dark:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      Alert #{al.id}
                    </span>
                    <span
                      className={`rounded px-1.5 py-0.5 text-2xs font-extrabold ${
                        al.urgencyLevel === 'CRITICAL'
                          ? 'bg-rose-600 text-white'
                          : 'bg-amber-500 text-white'
                      }`}
                    >
                      {al.urgencyLevel || 'HIGH'}
                    </span>
                  </div>

                  <p className="mt-1 text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                    Symptoms: {al.symptoms}
                  </p>

                  <div className="mt-2.5 flex items-center justify-between text-2xs text-slate-400">
                    <span>ASHA: {al.assignedAshaWorkerName || 'Assigned ASHA Worker'}</span>
                    <span className="font-semibold text-purple-600 dark:text-purple-400">
                      {al.status || 'PENDING'}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-xs text-slate-400">
                No active or past emergency alerts. If AI Chat detects high urgency, an alert will automatically appear here.
              </div>
            )}
          </div>
        </div>

        {/* Real Emergency Response Timeline (2 Columns) */}
        <div className="surface-card p-5 lg:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-3">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-brand-600 dark:text-brand-400" />
              <h2 className="font-display text-base font-semibold text-slate-900 dark:text-white">
                Live Emergency Response Workflow
              </h2>
            </div>
            {selectedAlert && (
              <span className="text-xs font-semibold text-slate-500">
                Viewing Alert #{selectedAlert.id}
              </span>
            )}
          </div>

          {selectedAlert ? (
            <div className="mt-6 space-y-6">
              {/* Stepper Progression */}
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
                {WORKFLOW_STEPS.map((stepName, idx) => {
                  const isDone = idx <= currentStepIndex;
                  const isCurrent = idx === currentStepIndex;
                  return (
                    <div
                      key={stepName}
                      className={`relative rounded-xl border p-2.5 text-center transition-all ${
                        isCurrent
                          ? 'border-rose-500 bg-rose-500/10 shadow-sm'
                          : isDone
                          ? 'border-emerald-300 bg-emerald-50 dark:border-emerald-500/30 dark:bg-emerald-500/10'
                          : 'border-slate-200 bg-slate-50 dark:border-white/5 dark:bg-slate-800 opacity-60'
                      }`}
                    >
                      <div className="flex items-center justify-center mb-1">
                        {isDone ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        ) : (
                          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-slate-300 text-2xs font-bold text-slate-700 dark:bg-slate-700 dark:text-slate-300">
                            {idx + 1}
                          </span>
                        )}
                      </div>
                      <span className="text-2xs font-bold text-slate-900 dark:text-white block leading-tight">
                        {stepName}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Alert Details Card */}
              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 dark:border-white/5 dark:bg-slate-800/50">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <span className="text-2xs uppercase tracking-wider font-bold text-slate-400">
                      Dispatched Case Profile
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Alert #{selectedAlert.id} • {selectedAlert.diseaseCategory || 'Clinical Emergency'}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge tone={selectedAlert.urgencyLevel === 'CRITICAL' ? 'rose' : 'amber'}>
                      {selectedAlert.urgencyLevel}
                    </Badge>
                    <Badge tone="purple">{selectedAlert.status}</Badge>
                  </div>
                </div>

                <div className="mt-3 grid gap-3 sm:grid-cols-2 text-xs">
                  <div>
                    <span className="text-slate-400 font-medium">Assigned Worker:</span>
                    <p className="font-semibold text-slate-900 dark:text-white">
                      {selectedAlert.assignedAshaWorkerName || 'Assigned ASHA Worker'}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium">Village / Jurisdiction:</span>
                    <p className="font-semibold text-slate-900 dark:text-white">
                      {selectedAlert.village || 'Periyanaickenpalayam'}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium">Reported Symptoms:</span>
                    <p className="font-semibold text-slate-900 dark:text-white">
                      {selectedAlert.symptoms}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium">Created Time:</span>
                    <p className="font-semibold text-slate-900 dark:text-white">
                      {selectedAlert.createdAt ? String(selectedAlert.createdAt).replace('T', ' ').substring(0, 16) : 'Recently'}
                    </p>
                  </div>
                </div>

                {/* Audit Timeline Log */}
                {selectedAlert.timeline && selectedAlert.timeline.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-slate-200/80 dark:border-white/5">
                    <span className="text-2xs uppercase tracking-wider font-bold text-slate-400 block mb-2">
                      Database Event Audit Log
                    </span>
                    <div className="space-y-1.5">
                      {selectedAlert.timeline.map((evt, eIdx) => (
                        <div key={eIdx} className="flex items-center justify-between text-2xs text-slate-600 dark:text-slate-300">
                          <span className="font-semibold">• {evt.action} by {evt.performedBy} ({evt.performedRole})</span>
                          <span className="text-slate-400">{evt.notes || ''}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-xs text-slate-400">
              No active emergency case selected. Select an alert from the history to view its step-by-step dispatch workflow.
            </div>
          )}
        </div>
      </div>

      {/* SECTION 4: NEARBY FACILITIES (HOSPITALS, PHCS, BLOOD BANKS) */}
      <div className="surface-card p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 dark:border-white/5 pb-3">
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-emerald-600" />
            <div>
              <h2 className="font-display text-base font-semibold text-slate-900 dark:text-white">
                Verified Nearby Healthcare Facilities
              </h2>
              <p className="text-2xs text-slate-500">Directly loaded from PostgreSQL registry</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setFacilityTab('hospitals')}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                facilityTab === 'hospitals'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
              }`}
            >
              Hospitals ({hospitals.length})
            </button>
            <button
              onClick={() => setFacilityTab('phcs')}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                facilityTab === 'phcs'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
              }`}
            >
              PHCs ({phcs.length})
            </button>
            <button
              onClick={() => setFacilityTab('bloodbanks')}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                facilityTab === 'bloodbanks'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
              }`}
            >
              Blood Banks ({bloodBanks.length})
            </button>
          </div>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {facilityTab === 'hospitals' &&
            hospitals.map((h) => (
              <div key={h.id} className="rounded-xl border border-slate-200/80 p-4 bg-slate-50/50 dark:border-white/5 dark:bg-slate-800/50 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-semibold text-xs text-slate-900 dark:text-white">
                      {h.name}
                    </span>
                    <span className="rounded bg-rose-500/10 px-1.5 py-0.5 text-2xs font-bold text-rose-600">
                      {h.total_beds || h.beds || 500}+ Beds
                    </span>
                  </div>
                  <p className="text-2xs text-slate-500 dark:text-slate-400 mt-1">
                    {h.address || 'Coimbatore, Tamil Nadu'}
                  </p>
                </div>
                <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-200/50 dark:border-white/5">
                  <a
                    href={`tel:${h.phone || '0422-2301393'}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700"
                  >
                    <Phone className="h-3 w-3" /> {h.phone || '0422-2301393'}
                  </a>
                  <a
                    href={`https://maps.google.com/?q=${h.latitude || 11.0018},${h.longitude || 76.9712}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-2xs text-slate-500 hover:text-brand-600"
                  >
                    Navigate <ExternalLink className="h-2.5 w-2.5" />
                  </a>
                </div>
              </div>
            ))}

          {facilityTab === 'phcs' &&
            phcs.map((p) => (
              <div key={p.id} className="rounded-xl border border-slate-200/80 p-4 bg-slate-50/50 dark:border-white/5 dark:bg-slate-800/50 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-semibold text-xs text-slate-900 dark:text-white">
                      {p.name}
                    </span>
                    <span className="rounded bg-brand-500/10 px-1.5 py-0.5 text-2xs font-bold text-brand-600">
                      Govt PHC
                    </span>
                  </div>
                  <p className="text-2xs text-slate-500 dark:text-slate-400 mt-1">
                    {p.address} • MO: {p.medical_officer || 'Dr. Medical Officer'}
                  </p>
                </div>
                <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-200/50 dark:border-white/5">
                  <a
                    href={`tel:${p.phone || '0422-2615233'}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700"
                  >
                    <Phone className="h-3 w-3" /> {p.phone || '0422-2615233'}
                  </a>
                  <a
                    href={`https://maps.google.com/?q=${p.latitude || 10.8955},${p.longitude || 77.0012}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-2xs text-slate-500 hover:text-brand-600"
                  >
                    Navigate <ExternalLink className="h-2.5 w-2.5" />
                  </a>
                </div>
              </div>
            ))}

          {facilityTab === 'bloodbanks' &&
            bloodBanks.map((b) => (
              <div key={b.id} className="rounded-xl border border-slate-200/80 p-4 bg-slate-50/50 dark:border-white/5 dark:bg-slate-800/50 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-semibold text-xs text-slate-900 dark:text-white">
                      {b.name}
                    </span>
                    <span className="rounded bg-rose-500/10 px-1.5 py-0.5 text-2xs font-bold text-rose-600">
                      Blood Bank
                    </span>
                  </div>
                  <p className="text-2xs text-slate-500 dark:text-slate-400 mt-1">
                    {b.address}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {b.bloodGroupsAvailable?.map((bg) => (
                      <span key={bg} className="rounded bg-slate-200 px-1.5 py-0.5 text-2xs font-bold text-slate-800 dark:bg-slate-700 dark:text-slate-200">
                        {bg}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-200/50 dark:border-white/5">
                  <a
                    href={`tel:${b.phone || '0422-2301393'}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-700"
                  >
                    <Phone className="h-3 w-3" /> {b.phone || '0422-2301393'}
                  </a>
                  <span className="text-2xs text-emerald-600 font-semibold">24x7 Open</span>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* SECTION 5: EMERGENCY CONTACTS & HELPLINES */}
      <div className="surface-card p-5 border-l-4 border-l-rose-600">
        <h2 className="font-display text-base font-bold text-slate-900 dark:text-white mb-3">
          National & Community Emergency Helplines
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <a
            href="tel:108"
            className="flex items-center justify-between rounded-xl bg-rose-600 p-3.5 text-white hover:bg-rose-700 transition-colors shadow-sm"
          >
            <div>
              <p className="text-xs font-bold">108 Ambulance</p>
              <p className="text-2xs text-rose-100">National Medical Service</p>
            </div>
            <PhoneCall className="h-5 w-5" />
          </a>

          <a
            href="tel:112"
            className="flex items-center justify-between rounded-xl bg-slate-900 p-3.5 text-white hover:bg-slate-800 transition-colors shadow-sm dark:bg-slate-800"
          >
            <div>
              <p className="text-xs font-bold">112 Emergency</p>
              <p className="text-2xs text-slate-300">Unified Helpline</p>
            </div>
            <PhoneCall className="h-5 w-5" />
          </a>

          <a
            href="tel:1091"
            className="flex items-center justify-between rounded-xl bg-purple-700 p-3.5 text-white hover:bg-purple-800 transition-colors shadow-sm"
          >
            <div>
              <p className="text-xs font-bold">1091 Women</p>
              <p className="text-2xs text-purple-200">Women Helpline</p>
            </div>
            <PhoneCall className="h-5 w-5" />
          </a>

          <a
            href="tel:1098"
            className="flex items-center justify-between rounded-xl bg-sky-600 p-3.5 text-white hover:bg-sky-700 transition-colors shadow-sm"
          >
            <div>
              <p className="text-xs font-bold">1098 Childline</p>
              <p className="text-2xs text-sky-100">Child Welfare Helpline</p>
            </div>
            <PhoneCall className="h-5 w-5" />
          </a>

          {summary?.ashaWorkerPhone ? (
            <a
              href={`tel:${summary.ashaWorkerPhone}`}
              className="flex items-center justify-between rounded-xl bg-emerald-700 p-3.5 text-white hover:bg-emerald-800 transition-colors shadow-sm"
            >
              <div>
                <p className="text-xs font-bold">Assigned ASHA</p>
                <p className="text-2xs text-emerald-200">{summary?.assignedAshaWorker || 'Assigned ASHA'}</p>
              </div>
              <PhoneCall className="h-5 w-5" />
            </a>
          ) : (
            <div className="flex items-center justify-between rounded-xl bg-emerald-700 p-3.5 text-white shadow-sm">
              <div>
                <p className="text-xs font-bold">Assigned ASHA</p>
                <p className="text-2xs text-emerald-200">{summary?.assignedAshaWorker || 'Assigned ASHA'}</p>
              </div>
              <PhoneCall className="h-5 w-5 opacity-60" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
