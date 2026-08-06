import React, { useEffect, useState } from 'react';
import { Megaphone, Droplets, Syringe, Apple, Calendar } from 'lucide-react';
import { fetchCampaigns } from '../../api/campaignApi';
import Badge from '../../components/common/Badge';
import { SkeletonGrid } from '../../components/common/Skeleton';

const TYPE_ICON = {
  Awareness: Megaphone,
  'Blood Donation': Droplets,
  'Vaccination Drive': Syringe,
  'Nutrition Program': Apple,
};

const STATUS_TONE = { active: 'brand', scheduled: 'sky', completed: 'neutral' };

export default function CampaignManagement() {
  const [campaigns, setCampaigns] = useState(null);

  useEffect(() => {
    let mounted = true;
    fetchCampaigns().then((data) => {
      if (mounted) setCampaigns(data);
    });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-slate-900 dark:text-white">Campaign Management</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Awareness campaigns, blood donation camps, vaccination drives, and nutrition programs.
        </p>
      </div>

      {!campaigns && <SkeletonGrid count={5} className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3" />}

      {campaigns && (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {campaigns.map((c) => {
            const Icon = TYPE_ICON[c.type] || Megaphone;
            return (
              <div key={c.id} className="surface-card space-y-3 p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400">
                      <Icon className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">{c.title}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{c.type}</p>
                    </div>
                  </div>
                  <Badge tone={STATUS_TONE[c.status] || 'neutral'}>{c.status}</Badge>
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 dark:text-slate-400">Progress</span>
                    <span className="text-slate-500 dark:text-slate-400">{c.progress ?? 0}%</span>
                  </div>
                  <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
                    <div className="h-full rounded-full bg-brand-500" style={{ width: `${c.progress ?? 0}%` }} />
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    {new Date(c.startDate).toLocaleDateString()} – {new Date(c.endDate).toLocaleDateString()}
                  </span>
                  <span>{c.reach.toLocaleString()} reached</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
