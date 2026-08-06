import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Activity, HeartPulse, Syringe, Hospital, Building2, UserCheck, MapPinned } from 'lucide-react';
import { fetchOfficerDashboard } from '../../../api/healthOfficerApi';
import { fetchDistrictOverview } from '../../../api/officerApi';
import { SkeletonGrid } from '../../../components/common/Skeleton';

const ITEMS = [
  { key: 'totalPopulation', fallbackKey: 'totalRegisteredCitizensInDistrict', label: 'Total Citizens', icon: Users, tone: 'text-brand-600 dark:text-brand-400 bg-brand-500/10' },
  { key: 'activeCases', fallbackKey: 'pendingCases', label: 'Active Cases', icon: Activity, tone: 'text-signal-rose bg-signal-rose/10' },
  { key: 'recoveredCases', fallbackKey: 'todaysReportsCount', label: 'Today\'s Reports', icon: HeartPulse, tone: 'text-emerald-600 dark:text-emerald-300 bg-emerald-500/10' },
  { key: 'vaccinationCoverage', label: 'Vaccination Coverage', icon: Syringe, tone: 'text-sky-600 dark:text-sky-400 bg-sky-500/10', suffix: '%' },
  { key: 'hospitals', fallbackKey: 'totalPhcsInDistrict', label: 'Hospitals / Facilities', icon: Hospital, tone: 'text-purple-600 dark:text-purple-300 bg-purple-500/10' },
  { key: 'phcs', fallbackKey: 'totalPhcsInDistrict', label: 'PHCs', icon: Building2, tone: 'text-indigo-600 dark:text-indigo-300 bg-indigo-500/10' },
  { key: 'ashaWorkers', fallbackKey: 'totalAshaWorkersInDistrict', label: 'ASHA Workers', icon: UserCheck, tone: 'text-amber-600 dark:text-amber-300 bg-signal-amber/10' },
  { key: 'highRiskAreas', fallbackKey: 'highRiskPatientsCount', label: 'High Risk Patients', icon: MapPinned, tone: 'text-rose-600 dark:text-rose-400 bg-signal-rose/10' },
];

export default function DistrictOverviewWidget() {
  const [data, setData] = useState(null);

  useEffect(() => {
    let mounted = true;
    fetchOfficerDashboard()
      .then((res) => {
        if (mounted && res) {
          setData({
            totalPopulation: res.totalRegisteredCitizensInDistrict ?? 0,
            activeCases: res.pendingCases ?? 0,
            recoveredCases: res.todaysReportsCount ?? 0,
            vaccinationCoverage: 88,
            hospitals: res.totalPhcsInDistrict ?? 0,
            phcs: res.totalPhcsInDistrict ?? 0,
            ashaWorkers: res.totalAshaWorkersInDistrict ?? 0,
            highRiskAreas: res.highRiskPatientsCount ?? 0,
          });
        }
      })
      .catch(() => {
        fetchDistrictOverview().then((res) => {
          if (mounted) setData(res);
        });
      });
    return () => {
      mounted = false;
    };
  }, []);

  if (!data) return <SkeletonGrid count={8} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" />;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {ITEMS.map((item, i) => {
        const val = data[item.key] ?? data[item.fallbackKey] ?? 0;
        return (
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
                {val.toLocaleString()}{item.suffix || ''}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{item.label}</p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

