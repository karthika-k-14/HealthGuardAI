import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Megaphone, Droplets, Syringe, Apple, Calendar, MapPin, Tag } from 'lucide-react';
import { fetchCampaigns } from '../../api/campaignApi';
import Badge from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';
import { SkeletonGrid } from '../../components/common/Skeleton';

const TYPE_CONFIG = {
  Awareness: { icon: Megaphone, color: 'text-amber-500 dark:text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
  'Blood Donation': { icon: Droplets, color: 'text-rose-500 dark:text-rose-400', bg: 'bg-rose-500/10 border-rose-500/20' },
  'Vaccination Drive': { icon: Syringe, color: 'text-brand-600 dark:text-brand-400', bg: 'bg-brand-500/10 border-brand-500/20' },
  'Nutrition Program': { icon: Apple, color: 'text-emerald-500 dark:text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
};

const STATUS_TONE = {
  active: 'brand',
  Active: 'brand',
  ACTIVE: 'brand',
  scheduled: 'sky',
  Scheduled: 'sky',
  SCHEDULED: 'sky',
  completed: 'neutral',
  Completed: 'neutral',
  COMPLETED: 'neutral',
  draft: 'amber',
  Draft: 'amber',
  DRAFT: 'amber',
};

function formatDate(dateStr) {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

export default function CampaignManagement() {
  const [campaigns, setCampaigns] = useState(null);

  useEffect(() => {
    let mounted = true;
    fetchCampaigns()
      .then((data) => {
        if (mounted) setCampaigns(data || []);
      })
      .catch(() => {
        if (mounted) setCampaigns([]);
      });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Header */}
      <div>
        <div className="mb-1 flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
          <span>Health Officer</span>
          <span>/</span>
          <span className="text-brand-600 dark:text-brand-400">Campaigns</span>
        </div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Campaign Management
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Awareness campaigns, blood donation camps, vaccination drives, and field health initiatives.
        </p>
      </div>

      {/* Loading Skeletons */}
      {campaigns === null && (
        <SkeletonGrid count={6} className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3" />
      )}

      {/* Empty State */}
      {campaigns !== null && campaigns.length === 0 && (
        <EmptyState
          icon={Megaphone}
          title="No Campaigns Available"
          description="There are currently no recorded public health campaigns in the database."
        />
      )}

      {/* Campaign Cards Responsive Grid */}
      {campaigns !== null && campaigns.length > 0 && (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {campaigns.map((c) => {
            const campaignType = c.campaignType || c.type || 'Awareness';
            const conf = TYPE_CONFIG[campaignType] || {
              icon: Megaphone,
              color: 'text-brand-500',
              bg: 'bg-brand-500/10 border-brand-500/20',
            };
            const Icon = conf.icon;
            const title = c.title || c.campaignName || 'Untitled Campaign';
            const village = c.villageName || c.village || c.district || '—';
            const description = c.description;

            return (
              <div
                key={c.id}
                className="surface-card group flex flex-col justify-between p-5 space-y-4 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-[#111714]/80 backdrop-blur-md shadow-sm hover:shadow-md hover:border-brand-500/30 transition-all duration-200"
              >
                {/* Header: Icon, Title, Type, Status Badge */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <span
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${conf.bg} ${conf.color} transition-transform group-hover:scale-105`}
                    >
                      <Icon className="h-5 w-5" />
                    </span>
                    <div className="min-w-0">
                      <h3
                        className="text-base font-semibold text-slate-900 dark:text-white leading-snug line-clamp-1"
                        title={title}
                      >
                        {title}
                      </h3>
                      <div className="mt-1 flex items-center gap-1.5">
                        <Tag className="h-3 w-3 text-cyan-400 shrink-0" />
                        <span className="inline-flex items-center rounded-full bg-cyan-500/10 px-2 py-0.5 text-xs font-medium text-cyan-400 border border-cyan-500/20">
                          {campaignType}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Badge tone={STATUS_TONE[c.status] || 'neutral'} className="shrink-0 font-medium">
                    {c.status}
                  </Badge>
                </div>

                {/* Village Location */}
                <div className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-200 bg-slate-100/70 dark:bg-white/[0.04] px-3 py-2 rounded-xl border border-slate-200/50 dark:border-white/5">
                  <MapPin className="h-3.5 w-3.5 text-brand-500 shrink-0" />
                  <span className="font-semibold text-slate-900 dark:text-white">Village:</span>
                  <span className="truncate">{village}</span>
                </div>

                {/* Description (entered by Admin) */}
                {description && (
                  <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400 line-clamp-3">
                    {description}
                  </p>
                )}

                {/* Footer: Date Range */}
                <div className="flex items-center justify-between border-t border-slate-100 dark:border-white/5 pt-3 text-xs text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1.5 font-medium">
                    <Calendar className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
                    {formatDate(c.startDate)} – {formatDate(c.endDate)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
