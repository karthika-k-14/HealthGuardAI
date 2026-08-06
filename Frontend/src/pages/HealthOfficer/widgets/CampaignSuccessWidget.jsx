import React, { useEffect, useState } from 'react';
import { Megaphone } from 'lucide-react';
import { fetchCampaignSuccessAnalytics } from '../../../api/officerApi';
import { Skeleton } from '../../../components/common/Skeleton';
import Badge from '../../../components/common/Badge';

const STATUS_TONE = { active: 'brand', scheduled: 'sky', completed: 'neutral' };

export default function CampaignSuccessWidget() {
  const [campaigns, setCampaigns] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    fetchCampaignSuccessAnalytics().then((data) => {
      if (mounted) {
        setCampaigns(data);
        setIsLoading(false);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="surface-card p-6">
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400">
          <Megaphone className="h-4 w-4" />
        </span>
        <p className="text-sm font-semibold text-slate-900 dark:text-white">Campaign Success Analytics</p>
      </div>

      <div className="mt-4 space-y-3">
        {isLoading && Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
        {!isLoading &&
          campaigns.map((c) => (
            <div key={c.id}>
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-slate-700 dark:text-slate-200">{c.title}</span>
                <Badge tone={STATUS_TONE[c.status] || 'neutral'}>{c.status}</Badge>
              </div>
              <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
                <div className="h-full rounded-full bg-brand-500" style={{ width: `${c.progress}%` }} />
              </div>
              <p className="mt-1 text-[11px] text-slate-400">{c.progress}% progress · {c.reach.toLocaleString()} reached</p>
            </div>
          ))}
      </div>
    </div>
  );
}
