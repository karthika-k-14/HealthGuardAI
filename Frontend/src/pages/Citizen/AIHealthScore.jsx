import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HeartPulse, Info } from 'lucide-react';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import ProgressRing from '../../components/common/ProgressRing';
import { computeHealthScore } from '../../api/citizenApi';
import { cn } from '../../utils/cn';

const SYMPTOM_OPTIONS = ['Fever', 'Fatigue', 'Headache', 'Cough', 'Joint pain', 'Shortness of breath'];
const LIFESTYLE_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'sedentary', label: 'Sedentary' },
];
const RISK_TONE = { Low: 'brand', Moderate: 'amber', High: 'rose' };

function toggle(list, item) {
  return list.includes(item) ? list.filter((i) => i !== item) : [...list, item];
}

export default function AIHealthScore() {
  const [form, setForm] = useState({
    age: 30,
    gender: 'female',
    weight: 65,
    height: 165,
    lifestyle: 'moderate',
    symptoms: [],
  });
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const update = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const runAssessment = async () => {
    setIsLoading(true);
    const data = await computeHealthScore(form);
    setResult(data);
    setIsLoading(false);
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <span className="section-eyebrow">
          <HeartPulse className="h-3.5 w-3.5" /> Unique feature
        </span>
        <h1 className="mt-2 font-display text-2xl font-semibold text-slate-900 dark:text-white">
          AI Personal Health Score
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Enter a few details for a demo AI health assessment with personalized suggestions.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="surface-card p-6 sm:p-7">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label-text" htmlFor="age">
                Age: <span className="font-semibold text-brand-600 dark:text-brand-400">{form.age}</span>
              </label>
              <input
                id="age"
                type="range"
                min={1}
                max={90}
                value={form.age}
                onChange={(e) => update('age', Number(e.target.value))}
                className="w-full accent-brand-500"
              />
            </div>
            <div>
              <label className="label-text" htmlFor="gender">Gender</label>
              <select
                id="gender"
                value={form.gender}
                onChange={(e) => update('gender', e.target.value)}
                className="input-field"
              >
                <option value="female">Female</option>
                <option value="male">Male</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="label-text" htmlFor="weight">Weight (kg)</label>
              <input
                id="weight"
                type="number"
                min={20}
                max={200}
                value={form.weight}
                onChange={(e) => update('weight', Number(e.target.value))}
                className="input-field"
              />
            </div>
            <div>
              <label className="label-text" htmlFor="height">Height (cm)</label>
              <input
                id="height"
                type="number"
                min={100}
                max={220}
                value={form.height}
                onChange={(e) => update('height', Number(e.target.value))}
                className="input-field"
              />
            </div>
          </div>

          <div className="mt-4">
            <p className="label-text">Lifestyle</p>
            <div className="grid grid-cols-3 gap-2">
              {LIFESTYLE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => update('lifestyle', opt.value)}
                  className={cn(
                    'rounded-lg border px-2 py-2 text-xs font-medium transition-colors',
                    form.lifestyle === opt.value
                      ? 'border-brand-500 bg-brand-500/10 text-brand-700 dark:text-brand-300'
                      : 'border-slate-200 text-slate-600 hover:border-brand-300 dark:border-white/10 dark:text-slate-300'
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4">
            <p className="label-text">Symptoms (optional)</p>
            <div className="flex flex-wrap gap-2">
              {SYMPTOM_OPTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => update('symptoms', toggle(form.symptoms, s))}
                  className={cn(
                    'rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
                    form.symptoms.includes(s)
                      ? 'border-brand-500 bg-brand-500/10 text-brand-700 dark:text-brand-300'
                      : 'border-slate-200 text-slate-600 hover:border-brand-300 dark:border-white/10 dark:text-slate-300'
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <Button variant="primary" className="mt-6 w-full" onClick={runAssessment} isLoading={isLoading}>
            {!isLoading && 'Generate my health score'}
            {isLoading && 'Analyzing…'}
          </Button>
        </div>

        <div className="glass-panel flex flex-col items-center justify-center p-6 sm:p-7">
          <AnimatePresence mode="wait">
            {!result && !isLoading && (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center text-sm text-slate-400">
                Fill in your details and generate a score to see your animated health meter here.
              </motion.div>
            )}

            {result && (
              <motion.div
                key={result.score}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.35 }}
                className="w-full text-center"
              >
                <ProgressRing value={result.score} tone={RISK_TONE[result.risk]} size={160} strokeWidth={12} className="mx-auto">
                  <div>
                    <p className="font-display text-4xl font-semibold text-slate-900 dark:text-white">{result.score}</p>
                    <p className="text-xs uppercase tracking-wide text-slate-400">/ 100</p>
                  </div>
                </ProgressRing>

                <div className="mt-4 flex items-center justify-center gap-2">
                  <Badge tone={RISK_TONE[result.risk]}>{result.risk} risk</Badge>
                  <Badge tone="neutral">BMI {result.bmi}</Badge>
                </div>

                <div className="surface-card mt-5 p-4 text-left">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Personalized suggestions</p>
                  <ul className="mt-2 space-y-1.5">
                    {result.suggestions.map((s, i) => (
                      <li key={i} className="text-sm text-slate-600 dark:text-slate-300">• {s}</li>
                    ))}
                  </ul>
                </div>

                <p className="mt-4 flex items-start gap-1.5 text-left text-[11px] leading-snug text-slate-400">
                  <Info className="mt-0.5 h-3 w-3 shrink-0" />
                  Demonstration only — not a medical diagnosis. Consult a healthcare professional for real concerns.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
