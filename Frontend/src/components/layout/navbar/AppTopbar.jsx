import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, Bell, ChevronDown, CheckCheck, ArrowRight, AlertTriangle, Info } from 'lucide-react';
import ThemeToggle from '../../common/ThemeToggle';
import { useAuth } from '../../../contexts/AuthContext';
import { useNotifications } from '../../../contexts/NotificationContext';
import { PATHS } from '../../../constants/routes';
import { ROLE_LABELS, ROLES } from '../../../constants/roles';
import { useLanguage } from '../../../contexts/LanguageContext';
import Badge from '../../common/Badge';

const PRIORITY_STYLES = {
  CRITICAL: 'rose',
  HIGH: 'amber',
  MEDIUM: 'brand',
  LOW: 'sky',
};

export default function AppTopbar({ onMenuClick }) {
  const { user, role } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [menuOpen, setMenuOpen] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);
  const { t } = useLanguage();

  const bellRef = useRef(null);
  const menuRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (bellRef.current && !bellRef.current.contains(e.target)) {
        setBellOpen(false);
      }
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const latestFive = notifications.slice(0, 5);
  const targetNotificationsPath = role === ROLES.ADMIN ? PATHS.ADMIN_NOTIFICATIONS : PATHS.NOTIFICATIONS;

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-slate-200/70 bg-white/80 px-4 py-3 backdrop-blur-xl dark:border-white/10 dark:bg-surface-dark/80 sm:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="inline-flex items-center justify-center rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/5 lg:hidden"
          aria-label="Open sidebar menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div>
          <p className="text-sm font-semibold text-slate-900 dark:text-white">
            {t('Welcome back')}{user?.name ? `, ${user.name.split(' ')[0]}` : ''}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">{t(ROLE_LABELS[role])}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <ThemeToggle />

        {/* TOP BAR BELL ICON WITH DROPDOWN */}
        <div className="relative" ref={bellRef}>
          <button
            type="button"
            onClick={() => {
              setBellOpen((prev) => !prev);
              setMenuOpen(false);
            }}
            className={`relative inline-flex h-9 w-9 items-center justify-center rounded-full transition-colors ${
              bellOpen
                ? 'bg-brand-500/10 text-brand-600 dark:text-brand-400'
                : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/5'
            }`}
            aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ''}`}
          >
            <Bell className="h-4.5 w-4.5" />
            {unreadCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-signal-rose text-[10px] font-bold text-white shadow-sm">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {bellOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-white/10 dark:bg-slate-900 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-white/10 px-4 py-3 bg-slate-50/70 dark:bg-white/[0.02]">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Notifications</h3>
                  {unreadCount > 0 && (
                    <span className="rounded-full bg-rose-500/10 px-2 py-0.5 text-[10px] font-semibold text-rose-600 dark:text-rose-400">
                      {unreadCount} unread
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={markAllAsRead}
                    className="inline-flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400"
                  >
                    <CheckCheck className="h-3.5 w-3.5" /> Mark all read
                  </button>
                )}
              </div>

              {/* Latest 5 Notifications List */}
              <div className="max-h-80 divide-y divide-slate-100 dark:divide-white/5 overflow-y-auto">
                {latestFive.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-500 dark:text-slate-400">
                    <Info className="mx-auto h-6 w-6 text-slate-400 mb-2 opacity-60" />
                    No notifications available.
                  </div>
                ) : (
                  latestFive.map((n) => {
                    const isUnread = !n.read && !n.isRead;
                    return (
                      <div
                        key={n.id}
                        onClick={() => markAsRead(n.id)}
                        className={`group relative flex items-start gap-3 p-3.5 text-left transition-colors cursor-pointer hover:bg-slate-50 dark:hover:bg-white/5 ${
                          isUnread ? 'bg-brand-500/[0.03] dark:bg-brand-500/[0.05]' : ''
                        }`}
                      >
                        <span
                          className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                            isUnread ? 'bg-brand-500 ring-2 ring-brand-500/20' : 'bg-transparent'
                          }`}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                              {n.title}
                            </p>
                            <Badge tone={PRIORITY_STYLES[n.priority] || 'brand'} className="text-[10px] px-1.5 py-0">
                              {n.priority || 'NORMAL'}
                            </Badge>
                          </div>
                          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                            {n.message}
                          </p>
                          <p className="mt-1 text-[10px] text-slate-400 dark:text-slate-500">
                            {n.createdAt ? new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' }) : 'Just now'}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Footer */}
              <div className="border-t border-slate-200/80 dark:border-white/10 p-2.5 bg-slate-50/50 dark:bg-white/[0.02]">
                <Link
                  to={targetNotificationsPath}
                  onClick={() => setBellOpen(false)}
                  className="flex items-center justify-center gap-1.5 w-full rounded-xl py-2 text-xs font-semibold text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-500/10 transition-colors"
                >
                  View All Notifications <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Menu */}
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => {
              setMenuOpen((v) => !v);
              setBellOpen(false);
            }}
            className="flex items-center gap-2 rounded-full border border-slate-200 py-1 pl-1 pr-2.5 hover:bg-slate-50 dark:border-white/10 dark:hover:bg-white/5"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-brand-600 text-xs font-semibold text-white">
              {user?.name?.charAt(0) || '?'}
            </span>
            <ChevronDown className="h-3.5 w-3.5 text-slate-500" />
          </button>

          {menuOpen && (
            <div
              role="menu"
              className="absolute right-0 mt-2 w-48 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg dark:border-white/10 dark:bg-surface-darkcard z-50"
            >
              <Link
                to={PATHS.PROFILE}
                role="menuitem"
                onClick={() => setMenuOpen(false)}
                className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-white/5"
              >
                {t('Profile')}
              </Link>
              <Link
                to={PATHS.SETTINGS}
                role="menuitem"
                onClick={() => setMenuOpen(false)}
                className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-white/5"
              >
                {t('Settings')}
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
