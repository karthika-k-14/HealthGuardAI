import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Activity, Building2, Megaphone, BrainCircuit, Radio, Sparkles, Bell } from 'lucide-react';
import { PATHS } from '../../../constants/routes';

const ACTIONS = [
  { label: 'Disease Surveillance', icon: Activity, to: PATHS.OFFICER_DISEASE_MONITORING, tone: 'text-brand-600 dark:text-brand-400 bg-brand-500/10' },
  { label: 'Referral Management', icon: Building2, to: PATHS.OFFICER_REFERRALS, tone: 'text-sky-600 dark:text-sky-400 bg-sky-500/10' },
  { label: 'Disease Intelligence', icon: BrainCircuit, to: PATHS.OFFICER_ANALYTICS, tone: 'text-indigo-600 dark:text-indigo-400 bg-indigo-500/10' },
  { label: 'Outbreak Prediction', icon: Sparkles, to: PATHS.OFFICER_PREDICTIONS, tone: 'text-rose-600 dark:text-rose-400 bg-rose-500/10' },
  { label: 'Campaign Management', icon: Megaphone, to: PATHS.OFFICER_CAMPAIGNS, tone: 'text-purple-600 dark:text-purple-300 bg-purple-500/10' },
  { label: 'Broadcast Notification', icon: Radio, to: PATHS.OFFICER_BROADCAST, tone: 'text-teal-600 dark:text-teal-400 bg-teal-500/10' },
  { label: 'Notifications', icon: Bell, to: PATHS.NOTIFICATIONS, tone: 'text-amber-600 dark:text-amber-400 bg-amber-500/10' },
];

export default function QuickActions() {
  return (
    <div className="surface-card p-6">
      <p className="text-sm font-semibold text-slate-900 dark:text-white">Quick Actions</p>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7">
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
