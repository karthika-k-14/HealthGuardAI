import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CalendarPlus, UserPlus, Syringe, Baby, MessageCircle, Siren } from 'lucide-react';
import { PATHS } from '../../../constants/routes';

import React from 'react';

const ACTIONS = [
  { label: 'New Visit', icon: CalendarPlus, to: PATHS.ASHA_VISITS, tone: 'text-brand-600 dark:text-brand-400 bg-brand-500/10' },
  { label: 'Register Patient', icon: UserPlus, to: PATHS.ASHA_FAMILIES, tone: 'text-sky-600 dark:text-sky-400 bg-sky-500/10' },
  { label: 'Vaccination', icon: Syringe, to: PATHS.ASHA_CHILD_HEALTH, tone: 'text-emerald-600 dark:text-emerald-300 bg-emerald-500/10' },
  { label: 'AI Assistant', icon: MessageCircle, to: PATHS.ASHA_ASSISTANT, tone: 'text-indigo-600 dark:text-indigo-300 bg-indigo-500/10' },
  { label: 'Emergency Report', icon: Siren, to: PATHS.ASHA_SURVEILLANCE, tone: 'text-rose-600 dark:text-rose-400 bg-rose-500/10' },
];

export default function QuickActions() {
  return (
    <div className="surface-card p-6">
      <p className="text-sm font-semibold text-slate-900 dark:text-white">Quick Actions</p>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {ACTIONS.map((action, i) => (
          <motion.div
            key={action.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
          >
            <Link
              to={action.to}
              className="flex flex-col items-center gap-2 rounded-xl border border-transparent px-3 py-4 text-center transition-colors hover:border-slate-200 hover:bg-slate-50 dark:hover:border-white/10 dark:hover:bg-white/5"
            >
              <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${action.tone}`}>
                <action.icon className="h-5 w-5" />
              </span>
              <span className="text-xs font-medium text-slate-700 dark:text-slate-200">{action.label}</span>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
