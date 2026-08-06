import React, { useEffect, useState } from 'react';
import { Footprints } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { fetchStepCount } from '../../../api/citizenApi';
import ProgressRing from '../../../components/common/ProgressRing';
import { Skeleton } from '../../../components/common/Skeleton';

export default function StepCounterWidget() {
  const { t } = useTranslation();
  const [steps, setSteps] = useState(null);

  useEffect(() => {
    fetchStepCount().then(setSteps);
  }, []);

  if (!steps) {
    return (
      <div className="surface-card flex items-center gap-4 p-6">
        <Skeleton className="h-20 w-20 rounded-full" />
        <Skeleton className="h-4 w-24" />
      </div>
    );
  }

  return (
    <div className="surface-card flex items-center gap-4 p-6">
      <ProgressRing value={steps.current} max={steps.target} size={80} strokeWidth={7} tone="brand">
        <Footprints className="h-5 w-5 text-brand-600 dark:text-brand-400" />
      </ProgressRing>
      <div>
        <p className="text-sm font-semibold text-slate-900 dark:text-white">{t('Step Counter')}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {steps.current.toLocaleString()} / {steps.target.toLocaleString()} {t('steps')}
        </p>
      </div>
    </div>
  );
}
