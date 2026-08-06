import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import Accordion from '../../../components/common/Accordion';
import { Skeleton } from '../../../components/common/Skeleton';
import { fetchFaqs } from '../../../api/landingApi';

export default function FAQSection() {
  const { t } = useTranslation();
  const [faqs, setFaqs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchFaqs().then((data) => {
      setFaqs(data);
      setIsLoading(false);
    });
  }, []);

  return (
    <section id="faq" className="px-6 py-16 sm:px-8">
      <div className="mx-auto max-w-3xl">
        <div className="text-center">
          <span className="section-eyebrow justify-center">{t('faq_eyebrow')}</span>
          <h2 className="mt-3 font-display text-3xl font-semibold text-slate-900 dark:text-white">
            {t('faq_heading')}
          </h2>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="surface-card mt-8 px-4 sm:px-6 sm:py-2"
        >
          {isLoading ? (
            <div className="space-y-3 py-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-11 w-full" />
              ))}
            </div>
          ) : (
            <Accordion items={faqs.map(f => ({ ...f, question: t(f.question), answer: t(f.answer) }))} />
          )}
        </motion.div>
      </div>
    </section>
  );
}
