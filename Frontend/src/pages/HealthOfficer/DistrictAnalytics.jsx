import React, { useEffect, useState } from 'react';
import { Users, Activity, HeartPulse, Syringe, Hospital, Building2, UserCheck, MapPinned } from 'lucide-react';
import { fetchDistrictAnalytics } from '../../api/officerApi';
import { getDashboardSummary, getHospitalStatistics, getCitizenStatistics } from '../../api/analyticsApi';
import { SkeletonGrid } from '../../components/common/Skeleton';

const ITEMS = [
  { key: 'totalPopulation', label: 'Total Population', icon: Users },
  { key: 'activeCases', label: 'Active Cases', icon: Activity },
  { key: 'recoveredCases', label: 'Recovered Cases', icon: HeartPulse },
  { key: 'vaccinationCoverage', label: 'Vaccination Coverage', icon: Syringe, suffix: '%' },
  { key: 'hospitals', label: 'Hospitals', icon: Hospital },
  { key: 'phcs', label: 'PHCs', icon: Building2 },
  { key: 'ashaWorkers', label: 'ASHA Workers', icon: UserCheck },
  { key: 'highRiskAreas', label: 'High Risk Areas', icon: MapPinned },
];

export default function DistrictAnalytics() {
  const [data, setData] = useState(null);

  useEffect(() => {
    let mounted = true;
    async function loadData() {
      const base = await fetchDistrictAnalytics().catch(() => ({}));
      try {
        const summary = await getDashboardSummary();
        const hospStats = await getHospitalStatistics().catch(() => null);
        const citizenStats = await getCitizenStatistics().catch(() => null);

        if (mounted && summary) {
          setData({
            totalPopulation: summary.totalCitizens || base.totalPopulation || 0,
            activeCases: citizenStats?.activeCitizens || base.activeCases || 0,
            recoveredCases: base.recoveredCases || 0,
            vaccinationCoverage: base.vaccinationCoverage || 0,
            hospitals: summary.totalHospitals || hospStats?.totalHospitals || base.hospitals || 0,
            phcs: summary.totalPhcs || hospStats?.totalPhcs || base.phcs || 0,
            ashaWorkers: summary.totalAshaWorkers || base.ashaWorkers || 0,
            highRiskAreas: base.highRiskAreas || 0,
          });
          return;
        }
      } catch (e) {
        // fallback
      }
      if (mounted) setData(base);
    }

    loadData();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-slate-900 dark:text-white">District Analytics</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">A full picture of your district's health infrastructure.</p>
      </div>

      {!data && <SkeletonGrid count={8} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" />}

      {data && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {ITEMS.map((item) => (
            <div key={item.key} className="surface-card flex items-center gap-3 p-5">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400">
                <item.icon className="h-5 w-5" />
              </span>
              <div>
                <p className="font-display text-xl font-semibold text-slate-900 dark:text-white">
                  {data[item.key].toLocaleString()}{item.suffix || ''}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{item.label}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
