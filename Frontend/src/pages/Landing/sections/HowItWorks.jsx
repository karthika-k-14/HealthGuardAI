import { motion } from 'framer-motion';
import { LogIn, MessageCircleQuestion, Compass, Hospital, HeartPulse } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import React from 'react';

const STEPS = [
  { icon: LogIn, titleKey: 'step_login_title', descKey: 'step_login_desc' },
  { icon: MessageCircleQuestion, titleKey: 'step_ask_title', descKey: 'step_ask_desc' },
  { icon: Compass, titleKey: 'step_guidance_title', descKey: 'step_guidance_desc' },
  { icon: Hospital, titleKey: 'step_hospital_title', descKey: 'step_hospital_desc' },
  { icon: HeartPulse, titleKey: 'step_healthy_title', descKey: 'step_healthy_desc' },
];

export default function HowItWorks() {
  const { t } = useTranslation();
  return (
    <section id="how-it-works" className="px-6 py-16 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-xl text-center">
          <span className="section-eyebrow justify-center">{t('how_it_works_eyebrow')}</span>
          <h2 className="mt-3 font-display text-3xl font-semibold text-slate-900 dark:text-white">
            {t('how_it_works_heading')}
          </h2>
        </div>

        <div className="relative mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
          <div className="absolute left-0 right-0 top-8 hidden h-px bg-slate-200 dark:bg-white/10 lg:block" aria-hidden="true" />
          {STEPS.map((step, i) => (
            <motion.div
              key={step.titleKey}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="relative flex flex-col items-center text-center"
            >
              <span className="relative z-10 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-500 text-white shadow-glow">
                <step.icon className="h-6 w-6" aria-hidden="true" />
              </span>
              <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-brand-600 dark:text-brand-400">
                {t('Step')} {i + 1}
              </p>
              <p className="mt-1 font-display text-base font-semibold text-slate-900 dark:text-white">{t(step.titleKey)}</p>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{t(step.descKey)}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
