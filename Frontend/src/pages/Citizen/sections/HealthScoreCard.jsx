import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, HeartPulse } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import ProgressRing from '../../../components/common/ProgressRing';
import { Skeleton } from '../../../components/common/Skeleton';
import Badge from '../../../components/common/Badge';
import { PATHS } from '../../../constants/routes';

const RISK_TONE = { Low: 'brand', Moderate: 'amber', High: 'rose' };
const PREVIEW_SCORE = { score: 78, risk: 'Low' };

export default function HealthScoreCard() {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 400);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="surface-card flex flex-col items-center p-6 text-center">
      <div className="flex items-center gap-2 self-start">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400">
          <HeartPulse className="h-4 w-4" />
        </span>
        <p className="text-sm font-semibold text-slate-900 dark:text-white">{t('AI Health Score')}</p>
      </div>

      {isLoading ? (
        <Skeleton className="mt-6 h-32 w-32 rounded-full" />
      ) : (
        <ProgressRing value={PREVIEW_SCORE.score} tone={RISK_TONE[PREVIEW_SCORE.risk]} size={128} className="mt-4">
          <div className="text-center">
            <p className="font-display text-3xl font-semibold text-slate-900 dark:text-white">{PREVIEW_SCORE.score}</p>
            <p className="text-[10px] uppercase tracking-wide text-slate-400">/ 100</p>
          </div>
        </ProgressRing>
      )}

      <Badge tone={RISK_TONE[PREVIEW_SCORE.risk]} className="mt-4">
        {t(PREVIEW_SCORE.risk)} {t('risk')}
      </Badge>

      <Link
        to={PATHS.CITIZEN_HEALTH_SCORE}
        className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400"
      >
        {t('Run a new assessment')} <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}
