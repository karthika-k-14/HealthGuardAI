import React, { useEffect, useState } from 'react';
import { Lightbulb } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { fetchHealthTips } from '../../../api/citizenApi';
import { getIcon } from '../../../utils/iconRegistry';
import { Skeleton } from '../../../components/common/Skeleton';

export default function HealthTipsWidget() {
  const { t } = useTranslation();
  const [tips, setTips] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchHealthTips().then((data) => {
      setTips(data);
      setIsLoading(false);
    });
  }, []);

  return (
    <div className="surface-card p-6">
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400">
          <Lightbulb className="h-4 w-4" />
        </span>
        <p className="text-sm font-semibold text-slate-900 dark:text-white">{t("Today's Health Tips")}</p>
      </div>

      <div className="mt-4 space-y-3">
        {isLoading
          ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)
          : tips.map((tip) => {
              const Icon = getIcon(tip.icon);
              return (
                <div key={tip.id} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500 dark:bg-white/5 dark:text-slate-300">
                    <Icon className="h-3.5 w-3.5" />
                  </span>
                  <div>
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{t(tip.title)}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{t(tip.description)}</p>
                  </div>
                </div>
              );
            })}
      </div>
    </div>
  );
}
