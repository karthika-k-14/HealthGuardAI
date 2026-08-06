import React, { useEffect, useState } from 'react';
import { Truck, Phone, Package } from 'lucide-react';
import { fetchSuppliers } from '../../api/pharmacyApi';
import Badge from '../../components/common/Badge';
import { SkeletonGrid } from '../../components/common/Skeleton';

const DELIVERY_TONE = { 'On Time': 'brand', Delayed: 'rose', 'In Transit': 'sky' };
const PAYMENT_TONE = { Paid: 'brand', Pending: 'amber', 'Partially Paid': 'sky' };

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState(null);

  useEffect(() => {
    let mounted = true;
    fetchSuppliers().then((data) => {
      if (mounted) setSuppliers(data);
    });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-slate-900 dark:text-white">Supplier Management</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Track your suppliers, deliveries, and payment status.
        </p>
      </div>

      {!suppliers && <SkeletonGrid count={4} className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4" />}

      {suppliers && (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {suppliers.map((s) => (
            <div key={s.id} className="surface-card space-y-3 p-5">
              <div className="flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400">
                  <Truck className="h-4 w-4" />
                </span>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">{s.name}</p>
              </div>

              <p className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                <Phone className="h-3.5 w-3.5" /> {s.contact}
              </p>
              <p className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                <Package className="h-3.5 w-3.5" /> {s.products} products supplied
              </p>

              <div className="flex flex-wrap gap-2 pt-1">
                <Badge tone={DELIVERY_TONE[s.deliveryStatus] || 'neutral'}>{s.deliveryStatus}</Badge>
                <Badge tone={PAYMENT_TONE[s.paymentStatus] || 'neutral'}>{s.paymentStatus}</Badge>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
