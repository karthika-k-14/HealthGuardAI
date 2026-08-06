import { motion } from 'framer-motion';
import { Bell, CheckCheck, Trash2 } from 'lucide-react';
import { useNotifications } from '../../contexts/NotificationContext';
import { Spinner } from '../../components/common/Loader';
import Badge from '../../components/common/Badge';
import { cn } from '../../utils/cn';

import React from 'react';

const TYPE_TONE = {
  alert: 'rose',
  info: 'sky',
  success: 'brand',
  emergency: 'rose',
};

export default function Notifications() {
  const { notifications, isLoading, unreadCount, markAsRead, markAllAsRead, removeNotification } = useNotifications();

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="mx-auto max-w-3xl"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-slate-900 dark:text-white">Notifications</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {unreadCount > 0 ? `${unreadCount} unread` : 'You are all caught up'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            type="button"
            onClick={markAllAsRead}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400"
          >
            <CheckCheck className="h-4 w-4" /> Mark all as read
          </button>
        )}
      </div>

      <div className="mt-6 space-y-3">
        {isLoading && (
          <div className="surface-card flex items-center justify-center gap-2 p-8 text-sm text-slate-500">
            <Spinner size={18} /> Loading notifications…
          </div>
        )}

        {!isLoading && notifications.length === 0 && (
          <div className="surface-card flex flex-col items-center gap-2 p-10 text-center text-sm text-slate-500">
            <Bell className="h-6 w-6 text-slate-400" />
            Nothing here yet. New alerts will show up as they come in.
          </div>
        )}

        {notifications.map((n) => (
          <div
            key={n.id}
            className={cn(
              'surface-card flex w-full items-start gap-3 p-4 text-left transition-colors',
              !n.read && 'border-brand-300/60 dark:border-brand-500/30'
            )}
          >
            <button
              type="button"
              onClick={() => markAsRead(n.id)}
              className="flex flex-1 items-start gap-3 text-left"
            >
              <span className={cn('mt-1 h-2 w-2 shrink-0 rounded-full', n.read ? 'bg-transparent' : 'bg-brand-500')} />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{n.title}</p>
                  <Badge tone={TYPE_TONE[n.type] || 'neutral'}>{n.category || n.type}</Badge>
                </div>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{n.message}</p>
                <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">
                  {new Date(n.createdAt).toLocaleString()}
                </p>
              </div>
            </button>
            <button
              type="button"
              onClick={() => removeNotification(n.id)}
              aria-label="Delete notification"
              className="shrink-0 rounded-md p-1.5 text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10 dark:hover:text-rose-400"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
