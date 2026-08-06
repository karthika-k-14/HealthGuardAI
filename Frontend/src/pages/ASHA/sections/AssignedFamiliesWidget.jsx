import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, ArrowRight } from 'lucide-react';
import { fetchFamilies } from '../../../api/ashaApi';
import { Skeleton } from '../../../components/common/Skeleton';
import Badge from '../../../components/common/Badge';
import { PATHS } from '../../../constants/routes';

const RISK_TONE = { High: 'rose', Medium: 'amber', Low: 'brand', Critical: 'critical' };

export default function AssignedFamiliesWidget() {
  const [families, setFamilies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    fetchFamilies().then((data) => {
      if (mounted) {
        setFamilies(data);
        setIsLoading(false);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="surface-card p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400">
            <Users className="h-4 w-4" />
          </span>
          <p className="text-sm font-semibold text-slate-900 dark:text-white">Assigned Families</p>
        </div>
        <Link
          to={PATHS.ASHA_FAMILIES}
          className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400"
        >
          View all <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="mt-4 space-y-3">
        {isLoading && Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
        {!isLoading &&
          families.slice(0, 4).map((f) => (
            <div key={f.id} className="flex items-center justify-between gap-3 rounded-xl border border-slate-200/70 px-3 py-2.5 dark:border-white/10">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-100">{f.headName}</p>
                <p className="truncate text-xs text-slate-400">{f.address}</p>
              </div>
              <Badge tone={RISK_TONE[f.riskLevel]}>{f.riskLevel}</Badge>
            </div>
          ))}
      </div>
    </div>
  );
}
