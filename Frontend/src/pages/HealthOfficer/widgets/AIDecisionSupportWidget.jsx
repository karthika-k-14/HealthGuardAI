import React, { useEffect, useState } from 'react';
import { BrainCircuit } from 'lucide-react';
import { fetchAIDecisionSupport } from '../../../api/officerApi';
import { Skeleton } from '../../../components/common/Skeleton';
import Badge from '../../../components/common/Badge';

const PRIORITY_TONE = { High: 'rose', Medium: 'amber', Low: 'brand' };

export default function AIDecisionSupportWidget() {
  const [decisions, setDecisions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    fetchAIDecisionSupport().then((data) => {
      if (mounted) {
        setDecisions(data);
        setIsLoading(false);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="surface-card p-6">
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400">
          <BrainCircuit className="h-4 w-4" />
        </span>
        <p className="text-sm font-semibold text-slate-900 dark:text-white">AI Decision Support</p>
      </div>

      <div className="mt-4 space-y-2.5">
        {isLoading && Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
        {!isLoading &&
          decisions.map((d) => (
            <div key={d.id} className="rounded-xl border border-slate-200/70 p-3 dark:border-white/10">
              <div className="flex items-center justify-between">
                <Badge tone={PRIORITY_TONE[d.priority]}>{d.priority} priority</Badge>
              </div>
              <p className="mt-1.5 text-sm text-slate-700 dark:text-slate-200">{d.recommendation}</p>
            </div>
          ))}
      </div>
    </div>
  );
}
