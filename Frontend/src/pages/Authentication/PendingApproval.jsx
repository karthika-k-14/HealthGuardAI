import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock3, XCircle, Ban, ShieldCheck } from 'lucide-react';
import Logo from '../../components/common/Logo';
import { PATHS } from '../../constants/routes';
import { ROLE_LABELS } from '../../constants/roles';

// Reached two ways: (1) right after a Healthcare Worker completes
// registration (state.role set, no status — always the "submitted"
// message), or (2) a blocked login attempt for a PENDING/REJECTED/
// SUSPENDED account (state.status set — see Login.jsx). Same page,
// different copy, so there is one canonical place this message lives.
const STATUS_CONTENT = {
  PENDING: {
    icon: Clock3,
    tone: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-100 dark:bg-amber-500/10',
    title: 'Registration Submitted',
    message: 'Your account is awaiting administrator approval.',
  },
  REJECTED: {
    icon: XCircle,
    tone: 'text-signal-rose',
    bg: 'bg-rose-100 dark:bg-rose-500/10',
    title: 'Registration Rejected',
    message: 'Your registration was rejected. Please contact the administrator.',
  },
  SUSPENDED: {
    icon: Ban,
    tone: 'text-signal-rose',
    bg: 'bg-rose-100 dark:bg-rose-500/10',
    title: 'Account Suspended',
    message: 'Your account has been suspended. Please contact the administrator.',
  },
};

export default function PendingApproval() {
  const location = useLocation();
  const status = location.state?.status || 'PENDING';
  const role = location.state?.role;
  const content = STATUS_CONTENT[status] || STATUS_CONTENT.PENDING;
  const Icon = content.icon;

  return (
    <div className="flex min-h-screen items-center justify-center bg-aurora bg-dot-grid px-4 py-12 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="glass-panel w-full max-w-md p-8 text-center sm:p-10"
      >
        <div className="flex justify-center">
          <Logo />
        </div>

        <div className="mt-6 flex justify-center">
          <span className={`flex h-16 w-16 items-center justify-center rounded-full ${content.bg} ${content.tone}`}>
            <Icon className="h-8 w-8" aria-hidden="true" />
          </span>
        </div>

        <h1 className="mt-6 font-display text-xl font-semibold text-slate-900 dark:text-white">
          {content.title}
        </h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          {content.message}
        </p>

        {role && status === 'PENDING' && (
          <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-brand-100 px-3 py-1 text-xs font-medium text-brand-700 dark:bg-brand-500/10 dark:text-brand-400">
            <ShieldCheck className="h-3.5 w-3.5" /> {ROLE_LABELS[role] || role}
          </p>
        )}

        <p className="mt-6 text-xs text-slate-400 dark:text-slate-500">
          You&apos;ll be able to log in as soon as an administrator reviews your account. No further
          action is needed from you right now.
        </p>

        <Link
          to={PATHS.LOGIN}
          className="mt-8 inline-flex w-full items-center justify-center rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
        >
          Back to Login
        </Link>

        <p className="mt-4 text-center text-sm text-slate-500 dark:text-slate-400">
          <Link to={PATHS.HOME} className="font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400">
            ← Back to home
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
