import React from 'react';
import { FileText, Download, Calendar, Filter, Layers, BarChart2, CheckCircle2 } from 'lucide-react';
import Button from '../common/Button';

export default function ReportDetails({ report, onDownload }) {
  if (!report) return null;

  // Extract core properties from backend response or legacy summary wrapper
  const reportTitle = report.reportTitle || `${report.reportType || 'Summary'} Report`;
  const generatedAt = report.generatedAt ? new Date(report.generatedAt).toLocaleString() : new Date().toLocaleString();
  const period = report.reportPeriod || report.reportType?.toUpperCase();
  const appliedFilters = report.appliedFilters || {};

  // Extract top metrics (direct fields or nested in summary)
  const summaryMap = report.summary || {};

  const getMetricValue = (key, altKeys = []) => {
    if (report[key] !== undefined && report[key] !== null) return report[key];
    if (summaryMap[key] !== undefined && summaryMap[key] !== null) return summaryMap[key];
    for (const alt of altKeys) {
      if (report[alt] !== undefined && report[alt] !== null) return report[alt];
      if (summaryMap[alt] !== undefined && summaryMap[alt] !== null) return summaryMap[alt];
    }
    return null;
  };

  // Pre-extract key metrics if present
  const metrics = [
    { label: 'New Citizens Registered', value: getMetricValue('newCitizensRegistered', ['totalCitizens']) },
    { label: 'Health Records Logged', value: getMetricValue('newHealthRecordsCreated', ['totalHealthRecords', 'healthRecordsLogged']) },
    { label: 'Prescriptions Created', value: getMetricValue('prescriptionsCreated', ['prescriptionsTotal']) },
    { label: 'Prescriptions Dispensed', value: getMetricValue('prescriptionsDispensed') },
    { label: 'Active Campaigns', value: getMetricValue('activeCampaigns', ['totalCampaigns']) },
    { label: 'Medicines Added / Stock', value: getMetricValue('newMedicinesAdded', ['totalMedicines', 'totalStockQuantity']) },
    { label: 'Emergency SOS Requests', value: getMetricValue('sosRequestsCount') },
    { label: 'High Risk Citizens', value: getMetricValue('highRiskCitizensCount', ['citizensWithChronicDiseasesCount', 'citizensWithChronicDiseases', 'highRiskPatients']) },
    { label: 'Low Stock Count', value: getMetricValue('lowStockCount') },
    { label: 'Expired Stock', value: getMetricValue('expiredCount') },
    { label: 'Total Hospitals', value: getMetricValue('totalHospitals') },
    { label: 'Total PHCs', value: getMetricValue('totalPhcs', ['phcsCovered']) },
  ].filter((m) => m.value !== null && m.value !== undefined);

  // Breakdown maps from backend
  const monthlyBreakdown = report.monthlyRegistrationBreakdown || null;
  const chronicDistribution = report.chronicDiseaseDistribution || null;
  const recordTypes = report.healthRecordsByType || null;
  const categoryBreakdown = report.categoryBreakdown || null;
  const genderBreakdown = report.genderBreakdown || null;
  const ageGroupBreakdown = report.ageGroupBreakdown || null;
  const villageBreakdown = report.villageBreakdown || null;
  const hospitalTypeBreakdown = report.hospitalTypeBreakdown || null;
  const campaignStatusBreakdown = report.campaignStatusBreakdown || null;
  const overview = report.summaryOverview || null;

  return (
    <div className="surface-card p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400">
            <FileText className="h-5 w-5" />
          </span>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white capitalize">
                {reportTitle}
              </h2>
              {period && (
                <span className="rounded-full bg-brand-500/10 px-2.5 py-0.5 text-xs font-semibold text-brand-600 dark:text-brand-400">
                  {period}
                </span>
              )}
            </div>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" /> Generated on {generatedAt}
            </p>
          </div>
        </div>

        <Button variant="secondary" onClick={onDownload} className="text-sm shrink-0">
          <Download className="h-4 w-4" /> Download PDF
        </Button>
      </div>

      {/* Applied Filters Badges */}
      {Object.keys(appliedFilters).length > 0 && (
        <div className="flex items-center gap-2 flex-wrap text-xs bg-slate-50 dark:bg-white/5 p-3 rounded-xl">
          <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
            <Filter className="h-3.5 w-3.5 text-brand-500" /> Applied Filters:
          </span>
          {Object.entries(appliedFilters).map(([k, v]) => (
            <span
              key={k}
              className="rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-1 text-slate-800 dark:text-slate-200"
            >
              <strong className="capitalize">{k.replace(/([A-Z])/g, ' $1')}:</strong> {String(v)}
            </span>
          ))}
        </div>
      )}

      {/* Metrics Summary Grid */}
      {metrics.length > 0 ? (
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
            Core Performance Metrics
          </h3>
          <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {metrics.map((m, idx) => (
              <div key={idx} className="rounded-xl bg-slate-50 p-3.5 dark:bg-white/5 border border-slate-100 dark:border-slate-800">
                <dt className="text-xs font-medium text-slate-500 dark:text-slate-400">{m.label}</dt>
                <dd className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
                  {typeof m.value === 'number' ? m.value.toLocaleString() : String(m.value)}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      ) : Object.keys(summaryMap).length > 0 ? (
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
            Report Summary
          </h3>
          <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {Object.entries(summaryMap).map(([key, value]) => (
              <div key={key} className="rounded-xl bg-slate-50 p-3.5 dark:bg-white/5 border border-slate-100 dark:border-slate-800">
                <dt className="text-xs font-medium text-slate-500 dark:text-slate-400 capitalize">
                  {key.replace(/([A-Z])/g, ' $1')}
                </dt>
                <dd className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">
                  {String(value)}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      ) : null}

      {/* Monthly Registration Breakdown (Yearly Report) */}
      {monthlyBreakdown && Object.keys(monthlyBreakdown).length > 0 && (
        <div className="border-t border-slate-200 dark:border-slate-800 pt-5 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <BarChart2 className="h-4 w-4 text-brand-500" /> Monthly Registration Trend
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2">
            {Object.entries(monthlyBreakdown).map(([month, count]) => (
              <div key={month} className="rounded-lg bg-slate-50 dark:bg-white/5 p-2.5 text-center">
                <span className="text-xs text-slate-400 font-mono block">{month}</span>
                <span className="text-base font-bold text-slate-900 dark:text-white">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Disease Distribution Section */}
      {chronicDistribution && Object.keys(chronicDistribution).length > 0 && (
        <div className="border-t border-slate-200 dark:border-slate-800 pt-5 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Layers className="h-4 w-4 text-brand-500" /> Chronic Disease Distribution
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {Object.entries(chronicDistribution).map(([disease, count]) => (
              <div key={disease} className="rounded-xl bg-slate-50 dark:bg-white/5 p-3 flex justify-between items-center">
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{disease}</span>
                <span className="text-xs font-bold bg-brand-500/10 text-brand-600 dark:text-brand-400 px-2 py-0.5 rounded-full">
                  {count} cases
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Category Breakdown (Medicine Report) */}
      {categoryBreakdown && Object.keys(categoryBreakdown).length > 0 && (
        <div className="border-t border-slate-200 dark:border-slate-800 pt-5 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Medicine Categories
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {Object.entries(categoryBreakdown).map(([cat, count]) => (
              <div key={cat} className="rounded-lg bg-slate-50 dark:bg-white/5 p-2.5">
                <span className="text-xs text-slate-500 dark:text-slate-400 block capitalize">{cat}</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white">{count} items</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Demographic Breakdown (Citizen Report) */}
      {genderBreakdown && (
        <div className="border-t border-slate-200 dark:border-slate-800 pt-5 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Gender & Age Demographics
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {Object.entries(genderBreakdown).map(([gender, count]) => (
              <div key={gender} className="rounded-xl bg-slate-50 dark:bg-white/5 p-3">
                <span className="text-xs text-slate-400 uppercase">{gender}</span>
                <p className="text-lg font-bold text-slate-900 dark:text-white">{count}</p>
              </div>
            ))}
            {ageGroupBreakdown && Object.entries(ageGroupBreakdown).map(([ageGroup, count]) => (
              <div key={ageGroup} className="rounded-xl bg-slate-50 dark:bg-white/5 p-3">
                <span className="text-xs text-slate-400">Age: {ageGroup}</span>
                <p className="text-lg font-bold text-slate-900 dark:text-white">{count}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Summary Overview */}
      {overview && Object.keys(overview).length > 0 && (
        <div className="border-t border-slate-200 dark:border-slate-800 pt-5 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Operational Summary Overview
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {Object.entries(overview).map(([k, v]) => (
              <div key={k} className="rounded-lg bg-slate-50 dark:bg-white/5 p-3">
                <span className="text-xs text-slate-400 capitalize block">{k.replace(/([A-Z])/g, ' $1')}</span>
                <span className="text-sm font-semibold text-slate-900 dark:text-white">{String(v)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
