import React, { useEffect, useState } from 'react';
import { Megaphone, MapPin, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { fetchCampaigns } from '../../../api/campaignApi';
import { Skeleton } from '../../../components/common/Skeleton';
import Badge from '../../../components/common/Badge';
import { PATHS } from '../../../constants/routes';

const STATUS_TONE = { Active: 'brand', Scheduled: 'sky', Completed: 'neutral', active: 'brand', scheduled: 'sky', completed: 'neutral' };

export default function CampaignSuccessWidget() {
  const [campaigns, setCampaigns] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    fetchCampaigns().then((data) => {
      if (mounted) {
        setCampaigns((data || []).slice(0, 4));
        setIsLoading(false);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="surface-card p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400">
            <Megaphone className="h-4 w-4" />
          </span>
          <p className="text-sm font-semibold text-slate-900 dark:text-white">Active Health Campaigns</p>
        </div>
        <Link
          to={PATHS.OFFICER_CAMPAIGNS}
          className="text-xs font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400 flex items-center gap-1"
        >
          View All <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="mt-4 space-y-3">
        {isLoading && Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-14 w-full rounded-xl" />)}
        {!isLoading && campaigns.length === 0 && (
          <p className="text-xs text-slate-400 py-4 text-center">No campaigns scheduled or active.</p>
        )}
        {!isLoading &&
          campaigns.map((c) => (
            <div key={c.id} className="rounded-xl border border-slate-200/70 p-3 dark:border-white/10 space-y-1 hover:border-slate-300 transition-colors">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-800 dark:text-slate-100 truncate">{c.title}</span>
                <Badge tone={STATUS_TONE[c.status] || 'neutral'}>{c.status}</Badge>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                <span className="rounded bg-slate-100 dark:bg-white/10 px-1.5 py-0.2 font-medium text-slate-600 dark:text-slate-300">
                  {c.campaignType || c.type || 'Awareness'}
                </span>
                {c.villageName && (
                  <span className="flex items-center gap-0.5 text-blue-600 dark:text-blue-400">
                    <MapPin className="h-3 w-3" /> {c.villageName}
                  </span>
                )}
              </div>
              {c.description && (
                <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-1">
                  {c.description}
                </p>
              )}
            </div>
          ))}
      </div>
    </div>
  );
}
