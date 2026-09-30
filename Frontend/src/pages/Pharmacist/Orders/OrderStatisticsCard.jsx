import React from 'react';
import { ShoppingBag, Clock, Truck, CheckCircle2, XCircle } from 'lucide-react';

export default function OrderStatisticsCard({ stats, loading }) {
  const items = [
    {
      label: 'Total Orders',
      value: stats?.totalOrders ?? 0,
      icon: ShoppingBag,
      color: 'text-brand-600 dark:text-brand-400',
      bg: 'bg-brand-500/10'
    },
    {
      label: 'Pending Orders',
      value: stats?.pendingOrders ?? 0,
      icon: Clock,
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-500/10'
    },
    {
      label: 'Orders In Transit',
      value: stats?.inTransitOrders ?? 0,
      icon: Truck,
      color: 'text-sky-600 dark:text-sky-400',
      bg: 'bg-sky-500/10'
    },
    {
      label: 'Delivered Orders',
      value: stats?.deliveredOrders ?? 0,
      icon: CheckCircle2,
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-500/10'
    },
    {
      label: 'Cancelled Orders',
      value: stats?.cancelledOrders ?? 0,
      icon: XCircle,
      color: 'text-rose-600 dark:text-rose-400',
      bg: 'bg-rose-500/10'
    }
  ];

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
      {items.map((item, idx) => {
        const Icon = item.icon;
        return (
          <div key={idx} className="surface-card flex items-center gap-3.5 p-4 rounded-xl border border-slate-200/70 dark:border-white/10 shadow-sm">
            <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${item.bg}`}>
              <Icon className={`h-5 w-5 ${item.color}`} />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{item.label}</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white">
                {loading ? '...' : item.value}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
