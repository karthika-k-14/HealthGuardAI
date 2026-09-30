import React, { useState } from 'react';
import { Filter, RotateCcw, Search, ChevronDown, ChevronUp } from 'lucide-react';
import Button from '../common/Button';

export default function ReportFilters({ filters, onApplyFilters, onResetFilters }) {
  const [isOpen, setIsOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState(filters || {});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLocalFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onApplyFilters(localFilters);
  };

  const handleReset = () => {
    const emptyFilters = {
      startDate: '',
      endDate: '',
      date: '',
      year: '',
      district: '',
      villageName: '',
      phcName: '',
      hospitalName: '',
      healthOfficerId: '',
      ashaWorkerId: '',
    };
    setLocalFilters(emptyFilters);
    onResetFilters();
  };

  const activeFilterCount = Object.values(filters || {}).filter(
    (v) => v !== undefined && v !== null && v !== ''
  ).length;

  return (
    <div className="surface-card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400">
            <Filter className="h-4 w-4" />
          </span>
          <span className="text-sm font-semibold text-slate-900 dark:text-white">Report Filters</span>
          {activeFilterCount > 0 && (
            <span className="rounded-full bg-brand-500/15 px-2 py-0.5 text-xs font-semibold text-brand-600 dark:text-brand-400">
              {activeFilterCount} active
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {activeFilterCount > 0 && (
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            >
              <RotateCcw className="h-3 w-3" /> Reset
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-1 text-xs font-medium text-brand-600 dark:text-brand-400"
          >
            {isOpen ? (
              <>
                Hide Filters <ChevronUp className="h-3.5 w-3.5" />
              </>
            ) : (
              <>
                Configure Filters <ChevronDown className="h-3.5 w-3.5" />
              </>
            )}
          </button>
        </div>
      </div>

      {isOpen && (
        <form onSubmit={handleSubmit} className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                Start Date
              </label>
              <input
                type="date"
                name="date"
                value={localFilters.date || ''}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-brand-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                Year
              </label>
              <input
                type="number"
                name="year"
                placeholder="e.g. 2026"
                value={localFilters.year || ''}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-brand-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                District
              </label>
              <input
                type="text"
                name="district"
                placeholder="District name"
                value={localFilters.district || ''}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-brand-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                Village Name
              </label>
              <input
                type="text"
                name="villageName"
                placeholder="Village name"
                value={localFilters.villageName || ''}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-brand-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                PHC Name
              </label>
              <input
                type="text"
                name="phcName"
                placeholder="PHC name"
                value={localFilters.phcName || ''}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-brand-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                Hospital Name
              </label>
              <input
                type="text"
                name="hospitalName"
                placeholder="Hospital name"
                value={localFilters.hospitalName || ''}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-brand-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                Health Officer ID
              </label>
              <input
                type="number"
                name="healthOfficerId"
                placeholder="Officer ID"
                value={localFilters.healthOfficerId || ''}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-brand-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                ASHA Worker ID
              </label>
              <input
                type="number"
                name="ashaWorkerId"
                placeholder="ASHA ID"
                value={localFilters.ashaWorkerId || ''}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-brand-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={handleReset}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Reset
            </button>
            <Button type="submit" variant="primary" className="py-1.5 text-xs">
              <Search className="h-3.5 w-3.5" /> Apply Filters
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
