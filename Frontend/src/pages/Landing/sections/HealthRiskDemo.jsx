import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Info } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Button from '../../../components/common/Button';
import Badge from '../../../components/common/Badge';
import { computeMockHealthRisk } from '../../../api/landingApi';
import { cn } from '../../../utils/cn';

const BAND_TONE = { Low: 'brand', Moderate: 'amber', High: 'rose' };

function toggleSymptom(list, symptom) {
  return list.includes(symptom) ? list.filter((s) => s !== symptom) : [...list, symptom];
}

export default function HealthRiskDemo() {
  const { t } = useTranslation();
  const [age, setAge] = useState(30);
  const [symptoms, setSymptoms] = useState([]);
  const [lifestyle, setLifestyle] = useState('moderate');
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const SYMPTOM_OPTIONS = [
    { key: 'Fever', label: t('Fever') },
    { key: 'Fatigue', label: t('Fatigue') },
    { key: 'Headache', label: t('Headache') },
    { key: 'Cough', label: t('Cough') },
    { key: 'Joint pain', label: t('Joint pain') },
  ];
  const LIFESTYLE_OPTIONS = [
    { value: 'active', label: t('Active') },
    { value: 'moderate', label: t('Moderate') },
    { value: 'sedentary', label: t('Sedentary') },
  ];

  const runDemo = async () => {
    setIsLoading(true);
    const data = await computeMockHealthRisk({ age, symptoms, lifestyle });
    setResult(data);
    setIsLoading(false);
  };

  return (
    <div className="glass-panel p-6 sm:p-7">
      <div className="flex items-center gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400">
          <Sparkles className="h-4.5 w-4.5" aria-hidden="true" />
        </span>
        <div>
          <p className="text-sm font-semibold text-slate-900 dark:text-white">{t('AI Health Risk Demo')}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">{t('See how a risk score could look')}</p>
        </div>
      </div>

      <div className="mt-5 space-y-4">
        <div>
          <label htmlFor="risk-age" className="label-text">
            {t('Age')}: <span className="font-semibold text-brand-600 dark:text-brand-400">{age}</span>
          </label>
          <input
            id="risk-age"
            type="range"
            min={1}
            max={90}
            value={age}
            onChange={(e) => setAge(Number(e.target.value))}
            className="w-full accent-brand-500"
          />
        </div>

        <div>
          <p className="label-text">{t('Symptoms (optional)')}</p>
          <div className="flex flex-wrap gap-2">
            {SYMPTOM_OPTIONS.map((s) => (
              <button
                key={s.key}
                type="button"
                onClick={() => setSymptoms((prev) => toggleSymptom(prev, s.key))}
                className={cn(
                  'rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
                  symptoms.includes(s.key)
                    ? 'border-brand-500 bg-brand-500/10 text-brand-700 dark:text-brand-300'
                    : 'border-slate-200 text-slate-600 hover:border-brand-300 dark:border-white/10 dark:text-slate-300'
                )}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="label-text">{t('Lifestyle')}</p>
          <div className="grid grid-cols-3 gap-2">
            {LIFESTYLE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setLifestyle(opt.value)}
                className={cn(
                  'rounded-lg border px-2 py-2 text-xs font-medium transition-colors',
                  lifestyle === opt.value
                    ? 'border-brand-500 bg-brand-500/10 text-brand-700 dark:text-brand-300'
                    : 'border-slate-200 text-slate-600 hover:border-brand-300 dark:border-white/10 dark:text-slate-300'
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <Button variant="primary" className="w-full" onClick={runDemo} isLoading={isLoading}>
          {!isLoading && t('Generate demo score')}
          {isLoading && t('Calculating…')}
        </Button>

        <AnimatePresence mode="wait">
          {result && (
            <motion.div
              key={result.score}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="surface-card p-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{t('Mock health score')}</p>
                  <p className="font-display text-3xl font-semibold text-slate-900 dark:text-white">
                    {result.score}
                    <span className="text-base font-normal text-slate-400">/100</span>
                  </p>
                </div>
                <Badge tone={BAND_TONE[result.band]}>{t(result.band)} {t('risk')}</Badge>
              </div>

              <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
                <motion.div
                  className={cn(
                    'h-full rounded-full',
                    result.band === 'High' && 'bg-signal-rose',
                    result.band === 'Moderate' && 'bg-signal-amber',
                    result.band === 'Low' && 'bg-brand-500'
                  )}
                  initial={{ width: 0 }}
                  animate={{ width: `${result.score}%` }}
                  transition={{ duration: 0.7, ease: 'easeOut' }}
                />
              </div>

              <ul className="mt-4 space-y-1.5">
                {result.factors.map((f) => (
                  <li key={f.label} className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 dark:text-slate-400">{t(f.label)}</span>
                    <span className="font-medium text-slate-700 dark:text-slate-200">{t(f.impact)}</span>
                  </li>
                ))}
              </ul>

              <p className="mt-4 flex items-start gap-1.5 text-[11px] leading-snug text-slate-400">
                <Info className="mt-0.5 h-3 w-3 shrink-0" />
                {t('demo_disclaimer')}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
