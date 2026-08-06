import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { TrendingUp, TrendingDown, Minus, TriangleAlert, Send } from 'lucide-react';
import { fetchDiseaseSurveillance, submitCaseReport } from '../../api/ashaApi';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import { SkeletonGrid } from '../../components/common/Skeleton';
import { cn } from '../../utils/cn';

const TREND_ICON = { up: TrendingUp, down: TrendingDown, steady: Minus };
const TREND_TONE = { up: 'text-signal-rose', down: 'text-brand-600', steady: 'text-slate-400' };
const DISEASES = ['Fever', 'Dengue', 'Malaria', 'TB', 'COVID', 'Other'];

export default function DiseaseSurveillance() {
  const [data, setData] = useState(null);
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm();

  useEffect(() => {
    let mounted = true;
    fetchDiseaseSurveillance().then((res) => {
      if (mounted) setData(res);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const onSubmit = async (values) => {
    const report = await submitCaseReport(values);
    setData((prev) => ({ ...prev, recentReports: [{ ...report, patientAgeGroup: values.ageGroup }, ...prev.recentReports] }));
    toast.success('Suspected case reported');
    reset();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-slate-900 dark:text-white">Disease Surveillance</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Track suspected case patterns and report new cases from the field.
        </p>
      </div>

      {!data && <SkeletonGrid count={6} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" />}

      {data && (
        <>
          {data.outbreakAlerts.length > 0 && (
            <div className="space-y-2">
              {data.outbreakAlerts.map((a) => (
                <div key={a.id} className="flex items-start gap-3 rounded-xl border border-signal-rose/30 bg-signal-rose/5 p-4">
                  <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-signal-rose" />
                  <div>
                    <p className="text-sm font-semibold text-signal-rose">{a.disease} outbreak alert — {a.area}</p>
                    <p className="text-xs text-slate-600 dark:text-slate-300">{a.message}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.caseCounts.map((d) => {
              const TrendIcon = TREND_ICON[d.trend];
              return (
                <div key={d.disease} className="surface-card flex items-center justify-between p-4">
                  <div>
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{d.disease}</p>
                    <p className="text-xs text-slate-400">last 7 days</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-display text-xl font-semibold text-slate-900 dark:text-white">{d.count7d}</span>
                    <TrendIcon className={cn('h-4 w-4', TREND_TONE[d.trend])} />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="surface-card p-5">
              <p className="text-sm font-semibold text-slate-900 dark:text-white">Report a Suspected Case</p>
              <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-3">
                <select {...register('disease', { required: true })} className="input-field text-sm">
                  {DISEASES.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
                <select {...register('ageGroup', { required: true })} className="input-field text-sm">
                  <option value="Child">Child</option>
                  <option value="Adult">Adult</option>
                  <option value="Elderly">Elderly</option>
                </select>
                <textarea
                  {...register('notes')}
                  rows={3}
                  placeholder="Symptoms and observations…"
                  className="input-field text-sm"
                />
                <Button type="submit" variant="primary" isLoading={isSubmitting} className="w-full text-sm">
                  {!isSubmitting && (
                    <>
                      <Send className="h-4 w-4" /> Submit Report
                    </>
                  )}
                </Button>
              </form>
            </div>

            <div className="surface-card p-5">
              <p className="text-sm font-semibold text-slate-900 dark:text-white">Recent Reports</p>
              <div className="mt-4 space-y-2.5">
                {data.recentReports.map((r) => (
                  <div key={r.id} className="flex items-center justify-between rounded-xl border border-slate-200/70 px-3 py-2 text-sm dark:border-white/10">
                    <div>
                      <p className="font-medium text-slate-800 dark:text-slate-100">{r.disease}</p>
                      <p className="text-xs text-slate-400">{r.patientAgeGroup} · {r.reportedOn ? new Date(r.reportedOn).toLocaleDateString() : 'just now'}</p>
                    </div>
                    <Badge tone={r.status === 'resolved' ? 'brand' : r.status === 'referred' ? 'amber' : 'sky'}>{r.status}</Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
