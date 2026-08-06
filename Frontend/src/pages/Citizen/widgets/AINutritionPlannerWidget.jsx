import React, { useEffect, useState } from 'react';
import { Salad, Flame } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { fetchNutritionPlan, fetchNutritionGoals } from '../../../api/citizenApi';
import { Skeleton } from '../../../components/common/Skeleton';
import { cn } from '../../../utils/cn';

export default function AINutritionPlannerWidget() {
  const { t } = useTranslation();
  const [goals, setGoals] = useState([]);
  const [goal, setGoal] = useState('maintenance');
  const [plan, setPlan] = useState(null);

  useEffect(() => {
    fetchNutritionGoals().then(setGoals);
  }, []);

  useEffect(() => {
    setPlan(null);
    fetchNutritionPlan(goal).then(setPlan);
  }, [goal]);

  return (
    <div className="surface-card p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-300">
            <Salad className="h-4 w-4" />
          </span>
          <p className="text-sm font-semibold text-slate-900 dark:text-white">{t('AI Nutrition Planner')}</p>
        </div>
      </div>

      {goals.length > 0 && (
        <div className="mt-3 flex gap-1.5">
          {goals.map((g) => (
            <button
              key={g.key}
              type="button"
              onClick={() => setGoal(g.key)}
              className={cn(
                'rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors',
                goal === g.key
                  ? 'border-brand-500 bg-brand-500/10 text-brand-700 dark:text-brand-300'
                  : 'border-slate-200 text-slate-500 hover:border-brand-300 dark:border-white/10 dark:text-slate-400'
              )}
            >
              {t(g.label)}
            </button>
          ))}
        </div>
      )}

      {!plan ? (
        <div className="mt-4 space-y-2">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>
      ) : (
        <>
          <p className="mt-4 flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
            <Flame className="h-3.5 w-3.5 text-signal-amber" /> ~{plan.calorieTarget} kcal/day target
          </p>
          <div className="mt-3 space-y-2">
            {plan.meals.map((m) => (
              <div key={m.slot} className="flex items-start gap-3 rounded-xl border border-slate-200/70 px-3 py-2 dark:border-white/10">
                <span className="w-16 shrink-0 text-[11px] font-semibold uppercase tracking-wide text-brand-600 dark:text-brand-400">
                  {m.slot}
                </span>
                <span className="text-sm text-slate-600 dark:text-slate-300">{m.item}</span>
              </div>
            ))}
          </div>
        </>
      )}
      <p className="mt-3 text-[11px] text-slate-400">{t('demo_nutrition_disclaimer')}</p>
    </div>
  );
}
