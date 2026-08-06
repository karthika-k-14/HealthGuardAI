import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../contexts/AuthContext';

import React from 'react';

export default function WelcomeBanner() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const firstName = user?.name?.split(' ')[0] || t('there');
  const today = new Date().toLocaleDateString(i18n.language, { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="glass-panel relative overflow-hidden p-6 sm:p-8"
    >
      <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-brand-500/10 blur-3xl" aria-hidden="true" />
      <span className="section-eyebrow">
        <Sparkles className="h-3.5 w-3.5" /> {today}
      </span>
      <h1 className="mt-2 font-display text-2xl font-semibold text-slate-900 dark:text-white sm:text-3xl">
        {t('Welcome back')}, {firstName}
      </h1>
      <p className="mt-1.5 max-w-xl text-sm text-slate-500 dark:text-slate-400">
        {t('welcome_banner_subtitle')}
      </p>
    </motion.div>
  );
}
