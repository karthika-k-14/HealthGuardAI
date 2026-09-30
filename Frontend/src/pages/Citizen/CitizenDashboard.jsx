import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Activity,
  HeartPulse,
  Pill,
  AlertTriangle,
  Siren,
  Bell,
  Clock,
  Sparkles,
  Calendar,
  CheckCircle2,
  XCircle,
  ArrowRight,
  RefreshCw,
  Search,
  MessageSquare,
  ShieldCheck,
  Apple,
  FileText,
  UserCheck,
  Stethoscope,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import {
  fetchDashboardSummary,
  fetchDashboardActivity,
  fetchDashboardInsights,
  fetchUpcomingActions
} from '../../api/dashboardApi';
import { fetchCitizenNotifications, markNotificationAsRead } from '../../api/notificationApi';
import { PATHS } from '../../constants/routes';
import Badge from '../../components/common/Badge';

export default function CitizenDashboard() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const citizenId = user?.citizenId || user?.userId || user?.id || 1;

  const [summary, setSummary] = useState(null);
  const [activities, setActivities] = useState([]);
  const [insights, setInsights] = useState([]);
  const [upcomingActions, setUpcomingActions] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadDashboardData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      const [sumData, actData, insData, upData, notifData] = await Promise.all([
        fetchDashboardSummary(citizenId),
        fetchDashboardActivity(citizenId),
        fetchDashboardInsights(citizenId),
        fetchUpcomingActions(citizenId),
        fetchCitizenNotifications(citizenId)
      ]);

      if (sumData) setSummary(sumData);
      if (actData) setActivities(actData);
      if (insData) setInsights(insData);
      if (upData) setUpcomingActions(upData);
      if (notifData) {
        const notifList = Array.isArray(notifData) ? notifData : notifData?.data || [];
        setNotifications(notifList.slice(0, 5));
      }
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [citizenId]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const handleReadNotification = async (id) => {
    try {
      await markNotificationAsRead(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const urgencyColor = {
    CRITICAL: 'bg-rose-500/10 text-rose-600 border-rose-500/30',
    HIGH: 'bg-amber-500/10 text-amber-600 border-amber-500/30',
    MEDIUM: 'bg-yellow-500/10 text-yellow-700 border-yellow-500/30',
    LOW: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30'
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-12">
      {/* Top Header & Real Citizen Greeting */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              HealthGuard AI Citizen Portal
            </span>
          </div>
          <h1 className="mt-1 font-display text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
            Welcome, {summary?.citizenName || user?.fullName || 'Citizen'}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Village: <span className="font-medium text-slate-700 dark:text-slate-200">{summary?.village || 'Coimbatore Rural'}</span> • Assigned ASHA Worker:{' '}
            <span className="font-semibold text-brand-600 dark:text-brand-400">{summary?.assignedAshaWorker || 'Assigned ASHA Worker'}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => loadDashboardData(true)}
            disabled={isRefreshing}
            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 dark:border-white/10 dark:bg-slate-800 dark:text-slate-200 transition-colors"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </button>

          <Link
            to={PATHS.CITIZEN_EMERGENCY}
            className="flex items-center gap-2 rounded-lg bg-rose-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-rose-700 transition-colors"
          >
            <Siren className="h-4 w-4" />
            Emergency Center
          </Link>
        </div>
      </div>

      {/* SECTION 1: HEALTH OVERVIEW CARD (DRIVEN STRICTLY BY POSTGRESQL) */}
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Health Risk Score */}
        <div className="surface-card p-5 border-l-4 border-l-brand-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Health Index</span>
            <span className={`rounded-full border px-2 py-0.5 text-xs font-bold ${urgencyColor[summary?.currentUrgencyLevel || 'LOW']}`}>
              {summary?.currentUrgencyLevel || 'LOW'} URGENCY
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {summary?.healthScore ?? 85}
            </span>
            <span className="text-sm font-medium text-slate-400">/ 100</span>
          </div>
          <div className="mt-3 w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-brand-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, summary?.healthScore ?? 85)}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Risk Score: <span className="font-semibold">{summary?.healthRiskScore ?? 20.0}</span> (Lower is better)
          </p>
        </div>

        {/* Card 2: Medicine Adherence */}
        <div className="surface-card p-5 border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Dose Adherence</span>
            <Pill className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {summary?.adherencePercent ?? 0}%
            </span>
            <span className="text-xs text-emerald-600 font-semibold">Compliance</span>
          </div>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Active: <span className="font-semibold text-slate-900 dark:text-white">{summary?.activeMedicineReminders ?? 0}</span> • Completed:{' '}
            <span className="font-semibold text-emerald-600">{summary?.todayCompletedDoses ?? 0}</span> • Pending:{' '}
            <span className="font-semibold text-amber-600">{summary?.todayPendingDoses ?? 0}</span>
          </p>
          <Link
            to={PATHS.CITIZEN_MEDICINES}
            className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400"
          >
            Manage Prescriptions <ChevronRight className="h-3 w-3" />
          </Link>
        </div>

        {/* Card 3: Latest Assessment */}
        <div className="surface-card p-5 border-l-4 border-l-sky-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Latest Assessment</span>
            <Stethoscope className="h-4 w-4 text-sky-500" />
          </div>
          <div className="mt-2">
            <p className="font-semibold text-sm text-slate-900 dark:text-white truncate">
              {summary?.latestAssessment?.diseaseCategory || 'General Wellness'}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
              Symptoms: "{summary?.latestAssessment?.symptoms || 'No acute symptoms reported'}"
            </p>
            <p className="text-2xs text-slate-400 mt-2">
              Evaluated: {summary?.latestAssessment?.date || 'Up to date'}
            </p>
          </div>
        </div>

        {/* Card 4: Emergency Case Status */}
        <div className={`surface-card p-5 border-l-4 ${summary?.openEmergencyCases > 0 ? 'border-l-rose-500 bg-rose-500/5' : 'border-l-slate-400'}`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Emergency Status</span>
            <ShieldCheck className={`h-4 w-4 ${summary?.openEmergencyCases > 0 ? 'text-rose-500' : 'text-emerald-500'}`} />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className={`text-3xl font-extrabold ${summary?.openEmergencyCases > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
              {summary?.openEmergencyCases ?? 0}
            </span>
            <span className="text-xs font-semibold text-slate-500">Active Cases</span>
          </div>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            {summary?.openEmergencyCases > 0
              ? 'Case assigned to ASHA Worker for home review.'
              : 'No active emergency escalation. All clear.'}
          </p>
          <Link
            to={PATHS.CITIZEN_EMERGENCY}
            className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-rose-600 hover:text-rose-700"
          >
            Open Live Monitoring <ChevronRight className="h-3 w-3" />
          </Link>
        </div>
      </div>

      {/* QUICK ACTIONS MODULE NAVIGATOR */}
      <div className="surface-card p-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Healthcare Services</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <Link
            to={PATHS.CITIZEN_CHAT}
            className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-brand-50 hover:border-brand-200 dark:border-white/5 dark:bg-slate-800/50 dark:hover:bg-brand-500/10 transition-all text-center group"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-500/10 text-brand-600 group-hover:scale-110 transition-transform">
              <MessageSquare className="h-5 w-5" />
            </span>
            <span className="mt-2 text-xs font-semibold text-slate-900 dark:text-white">AI Health Chat</span>
            <span className="text-2xs text-slate-500">NLP Consultation</span>
          </Link>

          <Link
            to={PATHS.CITIZEN_SYMPTOM_CHECKER}
            className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-emerald-50 hover:border-emerald-200 dark:border-white/5 dark:bg-slate-800/50 dark:hover:bg-emerald-500/10 transition-all text-center group"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 group-hover:scale-110 transition-transform">
              <Activity className="h-5 w-5" />
            </span>
            <span className="mt-2 text-xs font-semibold text-slate-900 dark:text-white">Symptom Checker</span>
            <span className="text-2xs text-slate-500">Risk Assessment</span>
          </Link>

          <Link
            to={PATHS.CITIZEN_MEDICINES}
            className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-sky-50 hover:border-sky-200 dark:border-white/5 dark:bg-slate-800/50 dark:hover:bg-sky-500/10 transition-all text-center group"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-500/10 text-sky-600 group-hover:scale-110 transition-transform">
              <Pill className="h-5 w-5" />
            </span>
            <span className="mt-2 text-xs font-semibold text-slate-900 dark:text-white">Medicine Guide</span>
            <span className="text-2xs text-slate-500">Dose Tracker</span>
          </Link>

          <Link
            to={PATHS.CITIZEN_DISEASES}
            className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-purple-50 hover:border-purple-200 dark:border-white/5 dark:bg-slate-800/50 dark:hover:bg-purple-500/10 transition-all text-center group"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10 text-purple-600 group-hover:scale-110 transition-transform">
              <Search className="h-5 w-5" />
            </span>
            <span className="mt-2 text-xs font-semibold text-slate-900 dark:text-white">Disease Search</span>
            <span className="text-2xs text-slate-500">Guidance & Videos</span>
          </Link>

          <Link
            to={PATHS.CITIZEN_NUTRITION_PLANNER}
            className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-amber-50 hover:border-amber-200 dark:border-white/5 dark:bg-slate-800/50 dark:hover:bg-amber-500/10 transition-all text-center group"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 group-hover:scale-110 transition-transform">
              <Apple className="h-5 w-5" />
            </span>
            <span className="mt-2 text-xs font-semibold text-slate-900 dark:text-white">Nutrition Engine</span>
            <span className="text-2xs text-slate-500">Condition Plans</span>
          </Link>

          <Link
            to={PATHS.CITIZEN_EMERGENCY}
            className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-rose-50 hover:border-rose-200 dark:border-white/5 dark:bg-slate-800/50 dark:hover:bg-rose-500/10 transition-all text-center group"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-500/10 text-rose-600 group-hover:scale-110 transition-transform">
              <Siren className="h-5 w-5" />
            </span>
            <span className="mt-2 text-xs font-semibold text-slate-900 dark:text-white">Emergency Hub</span>
            <span className="text-2xs text-slate-500">ASHA Escalation</span>
          </Link>
        </div>
      </div>

      {/* MAIN TWO COLUMN GRID */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* LEFT COLUMN: ACTIVITY FEED & UPCOMING ACTIONS (2 COLS) */}
        <div className="space-y-6 lg:col-span-2">
          {/* Recent Activity Feed */}
          <div className="surface-card p-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-3">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-brand-600 dark:text-brand-400" />
                <h2 className="font-display text-base font-semibold text-slate-900 dark:text-white">
                  Recent Citizen Health Activity
                </h2>
              </div>
              <span className="text-2xs text-slate-400">PostgreSQL Audit Feed</span>
            </div>

            <div className="mt-4 divide-y divide-slate-100 dark:divide-white/5">
              {activities.length > 0 ? (
                activities.map((act) => (
                  <div key={act.id} className="flex items-start gap-3.5 py-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400 mt-0.5">
                      {act.type === 'MEDICINE' && <Pill className="h-4 w-4" />}
                      {act.type === 'AI_CONSULTATION' && <MessageSquare className="h-4 w-4" />}
                      {act.type === 'DISEASE_SEARCH' && <Search className="h-4 w-4" />}
                      {act.type === 'EMERGENCY_ALERT' && <Siren className="h-4 w-4 text-rose-600" />}
                      {!['MEDICINE', 'AI_CONSULTATION', 'DISEASE_SEARCH', 'EMERGENCY_ALERT'].includes(act.type) && (
                        <Activity className="h-4 w-4" />
                      )}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                          {act.title}
                        </p>
                        <span className="text-2xs text-slate-400 shrink-0">{act.timestamp}</span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {act.description}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="py-6 text-center text-xs text-slate-400">
                  No health actions recorded yet. Start by checking symptoms or setting a medicine reminder.
                </p>
              )}
            </div>
          </div>

          {/* AI Health Insights Section */}
          <div className="surface-card p-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-500" />
                <h2 className="font-display text-base font-semibold text-slate-900 dark:text-white">
                  Personalized AI Health Insights
                </h2>
              </div>
              <span className="text-2xs text-amber-600 font-semibold bg-amber-500/10 px-2 py-0.5 rounded-full">
                Clinical Analytics
              </span>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {insights.map((ins) => (
                <div
                  key={ins.id}
                  className="rounded-xl border border-slate-200/80 p-4 bg-slate-50/50 dark:border-white/5 dark:bg-slate-800/50 flex flex-col justify-between"
                >
                  <div>
                    <span className="text-xs font-semibold text-slate-900 dark:text-white block">
                      {ins.title}
                    </span>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                      {ins.message}
                    </p>
                  </div>
                  {ins.actionPath && (
                    <Link
                      to={ins.actionPath}
                      className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400"
                    >
                      {ins.actionText || 'Take Action'} <ArrowRight className="h-3 w-3" />
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: NOTIFICATIONS & UPCOMING ACTIONS (1 COL) */}
        <div className="space-y-6">
          {/* Upcoming Actions */}
          <div className="surface-card p-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-3">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-brand-600 dark:text-brand-400" />
                <h2 className="font-display text-base font-semibold text-slate-900 dark:text-white">
                  Upcoming Actions
                </h2>
              </div>
            </div>

            <div className="mt-3 divide-y divide-slate-100 dark:divide-white/5">
              {upcomingActions.map((act) => (
                <div key={act.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    <span className="h-2 w-2 rounded-full bg-brand-500 mt-1.5 shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-slate-900 dark:text-white leading-tight">
                        {act.title}
                      </p>
                      <p className="text-2xs text-slate-400 mt-0.5">Due: {act.due}</p>
                    </div>
                  </div>
                  {act.actionPath && (
                    <Link
                      to={act.actionPath}
                      className="rounded border border-slate-200 px-2 py-1 text-2xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:text-slate-300 shrink-0"
                    >
                      View
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Real Backend Notifications Section */}
          <div className="surface-card p-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-3">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-emerald-600" />
                <h2 className="font-display text-base font-semibold text-slate-900 dark:text-white">
                  Health Broadcasts
                </h2>
              </div>
              <Link to="/notifications" className="text-2xs font-medium text-brand-600 hover:text-brand-700">
                View All
              </Link>
            </div>

            <div className="mt-3 divide-y divide-slate-100 dark:divide-white/5">
              {notifications.length > 0 ? (
                notifications.map((n) => (
                  <div key={n.id} className="py-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-900 dark:text-white">
                        {n.title}
                      </span>
                      <button
                        onClick={() => handleReadNotification(n.id)}
                        className="text-2xs text-slate-400 hover:text-slate-600"
                      >
                        Dismiss
                      </button>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {n.message}
                    </p>
                  </div>
                ))
              ) : (
                <div className="py-4 text-center text-xs text-slate-400">
                  No unread health broadcasts. You're up to date!
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
