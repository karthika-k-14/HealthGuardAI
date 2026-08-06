import React, { useEffect, useState } from 'react';
import { ShoppingCart, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { fetchOrders } from '../../api/pharmacyApi';
import { SkeletonGrid } from '../../components/common/Skeleton';

export default function Orders() {
  const [orders, setOrders] = useState(null);

  useEffect(() => {
    let mounted = true;
    fetchOrders().then((data) => {
      if (mounted) setOrders(data);
    });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-slate-900 dark:text-white">Orders</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Manage new, pending, completed, and cancelled orders.</p>
      </div>

      {!orders && <SkeletonGrid count={4} className="grid gap-6 lg:grid-cols-4" />}

      {orders && (
        <div className="grid gap-6 lg:grid-cols-4">
          <section className="surface-card p-5">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400">
                <ShoppingCart className="h-4 w-4" />
              </span>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">New</p>
            </div>
            <div className="mt-4 space-y-2.5">
              {orders.new.map((o) => (
                <div key={o.id} className="rounded-xl border border-slate-200/70 p-3 text-sm dark:border-white/10">
                  <p className="font-medium text-slate-800 dark:text-slate-100">{o.patient}</p>
                  <p className="text-xs text-slate-400">{o.items} items · ₹{o.total}</p>
                  <p className="mt-1 text-xs text-slate-400">{o.time}</p>
                </div>
              ))}
              {orders.new.length === 0 && <p className="text-sm text-slate-400">No new orders.</p>}
            </div>
          </section>

          <section className="surface-card p-5">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-signal-amber/10 text-signal-amber">
                <Clock className="h-4 w-4" />
              </span>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">Pending</p>
            </div>
            <div className="mt-4 space-y-2.5">
              {orders.pending.map((o) => (
                <div key={o.id} className="rounded-xl border border-slate-200/70 p-3 text-sm dark:border-white/10">
                  <p className="font-medium text-slate-800 dark:text-slate-100">{o.patient}</p>
                  <p className="text-xs text-slate-400">{o.items} items · ₹{o.total}</p>
                  <p className="mt-1 text-xs text-signal-amber">{o.note}</p>
                </div>
              ))}
              {orders.pending.length === 0 && <p className="text-sm text-slate-400">Nothing pending.</p>}
            </div>
          </section>

          <section className="surface-card p-5">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400">
                <CheckCircle2 className="h-4 w-4" />
              </span>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">Completed</p>
            </div>
            <div className="mt-4 space-y-2.5">
              {orders.completed.map((o) => (
                <div key={o.id} className="rounded-xl border border-slate-200/70 p-3 text-sm dark:border-white/10">
                  <p className="font-medium text-slate-800 dark:text-slate-100">{o.patient}</p>
                  <p className="text-xs text-slate-400">{o.items} items · ₹{o.total}</p>
                  <p className="mt-1 text-xs text-slate-400">{new Date(o.date).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="surface-card p-5">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-signal-rose/10 text-signal-rose">
                <XCircle className="h-4 w-4" />
              </span>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">Cancelled</p>
            </div>
            <div className="mt-4 space-y-2.5">
              {orders.cancelled.map((o) => (
                <div key={o.id} className="rounded-xl border border-slate-200/70 p-3 text-sm dark:border-white/10">
                  <p className="font-medium text-slate-800 dark:text-slate-100">{o.patient}</p>
                  <p className="text-xs text-slate-400">{o.items} items · ₹{o.total}</p>
                  <p className="mt-1 text-xs text-slate-400">{o.reason}</p>
                </div>
              ))}
              {orders.cancelled.length === 0 && <p className="text-sm text-slate-400">No cancellations.</p>}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
