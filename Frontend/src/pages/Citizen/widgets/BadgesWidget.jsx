import React, { useEffect, useState } from 'react';
import { Award } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { fetchBadges } from '../../../api/citizenApi';
import { getIcon } from '../../../utils/iconRegistry';
import { Skeleton } from '../../../components/common/Skeleton';
import { cn } from '../../../utils/cn';

export default function BadgesWidget() {
  const { t } = useTranslation();
  const [badges, setBadges] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchBadges().then((data) => {
      setBadges(data);
      setIsLoading(false);
    });
  }, []);

  return (
    <div className="surface-card p-6">
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
          <Award className="h-4 w-4" />
        </span>
        <p className="text-sm font-semibold text-slate-900 dark:text-white">{t('Achievement Badges')}</p>
      </div>

      <div className="mt-4 grid grid-cols-5 gap-2">
        {isLoading
          ? Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-12 rounded-xl" />)
          : badges.map((b) => {
              const Icon = getIcon(b.icon);
              return (
                <div key={b.id} className="flex flex-col items-center gap-1" title={b.label}>
                  <span
                    className={cn(
                      'flex h-12 w-12 items-center justify-center rounded-xl',
                      b.earned
                        ? 'bg-gradient-to-br from-brand-400 to-brand-600 text-white'
                        : 'bg-slate-100 text-slate-300 dark:bg-white/5 dark:text-white/15'
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <p className="text-center text-[10px] leading-tight text-slate-500 dark:text-slate-400">{t(b.label)}</p>
                </div>
              );
            })}
      </div>
    </div>
  );
}
