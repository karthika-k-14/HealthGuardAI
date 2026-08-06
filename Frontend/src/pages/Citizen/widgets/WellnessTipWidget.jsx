import React, { useEffect, useState } from 'react';
import { RefreshCcw, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { fetchWellnessTip } from '../../../api/citizenApi';
import { Skeleton } from '../../../components/common/Skeleton';

export default function WellnessTipWidget() {
  const { t } = useTranslation();
  const [tip, setTip] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const load = () => {
    setIsLoading(true);
    fetchWellnessTip().then((data) => {
      setTip(data);
      setIsLoading(false);
    });
  };

  useEffect(load, []);

  return (
    <div className="glass-panel p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500/15 text-brand-600 dark:text-brand-400">
            <Sparkles className="h-4 w-4" />
          </span>
          <p className="text-sm font-semibold text-slate-900 dark:text-white">{t('AI Wellness Tip')}</p>
        </div>
        <button
          type="button"
          onClick={load}
          aria-label={t('Get another tip')}
          className="flex h-7 w-7 items-center justify-center rounded-full text-slate-400 hover:bg-white/50 dark:hover:bg-white/5"
        >
          <RefreshCcw className="h-3.5 w-3.5" />
        </button>
      </div>
      {isLoading ? (
        <Skeleton className="mt-3 h-10 w-full" />
      ) : (
        <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">{t(tip)}</p>
      )}
    </div>
  );
}
