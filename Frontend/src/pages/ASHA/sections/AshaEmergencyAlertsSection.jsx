import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  Siren,
  AlertTriangle,
  HeartPulse,
  PhoneCall,
  Eye,
  CalendarPlus,
  CheckCircle2,
  Share2,
  Clock,
  MapPin,
  RefreshCw,
  X,
  Send,
  User,
  Activity,
  History
} from 'lucide-react';
import {
  fetchAshaEmergencyAlerts,
  updateEmergencyAlertStatus,
  escalateEmergencyAlert,
  resolveEmergencyAlert,
  fetchEmergencyAlertById
} from '../../../api/emergencyApi';
import { useAuth } from '../../../contexts/AuthContext';
import Badge from '../../../components/common/Badge';

const STATUS_TONE = {
  PENDING: 'rose',
  CONTACTED: 'sky',
  VISIT_SCHEDULED: 'amber',
  VISITED: 'brand',
  ESCALATED: 'purple',
  RESOLVED: 'neutral',
};

export default function AshaEmergencyAlertsSection() {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [modalType, setModalType] = useState(null); // 'DETAILS', 'SCHEDULE', 'ESCALATE', 'RESOLVE'
  const [actionNotes, setActionNotes] = useState('');

  const loadAlerts = async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const workerId = user?.workerId || user?.id || 10;
      const data = await fetchAshaEmergencyAlerts(workerId);
      setAlerts(data);
    } catch (err) {
      console.error('[AshaEmergencyAlertsSection] Error loading alerts:', err);
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts();
    // Real-time polling every 20 seconds
    const timer = setInterval(() => {
      loadAlerts(true);
    }, 20000);
    return () => clearInterval(timer);
  }, [user]);

  const handleOpenModal = async (alert, type) => {
    setSelectedAlert(alert);
    setModalType(type);
    setActionNotes('');
    if (type === 'DETAILS') {
      try {
        const full = await fetchEmergencyAlertById(alert.id);
        if (full) setSelectedAlert(full);
      } catch (err) {
        console.warn('Failed to refresh details:', err);
      }
    }
  };

  const handleCloseModal = () => {
    setSelectedAlert(null);
    setModalType(null);
    setActionNotes('');
  };

  const handleStatusChange = async (alertId, newStatus, customNotes = '') => {
    setIsActionLoading(true);
    try {
      await updateEmergencyAlertStatus(alertId, {
        status: newStatus,
        notes: customNotes,
        performedBy: user?.name || user?.fullName || 'ASHA Worker',
        performedRole: 'ASHA_WORKER',
      });
      toast.success(`Case marked as ${newStatus.replace('_', ' ')}`);
      handleCloseModal();
      loadAlerts(true);
    } catch (err) {
      toast.error(err?.message || 'Failed to update alert status');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleEscalateSubmit = async () => {
    if (!actionNotes.trim()) {
      toast.error('Please enter the reason for escalation to Health Officer.');
      return;
    }
    setIsActionLoading(true);
    try {
      await escalateEmergencyAlert(selectedAlert.id, {
        reason: actionNotes.trim(),
        performedBy: user?.name || user?.fullName || 'ASHA Worker',
        performedRole: 'ASHA_WORKER',
      });
      toast.success('Emergency alert escalated to District Health Officer immediately.');
      handleCloseModal();
      loadAlerts(true);
    } catch (err) {
      toast.error(err?.message || 'Failed to escalate alert');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleResolveSubmit = async () => {
    setIsActionLoading(true);
    try {
      await resolveEmergencyAlert(
        selectedAlert.id,
        actionNotes.trim() || 'Case resolved by assigned ASHA Worker.',
        user?.name || user?.fullName || 'ASHA Worker'
      );
      toast.success('Emergency alert resolved. Citizen notified automatically.');
      handleCloseModal();
      loadAlerts(true);
    } catch (err) {
      toast.error(err?.message || 'Failed to resolve alert');
    } finally {
      setIsActionLoading(false);
    }
  };

  const activeAlertsCount = alerts.filter((a) => a.status !== 'RESOLVED').length;
  const criticalCount = alerts.filter((a) => a.urgencyLevel === 'CRITICAL' && a.status !== 'RESOLVED').length;

  return (
    <div className="surface-card overflow-hidden rounded-2xl border border-rose-500/30 p-5 sm:p-6 shadow-xl">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/60 pb-4 dark:border-white/10">
        <div className="flex items-center gap-3">
          <span className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
            <HeartPulse className="h-5 w-5 animate-pulse" />
            {criticalCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500" />
              </span>
            )}
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                Assigned Citizen Emergency Alerts
              </h2>
              {activeAlertsCount > 0 && (
                <span className="rounded-full bg-rose-500 px-2 py-0.5 text-[11px] font-bold text-white">
                  {activeAlertsCount} Active
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Automated AI triage stream routed strictly to you as the citizen's assigned ASHA Worker.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => loadAlerts()}
            disabled={isLoading}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200/80 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Alert Feed */}
      <div className="mt-4 space-y-3">
        {isLoading && alerts.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">Loading emergency alerts...</div>
        ) : alerts.length === 0 ? (
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-6 text-center">
            <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-500" />
            <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-white">No active emergency alerts</p>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              All assigned citizens are currently stable. HealthGuard AI will alert you automatically if high urgency symptoms are detected.
            </p>
          </div>
        ) : (
          alerts.map((alert) => {
            const isCritical = alert.urgencyLevel === 'CRITICAL';
            const isPending = alert.status === 'PENDING';

            return (
              <motion.div
                key={alert.id}
                layout
                className={`rounded-xl border p-4 transition-all ${
                  isCritical
                    ? 'border-rose-500/50 bg-rose-500/5 hover:bg-rose-500/10'
                    : 'border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 dark:border-white/10 dark:bg-white/[0.02]'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left: Citizen Info & Symptoms */}
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-bold text-slate-900 dark:text-white">
                        {alert.citizenName}
                      </p>
                      <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                        <MapPin className="h-3 w-3 text-slate-400" /> {alert.village || 'Assigned Village'}
                      </span>
                      <Badge tone={isCritical ? 'critical' : 'rose'}>
                        {alert.urgencyLevel} URGENCY
                      </Badge>
                      <Badge tone={STATUS_TONE[alert.status] || 'neutral'}>
                        {alert.status.replace('_', ' ')}
                      </Badge>
                    </div>

                    <p className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                      <span className="font-semibold text-slate-900 dark:text-white">Symptoms:</span>{' '}
                      {alert.symptoms}
                    </p>

                    <div className="flex items-center gap-4 text-[11px] text-slate-400 flex-wrap">
                      <span>Category: <strong className="text-slate-600 dark:text-slate-300">{alert.diseaseCategory}</strong></span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {alert.createdAt ? new Date(alert.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' }) : ''}
                      </span>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                    <button
                      type="button"
                      onClick={() => handleOpenModal(alert, 'DETAILS')}
                      className="flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5 cursor-pointer"
                    >
                      <Eye className="h-3.5 w-3.5 text-slate-400" /> View Details
                    </button>

                    <a
                      href="tel:108"
                      className="flex items-center gap-1 rounded-lg bg-rose-500/10 px-2.5 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-500/20 dark:text-rose-400"
                    >
                      <PhoneCall className="h-3.5 w-3.5" /> Call Citizen
                    </a>

                    {isPending && (
                      <button
                        type="button"
                        onClick={() => handleStatusChange(alert.id, 'CONTACTED')}
                        disabled={isActionLoading}
                        className="flex items-center gap-1 rounded-lg bg-sky-600 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-sky-700 cursor-pointer disabled:opacity-50"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" /> Mark Contacted
                      </button>
                    )}

                    {alert.status === 'CONTACTED' && (
                      <button
                        type="button"
                        onClick={() => handleOpenModal(alert, 'SCHEDULE')}
                        disabled={isActionLoading}
                        className="flex items-center gap-1 rounded-lg bg-amber-600 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-amber-700 cursor-pointer disabled:opacity-50"
                      >
                        <CalendarPlus className="h-3.5 w-3.5" /> Schedule Visit
                      </button>
                    )}

                    {alert.status === 'VISIT_SCHEDULED' && (
                      <button
                        type="button"
                        onClick={() => handleStatusChange(alert.id, 'VISITED', 'Home visit completed.')}
                        disabled={isActionLoading}
                        className="flex items-center gap-1 rounded-lg bg-brand-600 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-brand-700 cursor-pointer disabled:opacity-50"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" /> Mark Visited
                      </button>
                    )}

                    {alert.status !== 'ESCALATED' && alert.status !== 'RESOLVED' && (
                      <button
                        type="button"
                        onClick={() => handleOpenModal(alert, 'ESCALATE')}
                        disabled={isActionLoading}
                        className="flex items-center gap-1 rounded-lg border border-purple-500/30 bg-purple-500/10 px-2.5 py-1.5 text-xs font-semibold text-purple-600 hover:bg-purple-500/20 dark:text-purple-400 cursor-pointer disabled:opacity-50"
                      >
                        <Share2 className="h-3.5 w-3.5" /> Escalate
                      </button>
                    )}

                    {alert.status !== 'RESOLVED' && (
                      <button
                        type="button"
                        onClick={() => handleOpenModal(alert, 'RESOLVE')}
                        disabled={isActionLoading}
                        className="flex items-center gap-1 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1.5 text-xs font-semibold text-emerald-600 hover:bg-emerald-500/20 dark:text-emerald-400 cursor-pointer disabled:opacity-50"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" /> Resolve Case
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* MODAL SYSTEM */}
      <AnimatePresence>
        {selectedAlert && modalType && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="surface-card w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200/80 p-6 shadow-2xl dark:border-white/10 space-y-4"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-slate-200/60 pb-3 dark:border-white/10">
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400">
                    <Siren className="h-4 w-4" />
                  </span>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                    {modalType === 'DETAILS' && `Emergency Alert #${selectedAlert.id} Details`}
                    {modalType === 'SCHEDULE' && `Schedule Home Visit for ${selectedAlert.citizenName}`}
                    {modalType === 'ESCALATE' && `Escalate Alert #${selectedAlert.id} to Health Officer`}
                    {modalType === 'RESOLVE' && `Resolve Emergency Case #${selectedAlert.id}`}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-white/5 cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Modal Body: DETAILS */}
              {modalType === 'DETAILS' && (
                <div className="space-y-3 text-xs">
                  <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-50 p-3 dark:bg-white/5">
                    <div>
                      <span className="text-slate-400">Citizen:</span>
                      <p className="font-semibold text-slate-900 dark:text-white">{selectedAlert.citizenName}</p>
                    </div>
                    <div>
                      <span className="text-slate-400">Village:</span>
                      <p className="font-semibold text-slate-900 dark:text-white">{selectedAlert.village}</p>
                    </div>
                    <div>
                      <span className="text-slate-400">Urgency:</span>
                      <p className="font-semibold text-rose-600 dark:text-rose-400">{selectedAlert.urgencyLevel} (Score: {selectedAlert.urgencyScore})</p>
                    </div>
                    <div>
                      <span className="text-slate-400">Current Status:</span>
                      <p className="font-semibold text-slate-900 dark:text-white">{selectedAlert.status}</p>
                    </div>
                  </div>

                  <div>
                    <span className="text-slate-400 font-semibold">Reported Symptoms:</span>
                    <p className="mt-1 rounded-xl border border-slate-200/60 bg-slate-50/50 p-3 text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200">
                      {selectedAlert.symptoms}
                    </p>
                  </div>

                  {selectedAlert.notes && (
                    <div>
                      <span className="text-slate-400 font-semibold">Clinical Notes:</span>
                      <p className="mt-1 whitespace-pre-wrap rounded-xl border border-slate-200/60 bg-slate-50/50 p-3 text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200">
                        {selectedAlert.notes}
                      </p>
                    </div>
                  )}

                  {/* Timeline History */}
                  <div>
                    <span className="text-slate-400 font-semibold flex items-center gap-1">
                      <History className="h-3.5 w-3.5" /> Case Audit Timeline:
                    </span>
                    <div className="mt-2 space-y-2 max-h-40 overflow-y-auto pr-1">
                      {selectedAlert.timeline && selectedAlert.timeline.length > 0 ? (
                        selectedAlert.timeline.map((item) => (
                          <div key={item.id} className="rounded-lg border border-slate-200/50 bg-slate-50/40 p-2 text-[11px] dark:border-white/5 dark:bg-white/[0.02]">
                            <div className="flex items-center justify-between">
                              <strong className="text-slate-900 dark:text-white">{item.action}</strong>
                              <span className="text-slate-400">
                                {item.timestamp ? new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                              </span>
                            </div>
                            <p className="text-slate-500 dark:text-slate-400 mt-0.5">By {item.performedBy} ({item.performedRole})</p>
                            {item.notes && <p className="text-slate-600 dark:text-slate-300 mt-0.5 italic">{item.notes}</p>}
                          </div>
                        ))
                      ) : (
                        <p className="text-slate-400 text-[11px]">No timeline events logged.</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Modal Body: SCHEDULE VISIT */}
              {modalType === 'SCHEDULE' && (
                <div className="space-y-3 text-xs">
                  <p className="text-slate-600 dark:text-slate-300">
                    Schedule an urgent household visit for citizen <strong>{selectedAlert.citizenName}</strong>.
                  </p>
                  <textarea
                    rows={3}
                    value={actionNotes}
                    onChange={(e) => setActionNotes(e.target.value)}
                    placeholder="Enter visit details (e.g. 'Visiting today at 4:30 PM with vital monitoring kit')..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-xs text-slate-900 focus:border-amber-500 focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-white"
                  />
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className="rounded-lg border border-slate-200 px-3 py-1.5 font-semibold text-slate-700 hover:bg-slate-100 dark:border-white/10 dark:text-slate-300"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStatusChange(selectedAlert.id, 'VISIT_SCHEDULED', actionNotes || 'Visit scheduled.')}
                      disabled={isActionLoading}
                      className="rounded-lg bg-amber-600 px-4 py-1.5 font-semibold text-white hover:bg-amber-700 disabled:opacity-50"
                    >
                      Confirm Schedule
                    </button>
                  </div>
                </div>
              )}

              {/* Modal Body: ESCALATE */}
              {modalType === 'ESCALATE' && (
                <div className="space-y-3 text-xs">
                  <p className="text-slate-600 dark:text-slate-300">
                    Escalate this emergency case directly to the <strong>District Health Officer</strong>. Immediate alert dispatch will be sent to the officer dashboard.
                  </p>
                  <textarea
                    rows={3}
                    value={actionNotes}
                    onChange={(e) => setActionNotes(e.target.value)}
                    placeholder="State reason for escalation (e.g. 'Citizen condition deteriorating, urgent PHC ambulance required')..."
                    className="w-full rounded-xl border border-rose-300 bg-rose-50/30 p-3 text-xs text-slate-900 focus:border-rose-500 focus:outline-none dark:border-rose-500/30 dark:bg-rose-950/20 dark:text-white"
                  />
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className="rounded-lg border border-slate-200 px-3 py-1.5 font-semibold text-slate-700 hover:bg-slate-100 dark:border-white/10 dark:text-slate-300"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleEscalateSubmit}
                      disabled={isActionLoading}
                      className="rounded-lg bg-rose-600 px-4 py-1.5 font-semibold text-white hover:bg-rose-700 disabled:opacity-50"
                    >
                      Confirm Escalation
                    </button>
                  </div>
                </div>
              )}

              {/* Modal Body: RESOLVE */}
              {modalType === 'RESOLVE' && (
                <div className="space-y-3 text-xs">
                  <p className="text-slate-600 dark:text-slate-300">
                    Mark emergency case for <strong>{selectedAlert.citizenName}</strong> as RESOLVED. An automated resolution notice will be dispatched to the citizen.
                  </p>
                  <textarea
                    rows={3}
                    value={actionNotes}
                    onChange={(e) => setActionNotes(e.target.value)}
                    placeholder="Enter resolution summary (e.g. 'Vitals stabilized. Administered medication and advised rest')..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-white"
                  />
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className="rounded-lg border border-slate-200 px-3 py-1.5 font-semibold text-slate-700 hover:bg-slate-100 dark:border-white/10 dark:text-slate-300"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleResolveSubmit}
                      disabled={isActionLoading}
                      className="rounded-lg bg-emerald-600 px-4 py-1.5 font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                    >
                      Resolve & Notify Citizen
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
