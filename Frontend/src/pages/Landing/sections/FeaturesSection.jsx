import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { getIcon } from '../../../utils/iconRegistry';
import { fetchFeatures } from '../../../api/landingApi';
import { SkeletonGrid } from '../../../components/common/Skeleton';

export default function FeaturesSection() {
  const { t } = useTranslation();
  const [features, setFeatures] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    fetchFeatures().then((data) => {
      if (mounted) {
        setFeatures(data);
        setIsLoading(false);
      }
    });
    return () => { mounted = false; };
  }, []);

  return (
    <section id="features" className="px-6 py-16 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-xl text-center">
          <span className="section-eyebrow justify-center">{t('features_eyebrow')}</span>
          <h2 className="mt-3 font-display text-3xl font-semibold text-slate-900 dark:text-white">
            {t('features_heading')}
          </h2>
        </div>

        {isLoading ? (
          <SkeletonGrid count={8} className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4" />
        ) : (
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f, i) => {
              const Icon = getIcon(f.icon);
              return (
                <motion.div
                  key={f.id}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.4, delay: (i % 4) * 0.06 }}
                  className="surface-card p-6 transition-transform hover:-translate-y-1"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <p className="mt-4 text-sm font-semibold text-slate-900 dark:text-white">{t(f.title)}</p>
                  <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">{t(f.description)}</p>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
