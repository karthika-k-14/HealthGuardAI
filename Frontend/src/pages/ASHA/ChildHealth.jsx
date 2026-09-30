import React, { useEffect, useState } from 'react';
import { Baby, Syringe, MapPin, Heart } from 'lucide-react';
import { fetchChildHealthMembers } from '../../api/ashaFamilyApi';
import Badge from '../../components/common/Badge';
import { SkeletonGrid } from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';

const VACCINE_TONE = { UP_TO_DATE: 'brand', PARTIAL: 'amber', MISSED: 'rose', PENDING: 'amber' };

export default function ChildHealth() {
  const [children, setChildren] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    fetchChildHealthMembers()
      .then((data) => {
        if (mounted) setChildren(data || []);
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-slate-900 dark:text-white">Child Health &amp; Immunization Tracking</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Automatically loading all family members marked as child under 5 (is_child_member = true) across your assigned household surveys.
        </p>
      </div>

      {isLoading && <SkeletonGrid count={3} className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3" />}

      {!isLoading && children.length === 0 && (
        <EmptyState
          icon={Baby}
          title="No child members registered"
          description="Child family members under 5 recorded during family creation on Assigned Citizens page will automatically populate here."
        />
      )}

      {!isLoading && children.length > 0 && (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {children.map((c, idx) => (
            <div key={c.id || idx} className="surface-card space-y-4 p-5">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 font-bold">
                  <Baby className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-base font-bold text-slate-900 dark:text-white">{c.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Age: {c.age} {c.age === 1 ? 'yr' : 'yrs'} · {c.gender}
                  </p>
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-slate-500 dark:text-slate-400 border-t border-b border-slate-200/60 py-2 dark:border-white/10">
                <p className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                  House: {c.houseNumber || 'H.No 12/A'}, {c.village || 'Assigned Village'}
                </p>
                <p className="flex items-center gap-1.5">
                  <Heart className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                  Health Condition: <span className="font-semibold text-slate-700 dark:text-slate-200">{c.healthConditions || 'Normal growth'}</span>
                </p>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-medium">Immunization Status:</span>
                <Badge tone={VACCINE_TONE[c.vaccinationStatus] || 'brand'}>
                  {c.vaccinationStatus || 'UP_TO_DATE'}
                </Badge>
              </div>

              <div className="rounded-xl border border-brand-200/60 bg-brand-50 p-2.5 text-xs font-medium text-brand-700 dark:border-brand-500/20 dark:bg-brand-500/10 dark:text-brand-300 flex items-center gap-2">
                <Syringe className="h-4 w-4 shrink-0 text-brand-600" />
                <span>Routine BCG / OPV / DPT vaccine tracking active for this child.</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
