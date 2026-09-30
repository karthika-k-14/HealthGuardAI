import React from 'react';
import { Search, RotateCcw, Filter } from 'lucide-react';
import Button from '../../../components/common/Button';

export default function ReferralFilters({
  filters,
  onChange,
  onReset,
  availableVillages = [],
  availableDiseases = [],
}) {
  const handleInputChange = (field, value) => {
    onChange({ ...filters, [field]: value });
  };

  const hasActiveFilters =
    Boolean(filters.search) ||
    (filters.status && filters.status !== 'all') ||
    (filters.village && filters.village !== 'all') ||
    (filters.disease && filters.disease !== 'all') ||
    (filters.severity && filters.severity !== 'all');

  return (
    <div className="surface-card p-4 space-y-3">
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
        {/* Search Bar */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={filters.search || ''}
            onChange={(e) => handleInputChange('search', e.target.value)}
            placeholder="Search patient, referral code, disease..."
            className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
          />
        </div>

        {/* Dropdowns */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Status */}
          <select
            value={filters.status || 'all'}
            onChange={(e) => handleInputChange('status', e.target.value)}
            className="px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-brand-500 focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="PENDING">Pending Verification</option>
            <option value="UNDER_REVIEW">Under Review</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>

          {/* Village */}
          <select
            value={filters.village || 'all'}
            onChange={(e) => handleInputChange('village', e.target.value)}
            className="px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-brand-500 focus:outline-none"
          >
            <option value="all">All Villages</option>
            {availableVillages.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>

          {/* Disease */}
          <select
            value={filters.disease || 'all'}
            onChange={(e) => handleInputChange('disease', e.target.value)}
            className="px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-brand-500 focus:outline-none"
          >
            <option value="all">All Diseases</option>
            {availableDiseases.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>

          {/* Severity */}
          <select
            value={filters.severity || 'all'}
            onChange={(e) => handleInputChange('severity', e.target.value)}
            className="px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-brand-500 focus:outline-none"
          >
            <option value="all">All Severities</option>
            <option value="Low">Low Severity</option>
            <option value="Medium">Medium Severity</option>
            <option value="High">High Severity</option>
            <option value="Critical">Critical Severity</option>
          </select>

          {/* Reset Filters */}
          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={onReset}
              className="gap-1.5 text-xs text-slate-600 dark:text-slate-300 hover:text-slate-900"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
