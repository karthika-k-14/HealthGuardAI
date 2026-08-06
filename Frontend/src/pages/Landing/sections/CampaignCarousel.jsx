import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Landmark } from 'lucide-react';
import { fetchGovCampaigns } from '../../../api/landingApi';
import { Skeleton } from '../../../components/common/Skeleton';
import { cn } from '../../../utils/cn';

const ACCENT_CLASS = {
  sky: 'from-sky-500 to-sky-700',
  amber: 'from-amber-500 to-amber-700',
  rose: 'from-rose-500 to-rose-700',
  brand: 'from-brand-500 to-brand-700',
};

export default function CampaignCarousel() {
  const [campaigns, setCampaigns] = useState([]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    fetchGovCampaigns().then(setCampaigns);
  }, []);

  useEffect(() => {
    if (campaigns.length === 0) return;
    const timer = setInterval(() => setIndex((i) => (i + 1) % campaigns.length), 4500);
    return () => clearInterval(timer);
  }, [campaigns.length]);

  if (campaigns.length === 0) {
    return (
      <section id="government-schemes" className="px-6 py-16 sm:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="mx-auto max-w-xl text-center">
            <span className="section-eyebrow justify-center">
              <Landmark className="h-3.5 w-3.5" /> Government Schemes & Campaigns
            </span>
            <h2 className="mt-3 font-display text-3xl font-semibold text-slate-900 dark:text-white">
              National health initiatives, in one feed
            </h2>
          </div>
          <Skeleton className="mt-10 h-56 w-full rounded-xl3" />
        </div>
      </section>
    );
  }
  const current = campaigns[index];

  const go = (dir) => setIndex((i) => (i + dir + campaigns.length) % campaigns.length);

  return (
    <section id="government-schemes" className="px-6 py-16 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="mx-auto max-w-xl text-center">
          <span className="section-eyebrow justify-center">
            <Landmark className="h-3.5 w-3.5" /> Government Schemes & Campaigns
          </span>
          <h2 className="mt-3 font-display text-3xl font-semibold text-slate-900 dark:text-white">
            National health initiatives, in one feed
          </h2>
        </div>

        <div className="relative mt-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={current.id}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.4 }}
              className={cn(
                'flex min-h-[14rem] flex-col justify-center rounded-xl3 bg-gradient-to-br p-8 text-center text-white shadow-glow sm:p-12',
                ACCENT_CLASS[current.accent] || ACCENT_CLASS.brand
              )}
            >
              <span className="mx-auto rounded-full bg-white/15 px-3 py-1 text-xs font-medium">{current.tag}</span>
              <h3 className="mt-4 font-display text-2xl font-semibold">{current.title}</h3>
              <p className="mx-auto mt-2 max-w-md text-sm text-white/85">{current.description}</p>
            </motion.div>
          </AnimatePresence>

          <button
            type="button"
            onClick={() => go(-1)}
            aria-label="Previous campaign"
            className="absolute left-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-slate-700 shadow-md backdrop-blur hover:bg-white dark:bg-white/10 dark:text-white sm:-left-4"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            aria-label="Next campaign"
            className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-slate-700 shadow-md backdrop-blur hover:bg-white dark:bg-white/10 dark:text-white sm:-right-4"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-5 flex justify-center gap-2">
          {campaigns.map((c, i) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Go to ${c.title}`}
              className={cn(
                'h-1.5 rounded-full transition-all',
                i === index ? 'w-6 bg-brand-500' : 'w-1.5 bg-slate-300 dark:bg-white/15'
              )}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
