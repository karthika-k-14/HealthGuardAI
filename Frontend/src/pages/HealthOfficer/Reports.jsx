import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { FileText, CalendarDays, CalendarRange, CalendarClock, Calendar, Landmark, Activity, Hospital, Building2 } from 'lucide-react';
import { fetchReportByType } from '../../api/reportApi';
import { Spinner } from '../../components/common/Loader';
import ReportFilters from '../../components/reports/ReportFilters';
import ReportDetails from '../../components/reports/ReportDetails';

const REPORT_TYPES = [
  { key: 'daily', label: 'Daily Report', icon: CalendarDays },
  { key: 'weekly', label: 'Weekly Report', icon: CalendarRange },
  { key: 'monthly', label: 'Monthly Report', icon: CalendarClock },
  { key: 'yearly', label: 'Yearly Report', icon: Calendar },
  { key: 'district', label: 'District Report', icon: Landmark },
  { key: 'disease', label: 'Disease Report', icon: Activity },
  { key: 'hospital', label: 'Hospital Report', icon: Hospital },
  { key: 'phc', label: 'PHC Report', icon: Building2 },
];

export default function Reports() {
  const [activeReportKey, setActiveReportKey] = useState(null);
  const [activeReportData, setActiveReportData] = useState(null);
  const [loadingKey, setLoadingKey] = useState(null);
  const [filters, setFilters] = useState({});

  const handleGenerate = async (key, currentFilters = filters) => {
    setLoadingKey(key);
    setActiveReportKey(key);
    try {
      const data = await fetchReportByType(key, currentFilters);
      setActiveReportData(data);
    } catch {
      toast.error('Could not generate that report. Please try again.');
    } finally {
      setLoadingKey(null);
    }
  };

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

  const handleDownload = () => {
    toast.success('Downloading PDF summary...');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-slate-900 dark:text-white">Reports</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Generate summary reports for your district.</p>
      </div>

      <ReportFilters
        filters={filters}
        onApplyFilters={handleApplyFilters}
        onResetFilters={handleResetFilters}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {REPORT_TYPES.map((r) => {
          const isSelected = activeReportKey === r.key;
          return (
            <button
              key={r.key}
              type="button"
              onClick={() => handleGenerate(r.key)}
              className={`surface-card flex flex-col items-center gap-2 p-5 text-center transition-all hover:-translate-y-0.5 ${
                isSelected ? 'ring-2 ring-brand-500 bg-brand-500/5' : ''
              }`}
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400">
                {loadingKey === r.key ? <Spinner size={18} /> : <r.icon className="h-5 w-5" />}
              </span>
              <span className="text-sm font-medium text-slate-800 dark:text-slate-100">{r.label}</span>
            </button>
          );
        })}
      </div>

      {activeReportData && (
        <ReportDetails report={activeReportData} onDownload={handleDownload} />
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
