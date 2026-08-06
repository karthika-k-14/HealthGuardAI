import React, { useEffect, useState } from 'react';
import { Droplets, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { fetchWaterIntake, logWaterIntake } from '../../../api/citizenApi';
import ProgressRing from '../../../components/common/ProgressRing';
import { Skeleton } from '../../../components/common/Skeleton';

export default function WaterIntakeWidget() {
  const { t } = useTranslation();
  const [water, setWater] = useState(null);

  useEffect(() => {
    fetchWaterIntake().then(setWater);
  }, []);

  const addGlass = async () => {
    const updated = await logWaterIntake(0.25);
    setWater(updated);
  };

  if (!water) {
    return (
      <div className="surface-card flex items-center gap-4 p-6">
        <Skeleton className="h-20 w-20 rounded-full" />
        <Skeleton className="h-4 w-24" />
      </div>
    );
  }

  return (
    <div className="surface-card flex items-center gap-4 p-6">
      <ProgressRing value={water.current} max={water.target} size={80} strokeWidth={7} tone="sky">
        <Droplets className="h-5 w-5 text-signal-sky" />
      </ProgressRing>
      <div className="flex-1">
        <p className="text-sm font-semibold text-slate-900 dark:text-white">{t('Water Intake')}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {water.current.toFixed(2)} / {water.target} {water.unit}
        </p>
        <button
          type="button"
          onClick={addGlass}
          className="mt-2 inline-flex items-center gap-1 rounded-full border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600 hover:border-sky-300 hover:text-sky-600 dark:border-white/10 dark:text-slate-300"
        >
          <Plus className="h-3 w-3" /> {t('Add glass')}
        </button>
      </div>
    </div>
  );
}
