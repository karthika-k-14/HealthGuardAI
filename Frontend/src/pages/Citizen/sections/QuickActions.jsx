import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MessageCircle, Stethoscope, Hospital, Pill, Siren, Landmark } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { PATHS } from '../../../constants/routes';

import React from 'react';

const ACTIONS = [
  { labelKey: 'AI Chat', icon: MessageCircle, to: PATHS.CITIZEN_CHAT, tone: 'text-brand-600 dark:text-brand-400 bg-brand-500/10' },
  { labelKey: 'Symptom Checker', icon: Stethoscope, to: PATHS.CITIZEN_SYMPTOM_CHECKER, tone: 'text-indigo-600 dark:text-indigo-300 bg-indigo-500/10' },
  { labelKey: 'Find Hospital', icon: Hospital, to: PATHS.CITIZEN_HOSPITALS, tone: 'text-sky-600 dark:text-sky-400 bg-sky-500/10' },
  { labelKey: 'Medicine Guide', icon: Pill, to: PATHS.CITIZEN_MEDICINES, tone: 'text-purple-600 dark:text-purple-300 bg-purple-500/10' },
  { labelKey: 'Emergency', icon: Siren, to: PATHS.CITIZEN_EMERGENCY, tone: 'text-rose-600 dark:text-rose-400 bg-rose-500/10' },
  { labelKey: 'Govt. Schemes', icon: Landmark, to: PATHS.CITIZEN_SCHEMES, tone: 'text-amber-600 dark:text-amber-400 bg-amber-500/10' },
];

export default function QuickActions() {
  const { t } = useTranslation();
  return (
    <div className="surface-card p-6">
      <p className="text-sm font-semibold text-slate-900 dark:text-white">{t('Quick Actions')}</p>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {ACTIONS.map((action, i) => (
          <motion.div
            key={action.labelKey}
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
              <span className="text-xs font-medium text-slate-700 dark:text-slate-200">{t(action.labelKey)}</span>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
