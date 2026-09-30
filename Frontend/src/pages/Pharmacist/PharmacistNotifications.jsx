import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  AlertTriangle,
  PackageX,
  CalendarX2,
  ShoppingCart,
  CheckCheck,
  Trash2,
  RefreshCw,
  Clock,
  ShieldAlert,
  Boxes
} from 'lucide-react';
import {
  fetchPharmacyNotifications,
  markPharmacyNotificationRead,
  markAllPharmacyNotificationsRead,
  deletePharmacyNotification
} from '../../api/pharmacyApi';
import { Spinner } from '../../components/common/Loader';
import Badge from '../../components/common/Badge';
import { cn } from '../../utils/cn';

const CATEGORY_TABS = [
  { key: 'ALL', label: 'All', icon: Bell },
  { key: 'LOW_STOCK', label: 'Low Stock', icon: PackageX },
  { key: 'OUT_OF_STOCK', label: 'Out of Stock', icon: AlertTriangle },
  { key: 'EXPIRY_ALERT', label: 'Expiry', icon: CalendarX2 },
  { key: 'PROCUREMENT_APPROVED', label: 'Procurement', icon: ShoppingCart },
];

const PRIORITY_STYLES = {
  CRITICAL: 'bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-900/40',
  HIGH: 'bg-orange-500/15 text-orange-700 dark:text-orange-400 border border-orange-200 dark:border-orange-900/40',
  MEDIUM: 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900/40',
  LOW: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40',
};

const CATEGORY_ICONS = {
  LOW_STOCK: PackageX,
  OUT_OF_STOCK: AlertTriangle,
  EXPIRY_ALERT: CalendarX2,
  PROCUREMENT_APPROVED: ShoppingCart,
};

export default function PharmacistNotifications() {
  const [activeTab, setActiveTab] = useState('ALL');
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const data = await fetchPharmacyNotifications();
      // Ensure only the 4 allowed categories exist
      const allowed = new Set(['LOW_STOCK', 'OUT_OF_STOCK', 'EXPIRY_ALERT', 'PROCUREMENT_APPROVED']);
      const filtered = Array.isArray(data) ? data.filter((n) => allowed.has(n.type)) : [];
      // Deduplicate in case backend returns duplicate records with same id
      const seen = new Set();
      const uniqueList = [];
      for (const item of filtered) {
        const dedupKey = `${item.id}_${item.type}_${item.batchNumber || item.orderNumber || item.medicineName || ''}`;
        if (!seen.has(dedupKey)) {
          seen.add(dedupKey);
          uniqueList.push(item);
        }
      }
      setNotifications(uniqueList);
    } catch (e) {
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleMarkAsRead = async (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
    await markPharmacyNotificationRead(id);
  };

  const handleMarkAllAsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    await markAllPharmacyNotificationsRead();
  };

  const handleDelete = async (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    await deletePharmacyNotification(id);
  };

  // Filtered notifications based on active tab
  const filteredList = useMemo(() => {
    if (activeTab === 'ALL') return notifications;
    return notifications.filter((n) => n.type === activeTab);
  }, [notifications, activeTab]);

  // Counts per tab
  const counts = useMemo(() => {
    const c = { ALL: notifications.length };
    notifications.forEach((n) => {
      c[n.type] = (c[n.type] || 0) + 1;
    });
    return c;
  }, [notifications]);

  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.isRead).length;
  }, [notifications]);

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
              Pharmacy Notifications
            </h1>
            {unreadCount > 0 && (
              <Badge tone="brand">
                {unreadCount} Unread
              </Badge>
            )}
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Real-time stock alerts, upcoming expirations, and procurement order updates.
          </p>
        </div>

        {/* Global Actions */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={loadNotifications}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-white/5 transition-colors"
          >
            <RefreshCw className={cn('h-3.5 w-3.5', loading && 'animate-spin')} />
            Refresh
          </button>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={handleMarkAllAsRead}
              className="inline-flex items-center gap-1.5 rounded-xl bg-brand-500/10 px-3 py-2 text-xs font-semibold text-brand-600 hover:bg-brand-500/20 dark:text-brand-400 dark:hover:bg-brand-500/15 transition-colors"
            >
              <CheckCheck className="h-4 w-4" />
              Mark all read
            </button>
          )}
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        {CATEGORY_TABS.map((tab) => {
          const isSelected = activeTab === tab.key;
          const count = counts[tab.key] || 0;
          const TabIcon = tab.icon;

          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'flex items-center gap-2 rounded-xl px-3.5 py-2 font-medium whitespace-nowrap transition-all',
                isSelected
                  ? 'bg-brand-500 text-white shadow-sm shadow-brand-500/20 font-semibold'
                  : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200/80 dark:bg-slate-900/80 dark:border-white/10 dark:text-slate-400 dark:hover:bg-white/5'
              )}
            >
              <TabIcon className="h-3.5 w-3.5" />
              <span>{tab.label}</span>
              {count > 0 && (
                <span
                  className={cn(
                    'rounded-full px-1.5 py-0.2 text-[10px] font-bold',
                    isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300'
                  )}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="surface-card flex min-h-[30vh] items-center justify-center">
          <Spinner size={28} />
        </div>
      ) : filteredList.length === 0 ? (
        <div className="surface-card flex flex-col items-center justify-center gap-3 p-12 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-white/5 dark:text-slate-500">
            <Bell className="h-6 w-6" />
          </div>
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">
            No pharmacy notifications available.
          </h2>
          <p className="max-w-md text-xs text-slate-500 dark:text-slate-400">
            {activeTab === 'ALL'
              ? 'All inventory stock levels, batch expirations, and procurement purchase orders are in good standing.'
              : `No alerts recorded for category: ${CATEGORY_TABS.find((t) => t.key === activeTab)?.label}.`}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {filteredList.map((item, index) => {
              const Icon = CATEGORY_ICONS[item.type] || Bell;
              const priorityClass = PRIORITY_STYLES[item.priority] || PRIORITY_STYLES.LOW;
              const isUnread = !item.isRead;
              const itemKey = `notif-${item.id ?? 'item'}-${item.type ?? 'type'}-${index}`;

              return (
                <motion.div
                  key={itemKey}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                  className={cn(
                    'surface-card relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4.5 transition-all',
                    isUnread && 'border-l-4 border-l-brand-500 bg-brand-50/20 dark:bg-brand-500/[0.02]'
                  )}
                >
                  <div className="flex items-start gap-3.5 flex-1">
                    {/* Icon Bubble */}
                    <div
                      className={cn(
                        'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl mt-0.5',
                        item.type === 'OUT_OF_STOCK' && 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
                        item.type === 'LOW_STOCK' && 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
                        item.type === 'EXPIRY_ALERT' && 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
                        item.type === 'PROCUREMENT_APPROVED' && 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                      )}
                    >
                      <Icon className="h-5 w-5" />
                    </div>

                    {/* Notification Details */}
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={cn('rounded-md px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider', priorityClass)}>
                          {item.priority}
                        </span>
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          {item.type.replace(/_/g, ' ')}
                        </span>
                        {isUnread && (
                          <span className="h-2 w-2 rounded-full bg-brand-500" title="Unread notification" />
                        )}
                      </div>

                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        {item.title}
                      </h3>

                      <p className="text-xs text-slate-600 dark:text-slate-300">
                        {item.message}
                      </p>

                      {/* Structured Category Details */}
                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        {/* 1. LOW_STOCK details */}
                        {item.type === 'LOW_STOCK' && (
                          <>
                            <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 dark:bg-white/5 px-2 py-1 text-[11px] font-medium text-slate-700 dark:text-slate-300">
                              Medicine: <strong className="font-bold text-slate-900 dark:text-white">{item.medicineName}</strong>
                            </span>
                            <span className="inline-flex items-center gap-1 rounded-lg bg-amber-50 dark:bg-amber-950/30 px-2 py-1 text-[11px] font-medium text-amber-700 dark:text-amber-400">
                              Current Stock: <strong className="font-bold">{item.currentStock} units</strong>
                            </span>
                            <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 dark:bg-white/5 px-2 py-1 text-[11px] font-medium text-slate-600 dark:text-slate-400">
                              Min Threshold: <strong className="font-bold">{item.thresholdStock} units</strong>
                            </span>
                          </>
                        )}

                        {/* 2. OUT_OF_STOCK details */}
                        {item.type === 'OUT_OF_STOCK' && (
                          <>
                            <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 dark:bg-white/5 px-2 py-1 text-[11px] font-medium text-slate-700 dark:text-slate-300">
                              Medicine: <strong className="font-bold text-slate-900 dark:text-white">{item.medicineName}</strong>
                            </span>
                            <span className="inline-flex items-center gap-1 rounded-lg bg-rose-50 dark:bg-rose-950/30 px-2 py-1 text-[11px] font-medium text-rose-700 dark:text-rose-400">
                              Current Stock: <strong className="font-bold">0 units (DEPLETED)</strong>
                            </span>
                          </>
                        )}

                        {/* 3. EXPIRY_ALERT details */}
                        {item.type === 'EXPIRY_ALERT' && (
                          <>
                            <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 dark:bg-white/5 px-2 py-1 text-[11px] font-medium text-slate-700 dark:text-slate-300">
                              Medicine: <strong className="font-bold text-slate-900 dark:text-white">{item.medicineName}</strong>
                            </span>
                            <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 dark:bg-white/5 px-2 py-1 text-[11px] font-medium text-slate-700 dark:text-slate-300">
                              Batch: <strong className="font-bold">{item.batchNumber}</strong>
                            </span>
                            <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 dark:bg-white/5 px-2 py-1 text-[11px] font-medium text-slate-700 dark:text-slate-300">
                              Expiry: <strong className="font-bold">{item.expiryDate}</strong>
                            </span>
                            <span
                              className={cn(
                                'inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-medium',
                                item.daysRemaining <= 7
                                  ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400'
                                  : item.daysRemaining <= 15
                                  ? 'bg-orange-50 text-orange-700 dark:bg-orange-950/30 dark:text-orange-400'
                                  : 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400'
                              )}
                            >
                              Horizon: <strong className="font-bold">{item.daysRemaining < 0 ? 'Expired' : `${item.daysRemaining} days left`}</strong>
                            </span>
                          </>
                        )}

                        {/* 4. PROCUREMENT_APPROVED details */}
                        {item.type === 'PROCUREMENT_APPROVED' && (
                          <>
                            <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 dark:bg-white/5 px-2 py-1 text-[11px] font-medium text-slate-700 dark:text-slate-300">
                              Medicine: <strong className="font-bold text-slate-900 dark:text-white">{item.medicineName}</strong>
                            </span>
                            <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 px-2 py-1 text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
                              Approved Quantity: <strong className="font-bold">{item.approvedQuantity} units</strong>
                            </span>
                            <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 dark:bg-white/5 px-2 py-1 text-[11px] font-medium text-slate-700 dark:text-slate-300">
                              Approval Date: <strong className="font-bold">{item.approvalDate}</strong>
                            </span>
                            {item.orderNumber && (
                              <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 dark:bg-white/5 px-2 py-1 text-[11px] font-medium text-slate-500">
                                Order: <strong className="font-mono">{item.orderNumber}</strong>
                              </span>
                            )}
                          </>
                        )}

                        {/* Timestamp */}
                        <span className="inline-flex items-center gap-1 text-[10px] text-slate-400 dark:text-slate-500 ml-auto">
                          <Clock className="h-3 w-3" />
                          {new Date(item.timestamp || item.createdAt).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                    {isUnread && (
                      <button
                        type="button"
                        onClick={() => handleMarkAsRead(item.id)}
                        className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-brand-600 dark:hover:bg-white/5 dark:hover:text-brand-400 transition-colors"
                        title="Mark as read"
                      >
                        <CheckCheck className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDelete(item.id)}
                      className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10 dark:hover:text-rose-400 transition-colors"
                      title="Dismiss notification"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
