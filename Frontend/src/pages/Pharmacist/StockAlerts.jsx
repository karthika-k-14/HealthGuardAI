import React, { useEffect, useState } from 'react';
import { PackageX, CalendarX2, Ban, Lightbulb } from 'lucide-react';
import { fetchMedicineRecommendations } from '../../api/pharmacyApi';
import { fetchMedicines as fetchInventory } from '../../api/pharmacistApi';
import Badge from '../../components/common/Badge';
import { SkeletonGrid } from '../../components/common/Skeleton';

export default function StockAlerts() {
  const [inventory, setInventory] = useState(null);
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    let mounted = true;
    fetchInventory().then((data) => {
      if (mounted) setInventory(data);
    });
    fetchMedicineRecommendations().then((data) => {
      if (mounted) setRecommendations(data);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const lowStock = inventory?.filter((i) => i.stockStatus === 'Low Stock') || [];
  const outOfStock = inventory?.filter((i) => i.stockStatus === 'Out of Stock') || [];
  const expiring = inventory?.filter((i) => {
    const days = (new Date(i.expiryDate) - new Date()) / (1000 * 60 * 60 * 24);
    return days >= 0 && days <= 60;
  }) || [];
  const expired = inventory?.filter((i) => i.stockStatus === 'Expired') || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-slate-900 dark:text-white">Low Stock & Expiry</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Stay ahead of shortages and expiring stock.
        </p>
      </div>

      {!inventory && <SkeletonGrid count={4} className="grid gap-5 sm:grid-cols-2" />}

      {inventory && (
        <div className="grid gap-5 sm:grid-cols-2">
          <section className="surface-card p-5">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-signal-amber/10 text-signal-amber">
                <PackageX className="h-4 w-4" />
              </span>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">Low Stock Alerts</p>
            </div>
            <div className="mt-4 space-y-2.5">
              {lowStock.length === 0 && <p className="text-sm text-slate-400">Nothing running low.</p>}
              {lowStock.map((i) => (
                <div key={i.id} className="flex items-center justify-between rounded-xl border border-slate-200/70 px-3 py-2 text-sm dark:border-white/10">
                  <span className="text-slate-700 dark:text-slate-200">{i.name}</span>
                  <Badge tone="amber">{i.quantity} {i.unit} left</Badge>
                </div>
              ))}
            </div>
          </section>

          <section className="surface-card p-5">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-signal-rose/10 text-signal-rose">
                <Ban className="h-4 w-4" />
              </span>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">Out of Stock</p>
            </div>
            <div className="mt-4 space-y-2.5">
              {outOfStock.length === 0 && <p className="text-sm text-slate-400">Nothing out of stock.</p>}
              {outOfStock.map((i) => (
                <div key={i.id} className="flex items-center justify-between rounded-xl border border-slate-200/70 px-3 py-2 text-sm dark:border-white/10">
                  <span className="text-slate-700 dark:text-slate-200">{i.name}</span>
                  <Badge tone="rose">Out of stock</Badge>
                </div>
              ))}
            </div>
          </section>

          <section className="surface-card p-5">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-signal-amber/10 text-signal-amber">
                <CalendarX2 className="h-4 w-4" />
              </span>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">Expiring Soon (60 days)</p>
            </div>
            <div className="mt-4 space-y-2.5">
              {expiring.length === 0 && <p className="text-sm text-slate-400">Nothing expiring soon.</p>}
              {expiring.map((i) => (
                <div key={i.id} className="flex items-center justify-between rounded-xl border border-slate-200/70 px-3 py-2 text-sm dark:border-white/10">
                  <span className="text-slate-700 dark:text-slate-200">{i.name}</span>
                  <span className="text-xs font-medium text-signal-amber">{new Date(i.expiryDate).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="surface-card p-5">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-200 text-slate-500 dark:bg-white/10 dark:text-slate-300">
                <CalendarX2 className="h-4 w-4" />
              </span>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">Expired</p>
            </div>
            <div className="mt-4 space-y-2.5">
              {expired.length === 0 && <p className="text-sm text-slate-400">No expired items.</p>}
              {expired.map((i) => (
                <div key={i.id} className="flex items-center justify-between rounded-xl border border-slate-200/70 px-3 py-2 text-sm dark:border-white/10">
                  <span className="text-slate-700 dark:text-slate-200">{i.name}</span>
                  <Badge tone="rose">Expired {new Date(i.expiryDate).toLocaleDateString()}</Badge>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      <div className="surface-card p-5">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400">
            <Lightbulb className="h-4 w-4" />
          </span>
          <p className="text-sm font-semibold text-slate-900 dark:text-white">Restock Suggestions</p>
        </div>
        <div className="mt-4 space-y-2.5">
          {recommendations.length === 0 && <p className="text-sm text-slate-400">No suggestions right now.</p>}
          {recommendations.map((r) => (
            <div key={r.name} className="rounded-xl border border-slate-200/70 px-3 py-2.5 text-sm dark:border-white/10">
              <p className="font-medium text-slate-800 dark:text-slate-100">{r.name}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{r.reason}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
