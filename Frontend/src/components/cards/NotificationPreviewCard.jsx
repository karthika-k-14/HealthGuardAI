import { Link } from 'react-router-dom';
import { Bell, ArrowRight } from 'lucide-react';
import { useNotifications } from '../../contexts/NotificationContext';
import { Skeleton } from '../common/Skeleton';
import Badge from '../common/Badge';
import { PATHS } from '../../constants/routes';

import React from 'react';

const TYPE_TONE = { alert: 'rose', info: 'sky', success: 'brand', emergency: 'rose' };

/**
 * Generic notification-center preview card — reads from
 * NotificationContext directly, so it's identical for every role and
 * lives in components/cards to be shared across dashboards rather
 * than duplicated per role.
 */
export default function NotificationPreviewCard() {
  const { notifications, isLoading, unreadCount } = useNotifications();
  const preview = notifications.slice(0, 3);

  return (
    <div className="surface-card p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400">
            <Bell className="h-4 w-4" />
          </span>
          <p className="text-sm font-semibold text-slate-900 dark:text-white">
            Notifications {unreadCount > 0 && <span className="text-brand-600 dark:text-brand-400">({unreadCount})</span>}
          </p>
        </div>
        <Link
          to={PATHS.NOTIFICATIONS}
          className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400"
        >
          View all <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="mt-4 space-y-3">
        {isLoading && Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
        {!isLoading && preview.length === 0 && (
          <p className="text-sm text-slate-400">You&apos;re all caught up.</p>
        )}
        {!isLoading &&
          preview.map((n) => (
            <div key={n.id} className="flex items-start gap-2.5">
              <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${n.read ? 'bg-transparent' : 'bg-brand-500'}`} />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm text-slate-700 dark:text-slate-200">{n.title}</p>
                  <Badge tone={TYPE_TONE[n.type] || 'neutral'}>{n.category || n.type}</Badge>
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
