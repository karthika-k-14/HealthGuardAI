import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, UserCheck, Hospital, Megaphone, Bot, Activity } from 'lucide-react';
import { fetchPlatformStatistics } from '../../../api/adminApi';
import { SkeletonGrid } from '../../../components/common/Skeleton';

const ITEMS = [
  { key: 'totalUsers', label: 'Total Users', icon: Users, tone: 'text-brand-600 dark:text-brand-400 bg-brand-500/10' },
  { key: 'activeUsers', label: 'Active Users', icon: UserCheck, tone: 'text-sky-600 dark:text-sky-400 bg-sky-500/10' },
  { key: 'totalHospitals', label: 'Hospitals', icon: Hospital, tone: 'text-purple-600 dark:text-purple-300 bg-purple-500/10' },
  { key: 'totalCampaigns', label: 'Active Campaigns', icon: Megaphone, tone: 'text-amber-600 dark:text-amber-300 bg-signal-amber/10' },
  { key: 'aiInteractions', label: 'AI Interactions', icon: Bot, tone: 'text-indigo-600 dark:text-indigo-300 bg-indigo-500/10' },
  { key: 'systemUptimePercent', label: 'System Uptime', icon: Activity, tone: 'text-emerald-600 dark:text-emerald-300 bg-emerald-500/10', suffix: '%' },
];

export default function PlatformStatistics() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    let mounted = true;
    fetchPlatformStatistics().then((data) => {
      if (mounted) setStats(data);
    });
    return () => {
      mounted = false;
    };
  }, []);

  if (!stats) return <SkeletonGrid count={6} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" />;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {ITEMS.map((item, i) => (
        <motion.div
          key={item.key}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: i * 0.05 }}
          className="surface-card flex items-center gap-3 p-5"
        >
          <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${item.tone}`}>
            <item.icon className="h-5 w-5" />
          </span>
          <div>
            <p className="font-display text-xl font-semibold text-slate-900 dark:text-white">
              {stats[item.key].toLocaleString()}{item.suffix || ''}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{item.label}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
