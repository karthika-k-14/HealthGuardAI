import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ClipboardCheck, Activity, Hospital, Building2, Megaphone, Siren, FileBarChart, BrainCircuit } from 'lucide-react';
import { PATHS } from '../../../constants/routes';

import React from 'react';

const ACTIONS = [
  { label: 'Case Reviews', icon: ClipboardCheck, to: PATHS.OFFICER_CASE_REVIEWS, tone: 'text-amber-600 dark:text-amber-300 bg-signal-amber/10' },
  { label: 'Disease Monitoring', icon: Activity, to: PATHS.OFFICER_DISEASE_MONITORING, tone: 'text-brand-600 dark:text-brand-400 bg-brand-500/10' },
  { label: 'Referral Monitoring', icon: Building2, to: PATHS.OFFICER_REFERRALS, tone: 'text-sky-600 dark:text-sky-400 bg-sky-500/10' },
  { label: 'Campaign Management', icon: Megaphone, to: PATHS.OFFICER_CAMPAIGNS, tone: 'text-purple-600 dark:text-purple-300 bg-purple-500/10' },
  { label: 'Emergency Response', icon: Siren, to: PATHS.OFFICER_EMERGENCY, tone: 'text-rose-600 dark:text-rose-400 bg-rose-500/10' },
  { label: 'Reports', icon: FileBarChart, to: PATHS.OFFICER_REPORTS, tone: 'text-indigo-600 dark:text-indigo-300 bg-indigo-500/10' },
  { label: 'AI Insights', icon: BrainCircuit, to: PATHS.OFFICER_AI_INSIGHTS, tone: 'text-emerald-600 dark:text-emerald-300 bg-emerald-500/10' },
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
