import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Bell,
  CheckCheck,
  Trash2,
  CheckCircle2,
  Radio,
  Home,
  AlertTriangle,
  Baby,
  HeartPulse,
  Filter,
  RefreshCw,
} from 'lucide-react';
import { useNotifications } from '../../contexts/NotificationContext';
import { useAuth } from '../../contexts/AuthContext';
import { ROLES } from '../../constants/roles';
import { Spinner } from '../../components/common/Loader';
import Badge from '../../components/common/Badge';
import { cn } from '../../utils/cn';
import PharmacistNotifications from '../Pharmacist/PharmacistNotifications';

const PRIORITY_TONE = {
  CRITICAL: 'rose',
  HIGH: 'amber',
  MEDIUM: 'brand',
  LOW: 'sky',
};

const TYPE_CONFIG = {
  HEALTH_OFFICER_BROADCAST: { label: 'Broadcast', icon: Radio, tone: 'brand' },
  BROADCAST: { label: 'Broadcast', icon: Radio, tone: 'brand' },
  CITIZEN_ASSIGNMENT: { label: 'Citizen Assignment', icon: Home, tone: 'teal' },
  HOME_VISIT: { label: 'Home Visit', icon: Home, tone: 'emerald' },
  DISEASE_SURVEILLANCE: { label: 'Disease Alert', icon: AlertTriangle, tone: 'rose' },
  DISEASE_ALERT: { label: 'Disease Alert', icon: AlertTriangle, tone: 'rose' },
  CHILD_HEALTH: { label: 'Child Health', icon: Baby, tone: 'purple' },
  REFERRAL: { label: 'Referral', icon: HeartPulse, tone: 'amber' },
  SYSTEM: { label: 'System', icon: Bell, tone: 'sky' },
  CAMPAIGN: { label: 'Campaign', icon: Radio, tone: 'brand' },
  INFO: { label: 'Alert', icon: Bell, tone: 'sky' },
  WARNING: { label: 'Warning', icon: AlertTriangle, tone: 'amber' },
  EMERGENCY: { label: 'Emergency', icon: AlertTriangle, tone: 'rose' },
};

const isBroadcastNotification = (n) => {
  const type = (n.type || '').toUpperCase();
  const refType = (n.referenceType || n.reference_type || '').toUpperCase();
  const refId = (n.referenceId || n.reference_id || '').toUpperCase();
  const cat = (n.category || '').toUpperCase();
  return (
    type.includes('BROADCAST') ||
    refType === 'BROADCAST' ||
    refId.startsWith('BROADCAST') ||
    cat.includes('BROADCAST') ||
    type === 'HEALTH_OFFICER_BROADCAST'
  );
};

const OFFICER_FILTER_TABS = [
  { key: 'ALL', label: 'All' },
  { key: 'UNREAD', label: 'Unread' },
  { key: 'DISEASE_ALERT', label: 'Disease Alerts' },
  { key: 'REFERRAL', label: 'Referrals' },
  { key: 'OUTBREAK_ALERT', label: 'Outbreak Alerts' },
  { key: 'CAMPAIGN', label: 'Campaign Updates' },
  { key: 'SYSTEM', label: 'System Notifications' },
];

const DEFAULT_FILTER_TABS = [
  { key: 'ALL', label: 'All' },
  { key: 'UNREAD', label: 'Unread' },
  { key: 'BROADCAST', label: 'Broadcast' },
  { key: 'HOME_VISIT', label: 'Home Visits' },
  { key: 'DISEASE_SURVEILLANCE', label: 'Disease Alerts' },
  { key: 'CHILD_HEALTH', label: 'Child Health' },
  { key: 'REFERRAL', label: 'Referrals' },
];

export default function Notifications() {
  const { role } = useAuth();
  const {
    notifications,
    isLoading,
    unreadCount,
    loadNotifications,
    markAsRead,
    markAllAsRead,
    removeNotification,
    normalizedRole,
    userVillage,
  } = useNotifications();

  const [activeTab, setActiveTab] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const isOfficer = normalizedRole === 'HEALTH_OFFICER';
  const filterTabs = isOfficer ? OFFICER_FILTER_TABS : DEFAULT_FILTER_TABS;

  useEffect(() => {
    if (role !== ROLES.PHARMACIST) {
      loadNotifications();
    }
  }, [loadNotifications, role]);

  if (role === ROLES.PHARMACIST) {
    return <PharmacistNotifications />;
  }

  // Filtered notifications
  const filteredNotifications = useMemo(() => {
    return notifications.filter((n) => {
      const isUnread = !n.read && !n.isRead;
      const typeStr = (n.type || '').toUpperCase();
      const isBcast = isBroadcastNotification(n);

      // Tab filter
      if (activeTab === 'UNREAD' && !isUnread) return false;

      if (isOfficer) {
        if (activeTab === 'DISEASE_ALERT' && !typeStr.includes('DISEASE') && !typeStr.includes('SURVEILLANCE')) return false;
        if (activeTab === 'REFERRAL' && !typeStr.includes('REFERRAL')) return false;
        if (activeTab === 'OUTBREAK_ALERT' && !typeStr.includes('OUTBREAK')) return false;
        if (activeTab === 'CAMPAIGN' && !typeStr.includes('CAMPAIGN')) return false;
        if (activeTab === 'SYSTEM' && !typeStr.includes('SYSTEM')) return false;
      } else {
        if (activeTab === 'BROADCAST' && !isBcast) return false;
        if (activeTab === 'HOME_VISIT' && !typeStr.includes('VISIT')) return false;
        if (activeTab === 'DISEASE_SURVEILLANCE' && !typeStr.includes('DISEASE')) return false;
        if (activeTab === 'CHILD_HEALTH' && !typeStr.includes('CHILD')) return false;
        if (activeTab === 'REFERRAL' && !typeStr.includes('REFERRAL')) return false;
      }

      // 4-field search: Title, Message, Village, Type, Source
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchesTitle = (n.title || '').toLowerCase().includes(term);
        const matchesMsg = (n.message || '').toLowerCase().includes(term);
        const matchesVillage = (n.village || '').toLowerCase().includes(term);
        const matchesType = (n.type || '').toLowerCase().includes(term);
        const matchesSource = (n.source || '').toLowerCase().includes(term);
        if (!matchesTitle && !matchesMsg && !matchesVillage && !matchesType && !matchesSource) return false;
      }

      return true;
    });
  }, [notifications, activeTab, searchTerm, isOfficer]);

  // Tab counts
  const tabCounts = useMemo(() => {
    const counts = { ALL: notifications.length };
    counts.UNREAD = notifications.filter((n) => !n.read && !n.isRead).length;

    if (isOfficer) {
      counts.DISEASE_ALERT = notifications.filter((n) => {
        const t = (n.type || '').toUpperCase();
        return t.includes('DISEASE') || t.includes('SURVEILLANCE');
      }).length;
      counts.REFERRAL = notifications.filter((n) => (n.type || '').toUpperCase().includes('REFERRAL')).length;
      counts.OUTBREAK_ALERT = notifications.filter((n) => (n.type || '').toUpperCase().includes('OUTBREAK')).length;
      counts.CAMPAIGN = notifications.filter((n) => (n.type || '').toUpperCase().includes('CAMPAIGN')).length;
      counts.SYSTEM = notifications.filter((n) => (n.type || '').toUpperCase().includes('SYSTEM')).length;
    } else {
      counts.BROADCAST = notifications.filter(isBroadcastNotification).length;
      counts.HOME_VISIT = notifications.filter((n) => (n.type || '').toUpperCase().includes('VISIT')).length;
      counts.DISEASE_SURVEILLANCE = notifications.filter((n) => (n.type || '').toUpperCase().includes('DISEASE')).length;
      counts.CHILD_HEALTH = notifications.filter((n) => (n.type || '').toUpperCase().includes('CHILD')).length;
      counts.REFERRAL = notifications.filter((n) => (n.type || '').toUpperCase().includes('REFERRAL')).length;
    }
    return counts;
  }, [notifications, isOfficer]);

  console.log(
    `[NotificationsPage] User Role: ${normalizedRole}, User Village: ${userVillage || 'N/A'}, Loaded: ${notifications.length}, Filtered (${activeTab}): ${filteredNotifications.length}`
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="mx-auto max-w-4xl space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-white/10">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
            Notifications
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {unreadCount > 0
              ? `${unreadCount} unread alert${unreadCount > 1 ? 's' : ''} requiring attention`
              : 'You are all caught up. No pending alerts.'}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={loadNotifications}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
            title="Refresh notifications from database"
          >
            <RefreshCw className={cn('h-3.5 w-3.5', isLoading && 'animate-spin')} />
            Refresh
          </button>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={markAllAsRead}
              className="inline-flex items-center gap-1.5 rounded-xl bg-brand-500/10 px-3 py-2 text-xs font-semibold text-brand-600 dark:text-brand-400 hover:bg-brand-500/20 transition-colors"
            >
              <CheckCheck className="h-4 w-4" /> Mark all read
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {filterTabs.map((tab) => {
            const isSelected = activeTab === tab.key;
            const count = tabCounts[tab.key] || 0;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-2 font-medium whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-brand-500 text-white shadow-sm shadow-brand-500/20 font-semibold'
                    : 'bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5'
                }`}
              >
                <span>{tab.label}</span>
                {count > 0 && (
                  <span
                    className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="w-full md:w-64">
          <input
            type="text"
            placeholder="Search title, village, source..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/80 px-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {isLoading && (
          <div className="surface-card flex items-center justify-center gap-2 p-10 text-sm text-slate-500">
            <Spinner size={20} /> Loading notifications from database…
          </div>
        )}

        {!isLoading && filteredNotifications.length === 0 && (
          <div className="surface-card flex flex-col items-center gap-2.5 p-12 text-center text-sm text-slate-500 dark:text-slate-400 rounded-2xl border border-dashed border-slate-200 dark:border-white/10">
            <Bell className="h-8 w-8 text-slate-400 opacity-60 mb-1" />
            <p className="font-semibold text-slate-800 dark:text-slate-200">
              No notifications found
            </p>
            <p className="text-xs max-w-sm">
              {activeTab === 'ALL'
                ? 'No alerts recorded in the system. New events will appear here automatically.'
                : `No notifications currently match the "${filterTabs.find((t) => t.key === activeTab)?.label}" filter.`}
            </p>
          </div>
        )}

        {filteredNotifications.map((n, idx) => {
          const isUnread = !n.read && !n.isRead;
          const typeInfo = TYPE_CONFIG[n.type] || {
            label: n.type || 'Alert',
            icon: Bell,
            tone: 'brand',
          };
          const TypeIcon = typeInfo.icon;
          const key = n.id != null ? `notif-${n.id}-${idx}` : `notif-idx-${idx}`;

          return (
            <div
              key={key}
              className={cn(
                'surface-card group relative flex flex-col sm:flex-row sm:items-start justify-between gap-4 p-4.5 transition-all hover:border-slate-300 dark:hover:border-white/20',
                isUnread && 'border-l-4 border-l-brand-500 bg-brand-500/[0.02] dark:bg-brand-500/[0.04]'
              )}
            >
              <div className="flex items-start gap-3.5 flex-1 min-w-0">
                {/* Type Icon */}
                <span
                  className={cn(
                    'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-bold',
                    isUnread
                      ? 'bg-brand-500/15 text-brand-600 dark:text-brand-400'
                      : 'bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400'
                  )}
                >
                  <TypeIcon className="h-5 w-5" />
                </span>

                <div className="flex-1 min-w-0 space-y-1">
                  {/* Badges & Meta */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Priority Badge */}
                    <Badge tone={PRIORITY_TONE[n.priority] || 'brand'} className="text-[11px] font-bold px-2 py-0.5">
                      {n.priority || 'MEDIUM'}
                    </Badge>

                    {/* Type Badge */}
                    <span className="rounded-lg bg-slate-100 dark:bg-white/10 px-2 py-0.5 text-[11px] font-medium text-slate-700 dark:text-slate-300">
                      {typeInfo.label}
                    </span>

                    {/* Village */}
                    {n.village && (
                      <span className="rounded-lg bg-blue-50 dark:bg-blue-500/10 border border-blue-200/50 dark:border-blue-500/20 px-2 py-0.5 text-[11px] font-medium text-blue-700 dark:text-blue-300">
                        📍 {n.village}
                      </span>
                    )}

                    {/* Source */}
                    {n.source && (
                      <span className="rounded-lg bg-slate-100 dark:bg-white/5 px-2 py-0.5 text-[11px] font-medium text-slate-600 dark:text-slate-400">
                        Source: {n.source}
                      </span>
                    )}

                    {isUnread && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-brand-600 dark:text-brand-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-brand-500 animate-pulse" />
                        NEW
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white pt-0.5">
                    {n.title}
                  </h3>

                  {/* Message */}
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {n.message}
                  </p>

                  {/* Timestamp */}
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 pt-1">
                    {n.createdAt
                      ? new Date(n.createdAt).toLocaleDateString([], {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : 'Just now'}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0 sm:self-center pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-white/5">
                {isUnread ? (
                  <button
                    type="button"
                    onClick={() => markAsRead(n.id)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-brand-500/30 bg-brand-500/10 px-3 py-1.5 text-xs font-semibold text-brand-600 dark:text-brand-400 hover:bg-brand-500/20 transition-colors"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Mark Read
                  </button>
                ) : (
                  <span className="text-[11px] text-slate-400 flex items-center gap-1 px-2 py-1">
                    <CheckCheck className="h-3.5 w-3.5 text-emerald-500" /> Read
                  </span>
                )}

                <button
                  type="button"
                  onClick={() => removeNotification(n.id)}
                  aria-label="Delete notification"
                  className="rounded-xl p-2 text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10 dark:hover:text-rose-400"
                  title="Delete notification"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
