import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

import React from 'react';

/**
 * Generic "icon + value + label" stat card, reused across every
 * dashboard's statistics row (Citizen, ASHA, Pharmacist, Officer,
 * Admin) instead of each one redefining the same markup.
 */
export default function StatCard({ icon: Icon, label, value, tone = 'text-brand-600 dark:text-brand-400 bg-brand-500/10', suffix = '', prefix = '', delay = 0, className }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className={cn('surface-card flex items-center gap-3 p-5', className)}
    >
      {Icon && (
        <span className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl', tone)}>
          <Icon className="h-5 w-5" />
        </span>
      )}
      <div className="min-w-0">
        <p className="font-display text-xl font-semibold text-slate-900 dark:text-white">
          {prefix}{typeof value === 'number' ? value.toLocaleString() : value}{suffix}
        </p>
        <p className="truncate text-xs text-slate-500 dark:text-slate-400">{label}</p>
      </div>
    </motion.div>
  );
}
