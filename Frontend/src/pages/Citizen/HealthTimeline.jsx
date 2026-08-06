import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { History, Stethoscope, Syringe, Pill, FileText, MessageCircle } from 'lucide-react';
import { fetchHealthTimeline } from '../../api/citizenApi';
import { SkeletonGrid } from '../../components/common/Skeleton';

const TYPE_CONFIG = {
  doctor: { icon: Stethoscope, tone: 'bg-sky-500 text-white' },
  vaccination: { icon: Syringe, tone: 'bg-emerald-500 text-white' },
  medicine: { icon: Pill, tone: 'bg-purple-500 text-white' },
  report: { icon: FileText, tone: 'bg-amber-500 text-white' },
  consultation: { icon: MessageCircle, tone: 'bg-brand-500 text-white' },
};

export default function HealthTimeline() {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchHealthTimeline().then((data) => {
      setEvents(data);
      setIsLoading(false);
    });
  }, []);

  return (
    <div className="mx-auto max-w-3xl">
      <span className="section-eyebrow">
        <History className="h-3.5 w-3.5" /> Unique feature
      </span>
      <h1 className="mt-2 font-display text-2xl font-semibold text-slate-900 dark:text-white">Health Timeline</h1>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        Doctor visits, vaccinations, medicines, reports, and AI consultations — all in one place.
      </p>

      {isLoading ? (
        <SkeletonGrid count={4} className="mt-8 space-y-4" cardClassName="p-5" />
      ) : (
        <div className="relative mt-8 space-y-6 border-l border-slate-200 pl-8 dark:border-white/10">
          {events.map((e, i) => {
            const config = TYPE_CONFIG[e.type] || TYPE_CONFIG.consultation;
            const Icon = config.icon;
            return (
              <motion.div
                key={e.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.35, delay: i * 0.06 }}
                className="relative"
              >
                <span className={`absolute -left-[2.85rem] flex h-8 w-8 items-center justify-center rounded-full ${config.tone} shadow`}>
                  <Icon className="h-4 w-4" />
                </span>
                <div className="surface-card p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{e.title}</p>
                    <p className="whitespace-nowrap text-xs text-slate-400">
                      {new Date(e.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{e.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
