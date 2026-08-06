import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, ShieldCheck, ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Button from '../../../components/common/Button';
import { PATHS } from '../../../constants/routes';
import FloatingIcons from './FloatingIcons';
import HealthRiskDemo from './HealthRiskDemo';

import React from 'react';

export default function Hero() {
  const { t } = useTranslation();
  return (
    <section id="overview" className="relative overflow-hidden px-6 pb-16 pt-14 sm:px-8 sm:pt-20">
      <FloatingIcons />
      <div className="mx-auto max-w-7xl">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <span className="section-eyebrow">
              <ShieldCheck className="h-3.5 w-3.5" /> {t('hero_eyebrow')}
            </span>
            <h1 className="mt-4 font-display text-4xl font-semibold leading-tight tracking-tight text-slate-900 dark:text-white sm:text-5xl">
              {t('hero_heading_line1')}
              <br />
              <span className="shimmer-text">{t('hero_heading_line2')}</span>
            </h1>
            <p className="mt-5 max-w-lg text-base text-slate-600 dark:text-slate-400">
              {t('hero_description')}
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link to={PATHS.LOGIN}>
                <Button variant="primary">
                  {t('Get Started')} <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to={PATHS.LOGIN}>
                <Button variant="secondary">{t('Sign in')}</Button>
              </Link>
            </div>

            <div className="mt-10 hidden lg:block">
              <motion.a
                href="#stats"
                className="inline-flex flex-col items-center gap-1 text-xs font-medium text-slate-400"
                animate={{ y: [0, 6, 0] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
              >
                {t('Scroll to explore')}
                <ChevronDown className="h-4 w-4" />
              </motion.a>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <HealthRiskDemo />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
