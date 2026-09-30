import React, { useEffect, useState } from 'react';
import { PackageX, CalendarX2, Ban, Lightbulb } from 'lucide-react';
import {
  fetchLowStockMedicines,
  fetchOutOfStockMedicines,
  fetchExpiringMedicines,
  fetchExpiredMedicines,
  fetchRestockRecommendations,
} from '../../api/pharmacistApi';
import Badge from '../../components/common/Badge';
import { SkeletonGrid } from '../../components/common/Skeleton';

export default function StockAlerts() {
  const [lowStock, setLowStock] = useState([]);
  const [outOfStock, setOutOfStock] = useState([]);
  const [expiring, setExpiring] = useState([]);
  const [expired, setExpired] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    Promise.all([
      fetchLowStockMedicines(),
      fetchOutOfStockMedicines(),
      fetchExpiringMedicines(),
      fetchExpiredMedicines(),
      fetchRestockRecommendations(),
    ])
      .then(([low, out, exp, expd, recs]) => {
        if (mounted) {
          setLowStock(Array.isArray(low) ? low : []);
          setOutOfStock(Array.isArray(out) ? out : []);
          setExpiring(Array.isArray(exp) ? exp : []);
          setExpired(Array.isArray(expd) ? expd : []);
          setRecommendations(Array.isArray(recs) ? recs : []);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        console.error('Error loading stock alert data:', err);
        if (mounted) setIsLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-slate-900 dark:text-white">Low Stock & Expiry</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Real-time alerts powered by Machine Learning Demand Forecasting and PostgreSQL inventory tables.
        </p>
      </div>

      {isLoading && <SkeletonGrid count={4} className="grid gap-5 sm:grid-cols-2" />}

      {!isLoading && (
        <div className="grid gap-5 sm:grid-cols-2">
          {/* 1. Low Stock Alerts Card (from medicine_demand_forecast where risk_level = 'CRITICAL' OR estimated_days_of_stock_remaining < 15) */}
          <section className="surface-card p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-signal-amber/10 text-signal-amber">
                  <PackageX className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">Low Stock Alerts</p>
                  <p className="text-[11px] text-slate-400">ML Forecast Risk: CRITICAL or Days &lt; 15</p>
                </div>
              </div>
              <Badge tone={lowStock.length > 0 ? 'amber' : 'neutral'}>{lowStock.length} items</Badge>
            </div>
            <div className="mt-4 space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {lowStock.length === 0 && <p className="text-sm text-slate-400">Nothing running low. Stock velocity optimal.</p>}
              {lowStock.map((i) => (
                <div
                  key={i.id || i.medicineId}
                  className="flex items-center justify-between rounded-xl border border-slate-200/70 p-3 text-sm dark:border-white/10"
                >
                  <div>
                    <span className="font-medium text-slate-800 dark:text-slate-100">{i.medicineName || i.name}</span>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Days Remaining: <span className="font-semibold text-amber-600 dark:text-amber-400">{i.estimatedDaysOfStockRemaining ?? i.daysRemaining ?? 'N/A'}</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge tone={i.riskLevel === 'CRITICAL' ? 'rose' : 'amber'}>
                      {i.currentStock ?? i.quantity} left
                    </Badge>
                    <span className="block text-[10px] font-semibold uppercase text-rose-500 mt-0.5">
                      {i.riskLevel || 'CRITICAL'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 2. Out of Stock Card (from medicines where quantity = 0) */}
          <section className="surface-card p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-signal-rose/10 text-signal-rose">
                  <Ban className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">Out of Stock</p>
                  <p className="text-[11px] text-slate-400">Inventory Quantity = 0</p>
                </div>
              </div>
              <Badge tone={outOfStock.length > 0 ? 'rose' : 'neutral'}>{outOfStock.length} items</Badge>
            </div>
            <div className="mt-4 space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {outOfStock.length === 0 && <p className="text-sm text-slate-400">Nothing out of stock.</p>}
              {outOfStock.map((i) => (
                <div
                  key={i.id}
                  className="flex items-center justify-between rounded-xl border border-slate-200/70 px-3 py-2 text-sm dark:border-white/10"
                >
                  <span className="text-slate-700 dark:text-slate-200">{i.name || i.medicineName}</span>
                  <Badge tone="rose">Out of stock (0 units)</Badge>
                </div>
              ))}
            </div>
          </section>

          {/* 3. ML Expiry-Risk Alerting (<= 60 days) */}
          <section className="surface-card p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-signal-amber/10 text-signal-amber">
                  <CalendarX2 className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">Expiry Risk Alerts (≤ 60 days)</p>
                  <p className="text-[11px] text-slate-400">Evaluated by Expiry Date &amp; ML Velocity Rules</p>
                </div>
              </div>
              <Badge tone={expiring.length > 0 ? 'amber' : 'neutral'}>{expiring.length} items</Badge>
            </div>
            <div className="mt-4 space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {expiring.length === 0 && <p className="text-sm text-slate-400">Nothing expiring soon.</p>}
              {expiring.map((i) => (
                <div
                  key={i.id}
                  className="flex items-center justify-between rounded-xl border border-slate-200/70 px-3 py-2 text-sm dark:border-white/10"
                >
                  <div>
                    <span className="font-medium text-slate-700 dark:text-slate-200">{i.name || i.medicineName}</span>
                    <p className="text-[11px] text-slate-400">
                      Batch: {i.batchNumber || 'BAT-1005'} · Exp: {new Date(i.expiryDate).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge tone="amber">Expiring Soon</Badge>
                </div>
              ))}
            </div>
          </section>

          {/* 4. Expired Card (expiry_date < CURRENT_DATE) */}
          <section className="surface-card p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-200 text-slate-500 dark:bg-white/10 dark:text-slate-300">
                  <CalendarX2 className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">Expired</p>
                  <p className="text-[11px] text-slate-400">Expiry Date &lt; Current Date</p>
                </div>
              </div>
              <Badge tone={expired.length > 0 ? 'rose' : 'neutral'}>{expired.length} items</Badge>
            </div>
            <div className="mt-4 space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {expired.length === 0 && <p className="text-sm text-slate-400">No expired items.</p>}
              {expired.map((i) => (
                <div
                  key={i.id}
                  className="flex items-center justify-between rounded-xl border border-slate-200/70 px-3 py-2 text-sm dark:border-white/10"
                >
                  <span className="text-slate-700 dark:text-slate-200">{i.name || i.medicineName}</span>
                  <Badge tone="rose">Expired {new Date(i.expiryDate).toLocaleDateString()}</Badge>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {/* 5. Restock Suggestions Card (strictly from medicine_demand_forecasts) */}
      <div className="surface-card p-6">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400">
            <Lightbulb className="h-4 w-4" />
          </span>
          <div>
            <p className="text-base font-semibold text-slate-900 dark:text-white">Restock Suggestions</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Generated exclusively from ML Demand Forecast records (table: <code className="text-[11px]">medicine_demand_forecasts</code>)
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {recommendations.length === 0 && !isLoading && (
            <p className="col-span-full py-4 text-center text-sm text-slate-400">
              No restock suggestions right now. All inventory levels match projected demand.
            </p>
          )}
          {recommendations.map((r, idx) => (
            <div
              key={r.medicineId || r.medicineName || idx}
              className="flex flex-col justify-between rounded-xl border border-slate-200/80 bg-slate-50/50 p-4 transition-all hover:shadow-sm dark:border-white/10 dark:bg-white/[0.02]"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-slate-900 dark:text-white text-base">
                    {r.medicineName || r.name}
                  </h3>
                  <Badge tone={r.riskLevel === 'CRITICAL' ? 'rose' : (r.riskLevel === 'HIGH' ? 'amber' : 'emerald')}>
                    {r.riskLevel || 'CRITICAL'}
                  </Badge>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-lg bg-white p-2 border border-slate-100 dark:bg-white/5 dark:border-white/5">
                    <span className="text-slate-400 block">Current Stock</span>
                    <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">{r.currentStock}</span>
                  </div>
                  <div className="rounded-lg bg-white p-2 border border-slate-100 dark:bg-white/5 dark:border-white/5">
                    <span className="text-slate-400 block">Predicted Demand</span>
                    <span className="text-sm font-semibold text-brand-600 dark:text-brand-400">{r.predictedDemand}</span>
                  </div>
                  <div className="rounded-lg bg-white p-2 border border-slate-100 dark:bg-white/5 dark:border-white/5">
                    <span className="text-slate-400 block">Recommended Order</span>
                    <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">{r.recommendedOrder}</span>
                  </div>
                  <div className="rounded-lg bg-white p-2 border border-slate-100 dark:bg-white/5 dark:border-white/5">
                    <span className="text-slate-400 block">Days Remaining</span>
                    <span className="text-sm font-semibold text-amber-600 dark:text-amber-400">
                      {r.estimatedDaysOfStockRemaining ?? r.daysRemaining ?? 'N/A'}
                    </span>
                  </div>
                </div>

                <div className="mt-3 rounded-lg bg-brand-50/60 p-2.5 dark:bg-brand-950/20 border border-brand-100 dark:border-brand-900/30">
                  <span className="block text-[11px] font-semibold uppercase tracking-wider text-brand-700 dark:text-brand-300">
                    Insight
                  </span>
                  <p className="mt-0.5 text-xs text-slate-700 dark:text-slate-300">
                    {r.insights || r.reason || 'High demand forecast predicted by ML model'}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
