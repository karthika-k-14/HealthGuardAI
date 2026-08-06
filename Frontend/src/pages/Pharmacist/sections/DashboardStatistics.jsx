import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, PackageCheck, ClipboardCheck, Boxes } from 'lucide-react';
import { fetchPharmacistDashboard } from '../../../api/pharmacistApi';
import { fetchDashboardStats } from '../../../api/pharmacyApi';
import { SkeletonGrid } from '../../../components/common/Skeleton';

const STAT_ITEMS = [
  { key: 'todaysPrescriptions', fallbackKey: 'todaysOrders', label: "Today's Prescriptions", icon: ShoppingCart, tone: 'text-brand-600 dark:text-brand-400 bg-brand-500/10' },
  { key: 'medicinesDispensedToday', fallbackKey: 'todaysRevenue', label: "Dispensed Today", icon: PackageCheck, tone: 'text-emerald-600 dark:text-emerald-300 bg-emerald-500/10' },
  { key: 'pendingPrescriptionRequests', fallbackKey: 'prescriptionsVerified', label: 'Pending Requests', icon: ClipboardCheck, tone: 'text-sky-600 dark:text-sky-400 bg-sky-500/10' },
  { key: 'totalMedicines', fallbackKey: 'totalInventoryItems', label: 'Total Medicines', icon: Boxes, tone: 'text-purple-600 dark:text-purple-300 bg-purple-500/10' },
];

export default function DashboardStatistics() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    let mounted = true;
    fetchPharmacistDashboard()
      .then((data) => {
        if (mounted && data) setStats(data);
      })
      .catch(() => {
        fetchDashboardStats().then((data) => {
          if (mounted) setStats(data);
        });
      });
    return () => {
      mounted = false;
    };
  }, []);

  if (!stats) return <SkeletonGrid count={4} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" />;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {STAT_ITEMS.map((item, i) => {
        const value = stats[item.key] ?? stats[item.fallbackKey] ?? 0;
        return (
          <motion.div
            key={item.key}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.06 }}
            className="surface-card flex items-center gap-3 p-5"
          >
            <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${item.tone}`}>
              <item.icon className="h-5 w-5" />
            </span>
            <div>
              <p className="font-display text-xl font-semibold text-slate-900 dark:text-white">
                {value.toLocaleString()}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{item.label}</p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

