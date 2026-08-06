import React, { useEffect, useState } from 'react';
import { History, MessageCircle, Syringe, Hospital, Pill, HeartPulse } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { fetchRecentActivity } from '../../../api/citizenApi';
import { Skeleton } from '../../../components/common/Skeleton';

const TYPE_ICON = {
  chat: MessageCircle,
  vaccination: Syringe,
  hospital: Hospital,
  medicine: Pill,
  healthscore: HeartPulse,
};

function timeAgo(iso, t) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  if (hours < 1) return t('Just now');
  if (hours < 24) return `${hours}${t('h ago')}`;
  const days = Math.floor(hours / 24);
  return `${days}${t('d ago')}`;
}

export default function RecentActivityWidget() {
  const { t } = useTranslation();
  const [activity, setActivity] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchRecentActivity().then((data) => {
      setActivity(data);
      setIsLoading(false);
    });
  }, []);

  return (
    <div className="surface-card p-6">
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400">
          <History className="h-4 w-4" />
        </span>
        <p className="text-sm font-semibold text-slate-900 dark:text-white">{t('Recent Activity')}</p>
      </div>

      <div className="mt-4 space-y-4">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)
          : activity.map((a) => {
              const Icon = TYPE_ICON[a.type] || History;
              return (
                <div key={a.id} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500 dark:bg-white/5 dark:text-slate-300">
                    <Icon className="h-3.5 w-3.5" />
                  </span>
                  <div className="flex-1">
                    <p className="text-sm text-slate-700 dark:text-slate-200">{t(a.title)}</p>
                    <p className="text-xs text-slate-400">{timeAgo(a.timestamp, t)}</p>
                  </div>
                </div>
              );
            })}
      </div>
    </div>
  );
}
