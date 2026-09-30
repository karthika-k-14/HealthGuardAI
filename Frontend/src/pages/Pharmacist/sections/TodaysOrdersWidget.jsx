import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, ArrowRight, Calendar, Building2 } from 'lucide-react';
import { fetchOrders } from '../../../api/orderApi';
import { Skeleton } from '../../../components/common/Skeleton';
import Badge from '../../../components/common/Badge';
import { PATHS } from '../../../constants/routes';

const STATUS_TONES = {
  DRAFT: 'neutral',
  PLACED: 'amber',
  APPROVED: 'sky',
  SHIPPED: 'brand',
  DELIVERED: 'emerald',
  CANCELLED: 'rose'
};

export default function TodaysOrdersWidget() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    fetchOrders()
      .then((data) => {
        if (mounted) {
          const list = Array.isArray(data) ? data.slice(0, 4) : [];
          setOrders(list);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (mounted) {
          setOrders([]);
          setIsLoading(false);
        }
      });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="surface-card p-6 border border-slate-200/70 dark:border-white/10 rounded-2xl shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400">
            <ShoppingBag className="h-4 w-4" />
          </span>
          <div>
            <p className="text-sm font-semibold text-slate-900 dark:text-white">Recent Orders</p>
            <p className="text-[11px] text-slate-400">Medicine procurement tracker</p>
          </div>
        </div>
        <Link
          to={PATHS.PHARMACIST_ORDERS}
          className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400"
        >
          View all <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="mt-4 space-y-2.5">
        {isLoading && Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-14 w-full rounded-xl" />)}
        {!isLoading && orders.length === 0 && (
          <div className="py-6 text-center text-slate-400">
            <p className="text-xs">No procurement orders placed yet.</p>
            <Link
              to={PATHS.PHARMACIST_ORDERS}
              className="mt-1.5 inline-block text-xs font-semibold text-brand-600 hover:underline"
            >
              + Create Order
            </Link>
          </div>
        )}
        {!isLoading &&
          orders.map((o) => (
            <div
              key={o.id}
              className="flex flex-col gap-1.5 rounded-xl border border-slate-200/70 px-3.5 py-2.5 dark:border-white/10 hover:border-brand-500/30 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold font-mono text-slate-900 dark:text-white">
                    {o.orderNumber}
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium">
                    · {o.supplierName}
                  </span>
                </div>
                <Badge tone={STATUS_TONES[o.status?.toUpperCase()] || 'neutral'}>
                  {o.status}
                </Badge>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-0.5 border-t border-slate-100 dark:border-white/5">
                <span className="font-medium">
                  Quantity: <strong className="text-brand-600 dark:text-brand-400 font-mono">{o.totalQuantity ?? 0} units</strong> ({o.totalItems ?? o.items?.length ?? 0} items)
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3 text-slate-400" />
                  Expected: {o.expectedDeliveryDate || 'Standard'}
                </span>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
