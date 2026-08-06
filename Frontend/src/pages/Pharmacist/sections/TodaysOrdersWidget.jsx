import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import { fetchTodaysOrders } from '../../../api/pharmacyApi';
import { Skeleton } from '../../../components/common/Skeleton';
import { PATHS } from '../../../constants/routes';

export default function TodaysOrdersWidget() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    fetchTodaysOrders().then((data) => {
      if (mounted) {
        setOrders(data);
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
            <ShoppingBag className="h-4 w-4" />
          </span>
          <p className="text-sm font-semibold text-slate-900 dark:text-white">Today's Orders</p>
        </div>
        <Link
          to={PATHS.PHARMACIST_ORDERS}
          className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400"
        >
          View all <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="mt-4 space-y-2.5">
        {isLoading && Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
        {!isLoading && orders.length === 0 && <p className="text-sm text-slate-400">No new orders yet.</p>}
        {!isLoading &&
          orders.map((o) => (
            <div key={o.id} className="flex items-center justify-between rounded-xl border border-slate-200/70 px-3 py-2.5 dark:border-white/10">
              <div>
                <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{o.patient}</p>
                <p className="text-xs text-slate-400">{o.items} items · {o.time}</p>
              </div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">₹{o.total}</p>
            </div>
          ))}
      </div>
    </div>
  );
}
