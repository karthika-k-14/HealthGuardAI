import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, TrendingUp, ArrowUpRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Badge from '../../../components/common/Badge';
import { SkeletonGrid } from '../../../components/common/Skeleton';
import { fetchDiseaseCategories, fetchDiseases } from '../../../api/landingApi';
import { cn } from '../../../utils/cn';

const RISK_TONE = { Low: 'brand', Medium: 'amber', High: 'rose', Critical: 'critical' };

export default function DiseaseAwarenessSection() {
  const { t } = useTranslation();
  const [categories, setCategories] = useState(['All']);
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [diseases, setDiseases] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDiseaseCategories().then(setCategories);
  }, []);

  useEffect(() => {
    setIsLoading(true);
    const handle = setTimeout(() => {
      fetchDiseases({ category: activeCategory, search }).then((data) => {
        setDiseases(data);
        setIsLoading(false);
      });
    }, 200);
    return () => clearTimeout(handle);
  }, [activeCategory, search]);

  return (
    <section id="disease-awareness" className="px-6 py-16 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col items-center gap-4 text-center">
          <span className="section-eyebrow justify-center">
            <TrendingUp className="h-3.5 w-3.5" /> {t('Disease Awareness')}
          </span>
          <h2 className="font-display text-3xl font-semibold text-slate-900 dark:text-white">
            {t('disease_awareness_heading')}
          </h2>
        </div>

        <div className="mx-auto mt-8 flex max-w-xl items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 shadow-sm dark:border-white/10 dark:bg-white/5">
          <Search className="h-4 w-4 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('Search diseases, symptoms…')}
            className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400 dark:text-slate-100"
          />
        </div>

        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setActiveCategory(c)}
              className={cn(
                'rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors',
                activeCategory === c
                  ? 'border-brand-500 bg-brand-500/10 text-brand-700 dark:text-brand-300'
                  : 'border-slate-200 text-slate-600 hover:border-brand-300 dark:border-white/10 dark:text-slate-300'
              )}
            >
              {t(c)}
            </button>
          ))}
        </div>

        {isLoading ? (
          <SkeletonGrid count={6} className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3" cardClassName="p-5" />
        ) : (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {diseases.map((d, i) => (
              <motion.div
                key={d.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.35, delay: (i % 3) * 0.06 }}
                className="surface-card p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{t(d.name)}</p>
                    <p className="mt-0.5 text-xs text-slate-400">{t(d.category)}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    {d.trending && (
                      <Badge tone="rose">
                        <TrendingUp className="mr-1 h-3 w-3" /> {t('Trending')}
                      </Badge>
                    )}
                    <Badge tone={RISK_TONE[d.riskLevel] || 'neutral'}>{t(d.riskLevel)} {t('risk')}</Badge>
                  </div>
                </div>
                <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">{t(d.summary)}</p>
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-xs text-slate-400">{d.cases7d} {t('cases · last 7 days')}</p>
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400"
                  >
                    {t('Read more')} <ArrowUpRight className="h-3 w-3" />
                  </button>
                </div>
              </motion.div>
            ))}

            {diseases.length === 0 && (
              <p className="col-span-full text-center text-sm text-slate-400">{t('No diseases match your search.')}</p>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
