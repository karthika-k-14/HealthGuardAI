import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
  FileText,
  CalendarDays,
  CalendarRange,
  CalendarClock,
  Calendar,
  Syringe,
  Bug,
  Users,
  Home,
} from 'lucide-react';
import { fetchReportByType } from '../../api/reportApi';
import { Spinner } from '../../components/common/Loader';
import ReportFilters from '../../components/reports/ReportFilters';
import AshaReportDashboard from '../../components/reports/AshaReportDashboard';

const REPORT_TYPES = [
  { key: 'daily', label: 'Daily Report', icon: CalendarDays, desc: "Today's activities & visits" },
  { key: 'weekly', label: 'Weekly Report', icon: CalendarRange, desc: '7-day trends & performance' },
  { key: 'monthly', label: 'Monthly Report', icon: CalendarClock, desc: 'Monthly household coverage' },
  { key: 'yearly', label: 'Yearly Report', icon: Calendar, desc: 'Annual health summary' },
  { key: 'disease', label: 'Disease Report', icon: Bug, desc: 'Surveillance & severity dist' },
  { key: 'citizen', label: 'Citizen Report', icon: Users, desc: 'Demographics & age groups' },
  { key: 'vaccination', label: 'Vaccination Report', icon: Syringe, desc: 'Immunization & coverage' },
  { key: 'home-visit', label: 'Home Visit Report', icon: Home, desc: 'Visit operations & trends' },
];

export default function Reports() {
  const [activeReportKey, setActiveReportKey] = useState('daily');
  const [activeReportData, setActiveReportData] = useState(null);
  const [loadingKey, setLoadingKey] = useState('daily');
  const [filters, setFilters] = useState({});

  const handleGenerate = async (key, currentFilters = filters) => {
    setLoadingKey(key);
    setActiveReportKey(key);
    try {
      const data = await fetchReportByType(key, currentFilters);
      setActiveReportData(data);
    } catch {
      toast.error('Could not generate report. Please try again.');
    } finally {
      setLoadingKey(null);
    }
  };

  // Auto-generate daily report on initial load
  useEffect(() => {
    handleGenerate('daily', {});
  }, []);

  const handleApplyFilters = (newFilters) => {
    setFilters(newFilters);
    if (activeReportKey) {
      handleGenerate(activeReportKey, newFilters);
    } else {
      toast.success('Filters applied. Select a report type above to generate summary.');
    }
  };

  const handleResetFilters = () => {
    setFilters({});
    if (activeReportKey) {
      handleGenerate(activeReportKey, {});
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-slate-900 dark:text-white">
          ASHA Dynamic Reports System
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Real-time field analytics and public health reports calculated directly from your assigned PostgreSQL records.
        </p>
      </div>

      <ReportFilters
        filters={filters}
        onApplyFilters={handleApplyFilters}
        onResetFilters={handleResetFilters}
      />

      {/* 8 Report Selection Cards */}
      <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
        {REPORT_TYPES.map((r) => {
          const isSelected = activeReportKey === r.key;
          const isLoading = loadingKey === r.key;

          return (
            <button
              key={r.key}
              type="button"
              onClick={() => handleGenerate(r.key)}
              className={`surface-card flex items-start gap-3.5 p-4 text-left transition-all hover:-translate-y-0.5 border ${
                isSelected
                  ? 'border-brand-500/80 ring-2 ring-brand-500/20 bg-brand-500/[0.04] dark:bg-brand-500/[0.07]'
                  : 'border-slate-200/80 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20'
              }`}
            >
              <span
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-bold ${
                  isSelected
                    ? 'bg-brand-500 text-white shadow-md shadow-brand-500/20'
                    : 'bg-brand-500/10 text-brand-600 dark:text-brand-400'
                }`}
              >
                {isLoading ? <Spinner size={18} /> : <r.icon className="h-5 w-5" />}
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                  {r.label}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                  {r.desc}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Report Dashboard with KPIs, Charts, Tables, and Exports */}
      {loadingKey && !activeReportData && (
        <div className="surface-card flex flex-col items-center justify-center p-12 text-center text-sm text-slate-500">
          <Spinner size={24} />
          <p className="mt-3 text-xs">Querying PostgreSQL database for live records...</p>
        </div>
      )}

      {activeReportData && (
        <AshaReportDashboard report={activeReportData} />
      )}

      {!activeReportData && !loadingKey && (
        <div className="surface-card flex flex-col items-center gap-2 p-10 text-center text-sm text-slate-500">
          <FileText className="h-6 w-6 text-slate-400" />
          Select a report type above to generate a summary.
        </div>
      )}
    </div>
  );
}
