import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PackageX, ArrowRight } from 'lucide-react';
import { fetchLowStockSummary } from '../../../api/pharmacistApi';
import { Skeleton } from '../../../components/common/Skeleton';
import Badge from '../../../components/common/Badge';
import { PATHS } from '../../../constants/routes';

const STATUS_TONE = { 'Low Stock': 'amber', 'Out of Stock': 'rose' };

export default function LowStockSummaryWidget() {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    fetchLowStockSummary().then((data) => {
      if (mounted) {
        setItems(data);
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
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-signal-amber/10 text-signal-amber">
            <PackageX className="h-4 w-4" />
          </span>
          <p className="text-sm font-semibold text-slate-900 dark:text-white">Low Stock Summary</p>
        </div>
        <Link
          to={PATHS.PHARMACIST_STOCK_ALERTS}
          className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400"
        >
          View all <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="mt-4 space-y-2.5">
        {isLoading && Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
        {!isLoading && items.length === 0 && <p className="text-sm text-slate-400">Stock levels look healthy.</p>}
        {!isLoading &&
          items.slice(0, 4).map((i) => (
            <div key={i.id} className="flex items-center justify-between rounded-xl border border-slate-200/70 px-3 py-2 text-sm dark:border-white/10">
              <span className="truncate text-slate-700 dark:text-slate-200">{i.name}</span>
              <Badge tone={STATUS_TONE[i.stockStatus] || 'neutral'}>{i.quantity} left</Badge>
            </div>
          ))}
      </div>
    </div>
  );
}
