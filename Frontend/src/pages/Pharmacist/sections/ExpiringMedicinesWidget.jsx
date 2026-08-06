import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarX2, ArrowRight } from 'lucide-react';
import { fetchExpiringMedicines } from '../../../api/pharmacistApi';
import { Skeleton } from '../../../components/common/Skeleton';
import { PATHS } from '../../../constants/routes';

export default function ExpiringMedicinesWidget() {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    fetchExpiringMedicines().then((data) => {
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
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-signal-rose/10 text-signal-rose">
            <CalendarX2 className="h-4 w-4" />
          </span>
          <p className="text-sm font-semibold text-slate-900 dark:text-white">Expiring Medicines</p>
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
        {!isLoading && items.length === 0 && <p className="text-sm text-slate-400">Nothing expiring soon.</p>}
        {!isLoading &&
          items.slice(0, 4).map((i) => (
            <div key={i.id} className="flex items-center justify-between rounded-xl border border-slate-200/70 px-3 py-2 text-sm dark:border-white/10">
              <span className="truncate text-slate-700 dark:text-slate-200">{i.name}</span>
              <span className="text-xs font-medium text-signal-rose">{new Date(i.expiryDate).toLocaleDateString()}</span>
            </div>
          ))}
      </div>
    </div>
  );
}
