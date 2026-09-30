import { motion } from 'framer-motion';
import { HeartHandshake } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';

import React from 'react';

export default function WelcomeBanner() {
  const { user } = useAuth();
  const rawName = user?.name || (user?.email ? user.email.split('@')[0].replace(/[._-]/g, ' ') : '');
  const firstName = rawName ? rawName.split(' ')[0].replace(/\b\w/g, c => c.toUpperCase()) : 'ASHA Worker';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="glass-panel flex flex-col justify-between gap-4 p-6 sm:flex-row sm:items-center"
    >
      <div>
        <p className="text-sm font-medium text-brand-600 dark:text-brand-400">
          {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
        <h1 className="mt-1 font-display text-2xl font-semibold text-slate-900 dark:text-white">
          Welcome back, {firstName}
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {user?.assignedVillage ? `${user.assignedVillage}, ${user.district}` : 'Your field workspace for today'}
        </p>
      </div>
      <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 text-white shadow-glow">
        <HeartHandshake className="h-6 w-6" aria-hidden="true" />
      </span>
    </motion.div>
  );
}
