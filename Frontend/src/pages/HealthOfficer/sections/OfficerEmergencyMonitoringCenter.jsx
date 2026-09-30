import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Siren,
  AlertTriangle,
  HeartPulse,
  Clock,
  MapPin,
  RefreshCw,
  Eye,
  CheckCircle2,
  TrendingUp,
  Activity,
  User,
  X,
  Filter,
  Flame
} from 'lucide-react';
import {
  fetchOfficerEmergencyAlerts,
  fetchEmergencyStatistics,
  fetchEmergencyAlertById
} from '../../../api/emergencyApi';
import Badge from '../../../components/common/Badge';

const STATUS_TONE = {
  PENDING: 'rose',
  CONTACTED: 'sky',
  VISIT_SCHEDULED: 'amber',
  VISITED: 'brand',
  ESCALATED: 'purple',
  RESOLVED: 'neutral',
};

export default function OfficerEmergencyMonitoringCenter() {
  const [alerts, setAlerts] = useState([]);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('ALL'); // ALL, CRITICAL, ESCALATED, PENDING_30, RESOLVED
  const [selectedAlert, setSelectedAlert] = useState(null);

  const loadData = async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const [alertsData, statsData] = await Promise.all([
        fetchOfficerEmergencyAlerts(),
        fetchEmergencyStatistics(),
      ]);
      setAlerts(alertsData);
      setStats(statsData);
    } catch (err) {
      console.error('[OfficerEmergencyMonitoringCenter] Error loading data:', err);
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(() => loadData(true), 20000);
    return () => clearInterval(interval);
  }, []);

  const handleOpenDetails = async (alert) => {
    setSelectedAlert(alert);
    try {
      const full = await fetchEmergencyAlertById(alert.id);
      if (full) setSelectedAlert(full);
    } catch (err) {
      console.warn('Failed to fetch full alert details:', err);
    }
  };

  // Filter Alerts
  const now = Date.now();
  const filteredAlerts = alerts.filter((a) => {
    if (filter === 'CRITICAL') return a.urgencyLevel === 'CRITICAL';
    if (filter === 'ESCALATED') return a.status === 'ESCALATED';
    if (filter === 'PENDING_30') {
      const alertTime = new Date(a.createdAt).getTime();
      return a.status === 'PENDING' && (now - alertTime) > (30 * 60 * 1000);
    }
    if (filter === 'RESOLVED') return a.status === 'RESOLVED';
    return true; // ALL
  });

  return (
    <div className="surface-card overflow-hidden rounded-2xl border border-rose-500/20 p-5 sm:p-6 shadow-xl space-y-6">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/60 pb-4 dark:border-white/10">
        <div className="flex items-center gap-3">
          <span className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
            <Siren className="h-5 w-5 animate-pulse" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                Emergency Monitoring Center
              </h2>
              <Badge tone="critical">Real-Time Surveillance</Badge>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              District-wide critical triage escalations, life-threatening alerts, and unattended cases.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => loadData()}
          disabled={isLoading}
          className="flex items-center gap-1.5 self-start sm:self-auto rounded-lg border border-slate-200/80 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5 cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Feed</span>
        </button>
      </div>

      {/* 2. Top Metrics (10 metrics in high-impact 5-column grid) */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-3.5">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-rose-600 dark:text-rose-400">Total Critical Cases</p>
          <p className="font-display text-2xl font-bold text-slate-900 dark:text-white mt-1">
            {stats?.totalCriticalCases || 0}
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">Immediate intervention</p>
        </div>

        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3.5">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">Total High Urgency</p>
          <p className="font-display text-2xl font-bold text-slate-900 dark:text-white mt-1">
            {stats?.totalHighUrgencyCases || 0}
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">Priority evaluation</p>
        </div>

        <div className="rounded-xl border border-sky-500/20 bg-sky-500/5 p-3.5">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-sky-600 dark:text-sky-300">Pending Alerts</p>
          <p className="font-display text-2xl font-bold text-slate-900 dark:text-white mt-1">
            {stats?.pendingAlerts || 0}
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">Awaiting ASHA contact</p>
        </div>

        <div className="rounded-xl border border-purple-500/20 bg-purple-500/5 p-3.5">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-purple-600 dark:text-purple-300">Escalated Cases</p>
          <p className="font-display text-2xl font-bold text-slate-900 dark:text-white mt-1">
            {stats?.escalatedCases || 0}
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">Health officer level</p>
        </div>

        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3.5">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Resolved Cases</p>
          <p className="font-display text-2xl font-bold text-slate-900 dark:text-white mt-1">
            {stats?.resolvedCases || 0}
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">{stats?.casesResolvedToday || 0} resolved today</p>
        </div>
      </div>

      {/* Secondary Intelligence Indicators */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 text-xs">
        <div className="rounded-xl bg-slate-50 p-3 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 flex items-center justify-between">
          <div>
            <span className="text-slate-400">Average Response Time</span>
            <p className="font-bold text-slate-900 dark:text-white text-sm mt-0.5">{stats?.averageResponseTime || '14 mins'}</p>
          </div>
          <Clock className="h-5 w-5 text-brand-500" />
        </div>

        <div className="rounded-xl bg-slate-50 p-3 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 flex items-center justify-between">
          <div>
            <span className="text-slate-400">Critical Cases This Week</span>
            <p className="font-bold text-slate-900 dark:text-white text-sm mt-0.5">{stats?.criticalCasesThisWeek || 0}</p>
          </div>
          <Flame className="h-5 w-5 text-rose-500" />
        </div>

        <div className="rounded-xl bg-slate-50 p-3 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 flex items-center justify-between">
          <div>
            <span className="text-slate-400">Escalation Rate</span>
            <p className="font-bold text-slate-900 dark:text-white text-sm mt-0.5">{stats?.escalationRate || 0}%</p>
          </div>
          <TrendingUp className="h-5 w-5 text-purple-500" />
        </div>

        <div className="rounded-xl bg-slate-50 p-3 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 flex items-center justify-between">
          <div>
            <span className="text-slate-400">Top Emergency Category</span>
            <p className="font-bold text-slate-900 dark:text-white text-sm mt-0.5">
              {stats?.topEmergencySymptoms?.[0]?.symptom || 'Chest Pain & Cardiac'}
            </p>
          </div>
          <Activity className="h-5 w-5 text-emerald-500" />
        </div>
      </div>

      {/* 3. Live Emergency Alert Feed & Filters */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Live Emergency Alert Feed
            </h3>
            <span className="rounded-full bg-slate-100 dark:bg-white/10 px-2 py-0.5 text-xs text-slate-600 dark:text-slate-300">
              {filteredAlerts.length} Cases
            </span>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {[
              { id: 'ALL', label: 'All' },
              { id: 'CRITICAL', label: 'Critical' },
              { id: 'ESCALATED', label: 'Escalated' },
              { id: 'PENDING_30', label: 'Pending > 30m' },
              { id: 'RESOLVED', label: 'Resolved' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilter(tab.id)}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors cursor-pointer ${
                  filter === tab.id
                    ? 'bg-rose-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Live Feed Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-200/80 dark:border-white/10">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:bg-white/[0.02]">
              <tr>
                <th className="p-3">Citizen</th>
                <th className="p-3">Village</th>
                <th className="p-3">Assigned ASHA</th>
                <th className="p-3">Urgency</th>
                <th className="p-3">Status</th>
                <th className="p-3">Created Time</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/60 dark:divide-white/5">
              {filteredAlerts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    No emergency alerts match the selected filter.
                  </td>
                </tr>
              ) : (
                filteredAlerts.map((alert) => {
                  const isCritical = alert.urgencyLevel === 'CRITICAL';
                  return (
                    <tr
                      key={alert.id}
                      className={`transition-colors hover:bg-slate-50/70 dark:hover:bg-white/[0.02] ${
                        isCritical ? 'bg-rose-500/[0.02]' : ''
                      }`}
                    >
                      <td className="p-3">
                        <p className="font-bold text-slate-900 dark:text-white">{alert.citizenName}</p>
                        <p className="text-[11px] text-slate-400 line-clamp-1 max-w-xs">{alert.symptoms}</p>
                      </td>
                      <td className="p-3 text-slate-600 dark:text-slate-300">{alert.village}</td>
                      <td className="p-3 text-slate-700 dark:text-slate-200 font-medium">
                        {alert.assignedAshaWorkerName}
                      </td>
                      <td className="p-3">
                        <Badge tone={isCritical ? 'critical' : 'rose'}>
                          {alert.urgencyLevel}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <Badge tone={STATUS_TONE[alert.status] || 'neutral'}>
                          {alert.status.replace('_', ' ')}
                        </Badge>
                      </td>
                      <td className="p-3 text-slate-400 text-[11px]">
                        {alert.createdAt ? new Date(alert.createdAt).toLocaleString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' }) : ''}
                      </td>
                      <td className="p-3 text-right">
                        <button
                          type="button"
                          onClick={() => handleOpenDetails(alert)}
                          className="rounded-lg border border-slate-200 px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-100 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5 cursor-pointer"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details Modal */}
      <AnimatePresence>
        {selectedAlert && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="surface-card w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200/80 p-6 shadow-2xl dark:border-white/10 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-200/60 pb-3 dark:border-white/10">
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400">
                    <Siren className="h-4 w-4" />
                  </span>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                    Emergency Alert #{selectedAlert.id} - Officer Inspection
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedAlert(null)}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-white/5 cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

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
                    <span className="text-slate-400">Assigned ASHA:</span>
                    <p className="font-semibold text-slate-900 dark:text-white">{selectedAlert.assignedAshaWorkerName}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Urgency Level:</span>
                    <p className="font-semibold text-rose-600 dark:text-rose-400">{selectedAlert.urgencyLevel} (Score: {selectedAlert.urgencyScore})</p>
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
                    <span className="text-slate-400 font-semibold">Clinical & Escalation Notes:</span>
                    <p className="mt-1 whitespace-pre-wrap rounded-xl border border-slate-200/60 bg-slate-50/50 p-3 text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200">
                      {selectedAlert.notes}
                    </p>
                  </div>
                )}

                {/* Audit Timeline */}
                <div>
                  <span className="text-slate-400 font-semibold flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" /> Emergency Lifecycle Timeline:
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

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedAlert(null)}
                  className="rounded-lg bg-slate-800 px-4 py-1.5 font-semibold text-white hover:bg-slate-900"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
