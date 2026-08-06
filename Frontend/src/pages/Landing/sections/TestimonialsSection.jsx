import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { fetchTestimonials } from '../../../api/landingApi';
import { SkeletonGrid } from '../../../components/common/Skeleton';

export default function TestimonialsSection() {
  const { t } = useTranslation();
  const [testimonials, setTestimonials] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTestimonials().then((data) => {
      setTestimonials(data);
      setIsLoading(false);
    });
  }, []);

  return (
    <section className="px-6 py-16 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-xl text-center">
          <span className="section-eyebrow justify-center">{t('testimonials_eyebrow')}</span>
          <h2 className="mt-3 font-display text-3xl font-semibold text-slate-900 dark:text-white">
            {t('testimonials_heading')}
          </h2>
        </div>

        {isLoading ? (
          <SkeletonGrid count={4} className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4" />
        ) : (
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {testimonials.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.4, delay: (i % 4) * 0.07 }}
                className="glass-panel flex flex-col p-6"
              >
                <Quote className="h-5 w-5 text-brand-400" aria-hidden="true" />
                <p className="mt-3 flex-1 text-sm text-slate-600 dark:text-slate-300">"{item.quote}"</p>
                <div className="mt-4 flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, idx) => (
                    <Star
                      key={idx}
                      className={
                        idx < item.rating
                          ? 'h-3.5 w-3.5 fill-signal-amber text-signal-amber'
                          : 'h-3.5 w-3.5 text-slate-300 dark:text-white/15'
                      }
                    />
                  ))}
                </div>
                <p className="mt-3 text-sm font-semibold text-slate-900 dark:text-white">{item.name}</p>
                <p className="text-xs text-slate-400">{t(item.role)}</p>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
