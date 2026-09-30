import React, { useState, useMemo } from 'react';
import {
  FileText,
  Download,
  Printer,
  Calendar,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Users,
  Home,
  Syringe,
  Baby,
  Activity,
  HeartPulse,
  TrendingUp,
  TrendingDown,
  FileSpreadsheet,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import Button from '../common/Button';
import Badge from '../common/Badge';

const SEVERITY_COLORS = {
  'Low Risk': '#10b981',      // Green
  'Medium Risk': '#f59e0b',   // Yellow
  'High Risk': '#f97316',     // Orange
  'Critical': '#ef4444',      // Red
};

const VACCINE_COLORS = ['#10b981', '#f59e0b', '#ef4444'];
const VISIT_STATUS_COLORS = ['#10b981', '#3b82f6', '#ef4444'];
const GENDER_COLORS = ['#3b82f6', '#ec4899', '#8b5cf6', '#64748b'];

export default function AshaReportDashboard({ report }) {
  const [searchTerm, setSearchTerm] = useState('');

  if (!report) return null;

  const reportType = (report.reportType || '').toUpperCase();
  const reportTitle = report.reportTitle || `${reportType} Report`;
  const generatedAt = report.generatedAt ? new Date(report.generatedAt).toLocaleString() : new Date().toLocaleString();
  const period = report.reportPeriod || 'Current Period';
  const appliedFilters = report.appliedFilters || {};
  const metrics = report.metrics || {};
  const records = report.records || [];
  const isEmpty = Boolean(report.isEmpty || (records.length === 0 && Object.keys(metrics).length === 0));

  // --- Export CSV Handler ---
  const handleDownloadCsv = () => {
    try {
      let csvContent = 'data:text/csv;charset=utf-8,';
      csvContent += `Report Title,"${reportTitle}"\r\n`;
      csvContent += `Report Period,"${period}"\r\n`;
      csvContent += `Generated At,"${generatedAt}"\r\n\r\n`;

      csvContent += '--- METRICS SUMMARY ---\r\n';
      csvContent += 'Metric,Value\r\n';
      Object.entries(metrics).forEach(([k, v]) => {
        csvContent += `"${k.replace(/([A-Z])/g, ' $1').trim()}","${v}"\r\n`;
      });
      csvContent += '\r\n';

      if (records.length > 0) {
        csvContent += '--- DETAILED RECORDS ---\r\n';
        const headers = Object.keys(records[0]);
        csvContent += headers.map((h) => `"${h}"`).join(',') + '\r\n';
        records.forEach((row) => {
          const rowVals = headers.map((h) => `"${row[h] !== undefined && row[h] !== null ? String(row[h]).replace(/"/g, '""') : ''}"`);
          csvContent += rowVals.join(',') + '\r\n';
        });
      }

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `${reportTitle.replace(/\s+/g, '_')}_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Export CSV error:', err);
    }
  };

  // --- Export Excel Handler (HTML Spreadsheet XML) ---
  const handleDownloadExcel = () => {
    try {
      let html = `
        <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
        <head>
          <meta charset="utf-8">
          <style>
            table { border-collapse: collapse; width: 100%; font-family: Arial, sans-serif; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #0f172a; color: white; font-weight: bold; }
            .section-title { font-size: 16px; font-weight: bold; background: #e2e8f0; color: #1e293b; }
          </style>
        </head>
        <body>
          <h2>${reportTitle}</h2>
          <p><strong>Period:</strong> ${period} | <strong>Generated:</strong> ${generatedAt}</p>
          <br/>
          <table>
            <tr class="section-title"><td colspan="2">Key Metrics Summary</td></tr>
            <tr><th>Metric</th><th>Value</th></tr>
      `;

      Object.entries(metrics).forEach(([k, v]) => {
        html += `<tr><td>${k.replace(/([A-Z])/g, ' $1').trim()}</td><td>${v}</td></tr>`;
      });
      html += `</table><br/>`;

      if (records.length > 0) {
        const headers = Object.keys(records[0]);
        html += `
          <table>
            <tr class="section-title"><td colspan="${headers.length}">Detailed Records</td></tr>
            <tr>${headers.map((h) => `<th>${h}</th>`).join('')}</tr>
        `;
        records.forEach((row) => {
          html += `<tr>${headers.map((h) => `<td>${row[h] !== undefined && row[h] !== null ? row[h] : ''}</td>`).join('')}</tr>`;
        });
        html += `</table>`;
      }

      html += `</body></html>`;

      const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${reportTitle.replace(/\s+/g, '_')}_${Date.now()}.xls`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export Excel error:', err);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Filtered records for search
  const filteredRecords = useMemo(() => {
    if (!searchTerm.trim()) return records;
    const term = searchTerm.toLowerCase();
    return records.filter((r) =>
      Object.values(r).some((v) => String(v).toLowerCase().includes(term))
    );
  }, [records, searchTerm]);

  return (
    <div className="surface-card p-6 space-y-8 print:p-0 print:border-none print:shadow-none">
      {/* Header with Title and Export Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400">
            <FileText className="h-6 w-6" />
          </span>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {reportTitle}
              </h2>
              <span className="rounded-full bg-brand-500/10 px-3 py-0.5 text-xs font-semibold text-brand-600 dark:text-brand-400">
                {period}
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" /> Generated on {generatedAt} · Official ASHA Field Health Report
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap print:hidden">
          <Button
            variant="secondary"
            onClick={handleDownloadCsv}
            className="text-xs flex items-center gap-1.5 px-3 py-2"
          >
            <Download className="h-3.5 w-3.5 text-emerald-500" />
            Download CSV
          </Button>
          <Button
            variant="secondary"
            onClick={handleDownloadExcel}
            className="text-xs flex items-center gap-1.5 px-3 py-2"
          >
            <FileSpreadsheet className="h-3.5 w-3.5 text-blue-500" />
            Download Excel
          </Button>
          <Button
            variant="secondary"
            onClick={handlePrint}
            className="text-xs flex items-center gap-1.5 px-3 py-2"
          >
            <Printer className="h-3.5 w-3.5 text-purple-500" />
            Print Report
          </Button>
        </div>
      </div>

      {/* Applied Filters Notice */}
      {Object.keys(appliedFilters).length > 0 && (
        <div className="flex items-center gap-2 flex-wrap text-xs bg-slate-50 dark:bg-white/5 p-3 rounded-xl print:hidden">
          <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
            <Filter className="h-3.5 w-3.5 text-brand-500" /> Applied Filters:
          </span>
          {Object.entries(appliedFilters).map(([k, v]) => (
            <span
              key={k}
              className="rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2.5 py-1 text-slate-800 dark:text-slate-200"
            >
              <strong className="capitalize">{k.replace(/([A-Z])/g, ' $1')}:</strong> {String(v)}
            </span>
          ))}
        </div>
      )}

      {/* EMPTY STATE */}
      {isEmpty && (
        <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-dashed border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02]">
          <AlertCircle className="h-12 w-12 text-amber-500 mb-3 opacity-80" />
          <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200">
            No report data available for selected period.
          </h3>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-md">
            No field records, home visits, or surveillance cases matching your assigned area exist in the database for this timeframe.
          </p>
        </div>
      )}

      {/* MAIN REPORT BODY */}
      {!isEmpty && (
        <div className="space-y-8">
          {/* 1. DAILY REPORT KPI SUMMARY */}
          {reportType === 'DAILY' && report.todayActivitiesSummary && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Today's Activities Summary
                </h3>
                <span className="text-xs text-brand-600 dark:text-brand-400 font-medium">
                  Real-time PostgreSQL Feed
                </span>
              </div>
              <div className="grid gap-3.5 grid-cols-2 sm:grid-cols-4">
                <KPICard label="Assigned Citizens" value={report.todayActivitiesSummary.assignedCitizens} icon={Users} tone="brand" />
                <KPICard label="Visits Completed" value={report.todayActivitiesSummary.visitsCompleted} icon={CheckCircle2} tone="emerald" />
                <KPICard label="Pending Visits" value={report.todayActivitiesSummary.pendingVisits} icon={Clock} tone="amber" />
                <KPICard label="Disease Reports" value={report.todayActivitiesSummary.diseaseReports} icon={Activity} tone="blue" />
                <KPICard label="Child Health Updates" value={report.todayActivitiesSummary.childHealthUpdates} icon={Baby} tone="purple" />
                <KPICard label="Vaccinations Recorded" value={report.todayActivitiesSummary.vaccinations} icon={Syringe} tone="teal" />
                <KPICard label="High Priority Cases" value={report.todayActivitiesSummary.highPriorityCases} icon={AlertTriangle} tone="rose" />
                <KPICard label="Emergency Referrals" value={report.todayActivitiesSummary.emergencyReferrals} icon={HeartPulse} tone="rose" />
              </div>
            </div>
          )}

          {/* 2. WEEKLY REPORT KPIS */}
          {reportType === 'WEEKLY' && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Weekly Performance Metrics (Last 7 Days)
              </h3>
              <div className="grid gap-3.5 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
                <KPICard
                  label="Total Visits"
                  value={metrics.totalVisits}
                  icon={Home}
                  tone="brand"
                  trend={metrics.visitsTrendPercentage}
                />
                <KPICard
                  label="Disease Reports"
                  value={metrics.totalDiseaseReports}
                  icon={Activity}
                  tone="rose"
                  trend={metrics.diseaseTrendPercentage}
                />
                <KPICard label="Vaccinations Tracked" value={metrics.totalVaccinations} icon={Syringe} tone="teal" />
                <KPICard label="Child Health Records" value={metrics.totalChildHealthRecords} icon={Baby} tone="purple" />
                <KPICard label="Emergency Referrals" value={metrics.totalReferrals} icon={HeartPulse} tone="amber" />
              </div>
            </div>
          )}

          {/* 3. MONTHLY REPORT KPIS */}
          {reportType === 'MONTHLY' && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Monthly Public Health Coverage
              </h3>
              <div className="grid gap-3.5 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
                <KPICard label="Households Covered" value={metrics.householdsCovered} icon={Home} tone="brand" />
                <KPICard label="Citizens Visited" value={metrics.citizensVisited} icon={Users} tone="blue" />
                <KPICard label="Disease Cases" value={metrics.totalDiseaseCases} icon={Activity} tone="rose" />
                <KPICard label="Vaccination Coverage" value={`${metrics.vaccinationCoveragePct || 0}%`} icon={Syringe} tone="emerald" />
                <KPICard label="Children Under 5" value={metrics.childrenUnder5} icon={Baby} tone="purple" />
                <KPICard label="High Risk Cases" value={metrics.highRiskCases} icon={AlertTriangle} tone="amber" />
              </div>
            </div>
          )}

          {/* 4. YEARLY REPORT KPIS */}
          {reportType === 'YEARLY' && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Annual Health Impact & Service Reach
              </h3>
              <div className="grid gap-3.5 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
                <KPICard label="Households Served" value={metrics.householdsServed} icon={Home} tone="brand" />
                <KPICard label="Citizens Covered" value={metrics.citizensCovered} icon={Users} tone="blue" />
                <KPICard label="Disease Reports" value={metrics.totalDiseaseReports} icon={Activity} tone="rose" />
                <KPICard label="Vaccinations Logged" value={metrics.totalVaccinations} icon={Syringe} tone="emerald" />
                <KPICard label="Emergency Referrals" value={metrics.totalReferrals} icon={HeartPulse} tone="amber" />
                <KPICard label="Child Health Follow-ups" value={metrics.totalChildHealthFollowups} icon={Baby} tone="purple" />
              </div>
            </div>
          )}

          {/* 5. DISEASE REPORT KPIS */}
          {reportType === 'DISEASE' && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Epidemiological Surveillance Summary
              </h3>
              <div className="grid gap-3.5 grid-cols-2 sm:grid-cols-5">
                <KPICard label="Total Cases" value={metrics.totalCases} icon={Activity} tone="brand" />
                <KPICard label="Critical Cases" value={metrics.criticalCases} icon={AlertTriangle} tone="rose" />
                <KPICard label="High Risk Cases" value={metrics.highRiskCases} icon={AlertTriangle} tone="amber" />
                <KPICard label="Pending Reviews" value={metrics.pendingReviews} icon={Clock} tone="blue" />
                <KPICard label="Resolved Cases" value={metrics.resolvedCases} icon={CheckCircle2} tone="emerald" />
              </div>
            </div>
          )}

          {/* 6. CITIZEN REPORT KPIS */}
          {reportType === 'CITIZEN' && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Demographic & Citizen Metrics
              </h3>
              <div className="grid gap-3.5 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
                <KPICard label="Total Citizens" value={metrics.totalCitizens} icon={Users} tone="brand" />
                <KPICard label="Total Families" value={metrics.totalFamilies} icon={Home} tone="blue" />
                <KPICard label="Pregnant Women" value={metrics.pregnantWomen} icon={HeartPulse} tone="rose" />
                <KPICard label="Children Under 5" value={metrics.childrenUnder5} icon={Baby} tone="purple" />
                <KPICard label="Senior Citizens (60+)" value={metrics.seniorCitizens} icon={Users} tone="amber" />
                <KPICard label="High Risk Citizens" value={metrics.highRiskCitizens} icon={AlertTriangle} tone="rose" />
              </div>
            </div>
          )}

          {/* 7. VACCINATION REPORT KPIS */}
          {reportType === 'VACCINATION' && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Immunization & Vaccination Coverage Metrics
              </h3>
              <div className="grid gap-3.5 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
                <KPICard label="Total Family Members" value={metrics.totalFamilyMembers} icon={Users} tone="blue" />
                <KPICard label="Fully Vaccinated" value={metrics.fullyVaccinated} icon={CheckCircle2} tone="emerald" />
                <KPICard label="Partially Vaccinated" value={metrics.partiallyVaccinated} icon={Clock} tone="amber" />
                <KPICard label="Not Vaccinated" value={metrics.notVaccinated} icon={AlertCircle} tone="rose" />
                <KPICard label="Coverage Rate" value={`${metrics.vaccinationCoveragePercentage || 0}%`} icon={Syringe} tone="brand" />
              </div>
              <div className="grid gap-3.5 grid-cols-2 sm:grid-cols-4 pt-2">
                <KPICard label="Children Under 5" value={metrics.childrenUnder5} icon={Baby} tone="purple" />
                <KPICard label="Fully Vaccinated Children" value={metrics.fullyVaccinatedChildren} icon={CheckCircle2} tone="emerald" />
                <KPICard label="Partially Vaccinated Children" value={metrics.partiallyVaccinatedChildren} icon={Clock} tone="amber" />
                <KPICard label="Children Requiring Follow-Up" value={metrics.childrenRequiringFollowUp} icon={AlertTriangle} tone="rose" />
              </div>
            </div>
          )}

          {/* 8. HOME VISIT REPORT KPIS */}
          {reportType === 'HOME_VISIT' && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Household Visit Operations Metrics
              </h3>
              <div className="grid gap-3.5 grid-cols-2 sm:grid-cols-4">
                <KPICard label="Total Visits Scheduled" value={metrics.totalVisitsScheduled} icon={Home} tone="brand" />
                <KPICard label="Completed Visits" value={metrics.completedVisits} icon={CheckCircle2} tone="emerald" />
                <KPICard label="Pending Visits" value={metrics.pendingVisits} icon={Clock} tone="blue" />
                <KPICard label="Missed Visits" value={metrics.missedVisits} icon={AlertTriangle} tone="rose" />
                <KPICard label="Pregnancy Visits" value={metrics.pregnancyVisits} icon={HeartPulse} tone="rose" />
                <KPICard label="Child Health Visits" value={metrics.childHealthVisits} icon={Baby} tone="purple" />
                <KPICard label="Routine Visits" value={metrics.routineVisits} icon={CheckCircle2} tone="teal" />
                <KPICard label="Emergency Visits" value={metrics.emergencyVisits} icon={AlertTriangle} tone="amber" />
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* CHARTS & VISUALIZATIONS SECTION */}
          {/* ==================================================== */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Chart 1: Home Visits Trend */}
            {(reportType === 'HOME_VISIT' || reportType === 'WEEKLY') && report.timeSeriesTrend && (
              <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/60 p-5 space-y-3">
                <div>
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-brand-500" />
                    Home Visits Trend
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Activity volume over recorded timeline
                  </p>
                </div>
                <div className="h-60 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={report.timeSeriesTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="visitsColor" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: 8, fontSize: 12 }} />
                      <Area type="monotone" dataKey="visits" name="Visits" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#visitsColor)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Chart 2: Visit Status Distribution (Completed vs Pending vs Missed) */}
            {reportType === 'HOME_VISIT' && report.visitStatusDistribution && (
              <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/60 p-5 space-y-3">
                <div>
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-blue-500" />
                    Visit Status Distribution
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Completed vs Pending vs Missed breakdown
                  </p>
                </div>
                <div className="h-60 w-full">
                  {Object.values(report.visitStatusDistribution).every((v) => v === 0) ? (
                    <div className="h-full flex items-center justify-center text-xs text-slate-500">
                      No visit status data recorded
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={Object.entries(report.visitStatusDistribution).map(([name, value]) => ({ name, value }))}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={80}
                          paddingAngle={3}
                        >
                          {Object.keys(report.visitStatusDistribution).map((_, idx) => (
                            <Cell key={`cell-${idx}`} fill={VISIT_STATUS_COLORS[idx % VISIT_STATUS_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: 8, fontSize: 12 }} />
                        <Legend wrapperStyle={{ fontSize: 11 }} />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
            )}


            {/* Chart 4: Affected Person Type Distribution (Disease Report) */}
            {reportType === 'DISEASE' && report.affectedPersonTypeDistribution && (
              <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/60 p-5 space-y-3">
                <div>
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                    <Users className="h-4 w-4 text-purple-500" />
                    Affected Person Type Distribution
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Head of Household, Spouse, Child, Parent, Other
                  </p>
                </div>
                <div className="h-60 w-full">
                  {Object.values(report.affectedPersonTypeDistribution).every((v) => v === 0) ? (
                    <div className="h-full flex items-center justify-center text-xs text-slate-500">
                      No affected person distribution data available
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={Object.entries(report.affectedPersonTypeDistribution).map(([name, value]) => ({ name, value }))}
                        margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: 8, fontSize: 12 }} />
                        <Bar dataKey="value" name="Cases" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
            )}

            {/* Chart 5: Disease Cases Breakdown */}
            {(reportType === 'DISEASE' || reportType === 'MONTHLY') && report.chronicDiseaseDistribution && (
              <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/60 p-5 space-y-3">
                <div>
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                    <Activity className="h-4 w-4 text-rose-500" />
                    Disease Incidence Distribution
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Active disease cases reported by surveillance
                  </p>
                </div>
                <div className="h-60 w-full">
                  {Object.keys(report.chronicDiseaseDistribution).length === 0 ? (
                    <div className="h-full flex items-center justify-center text-xs text-slate-500">
                      No disease distribution records found
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={Object.entries(report.chronicDiseaseDistribution).map(([disease, count]) => ({ disease, count }))}
                        margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="disease" tick={{ fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: 8, fontSize: 12 }} />
                        <Bar dataKey="count" name="Cases" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
            )}

            {/* Chart 6: Vaccination Coverage Breakdown */}
            {(reportType === 'VACCINATION' || reportType === 'MONTHLY') && report.vaccinationCoverage && (
              <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/60 p-5 space-y-3">
                <div>
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                    <Syringe className="h-4 w-4 text-teal-500" />
                    Vaccination Coverage Breakdown
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Fully vs Partially vs Not Vaccinated
                  </p>
                </div>
                <div className="h-60 w-full">
                  {Object.values(report.vaccinationCoverage).every((v) => v === 0) ? (
                    <div className="h-full flex items-center justify-center text-xs text-slate-500">
                      No vaccination coverage records
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={Object.entries(report.vaccinationCoverage)
                            .filter(([name]) => name !== 'totalMembers' && name !== 'coveragePercentage')
                            .map(([name, value]) => ({ name, value }))}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={80}
                          paddingAngle={3}
                        >
                          {['Fully Vaccinated', 'Partially Vaccinated', 'Not Vaccinated'].map((_, idx) => (
                            <Cell key={`cell-${idx}`} fill={VACCINE_COLORS[idx % VACCINE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: 8, fontSize: 12 }} />
                        <Legend wrapperStyle={{ fontSize: 11 }} />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
            )}

            {/* Chart 7: Age Group Analytics (Citizen Report) */}
            {reportType === 'CITIZEN' && report.ageGroupAnalytics && (
              <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/60 p-5 space-y-3">
                <div>
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                    <Users className="h-4 w-4 text-blue-500" />
                    Age Group Analytics
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Distribution across 0-5, 6-18, 19-40, 41-60, 60+
                  </p>
                </div>
                <div className="h-60 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={Object.entries(report.ageGroupAnalytics).map(([ageGroup, count]) => ({ ageGroup, count }))}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="ageGroup" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: 8, fontSize: 12 }} />
                      <Bar dataKey="count" name="Citizens" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Chart 8: Gender Analytics (Citizen Report) */}
            {reportType === 'CITIZEN' && report.genderAnalytics && (
              <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/60 p-5 space-y-3">
                <div>
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                    <Users className="h-4 w-4 text-pink-500" />
                    Gender Distribution
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Male, Female, Other, Not Specified
                  </p>
                </div>
                <div className="h-60 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={Object.entries(report.genderAnalytics).map(([name, value]) => ({ name, value }))}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={3}
                      >
                        {Object.keys(report.genderAnalytics).map((_, idx) => (
                          <Cell key={`cell-${idx}`} fill={GENDER_COLORS[idx % GENDER_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: 8, fontSize: 12 }} />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Chart 9: Yearly Monthly Registration Breakdown */}
            {reportType === 'YEARLY' && report.monthlyRegistrationBreakdown && (
              <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/60 p-5 space-y-3 lg:col-span-2">
                <div>
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-brand-500" />
                    Annual Month-by-Month Activity Timeline
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Combined surveillance cases and home visits logged per month
                  </p>
                </div>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={Object.entries(report.monthlyRegistrationBreakdown).map(([month, count]) => ({ month, count }))}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: 8, fontSize: 12 }} />
                      <Bar dataKey="count" name="Activities Logged" fill="#10b981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>

          {/* ==================================================== */}
          {/* DETAILED DATABASE RECORDS TABLE */}
          {/* ==================================================== */}
          {records.length > 0 && (
            <div className="space-y-3 pt-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                    Underlying Database Records ({filteredRecords.length} records)
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Exact rows queried from PostgreSQL tables for this report
                  </p>
                </div>
                <div className="print:hidden">
                  <input
                    type="text"
                    placeholder="Search records..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full sm:w-56 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 px-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-white/10">
                <table className="min-w-full divide-y divide-slate-200 dark:divide-white/10 text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-white/5 text-slate-700 dark:text-slate-300 font-semibold">
                    <tr>
                      {Object.keys(records[0]).map((h) => (
                        <th key={h} className="px-4 py-3 capitalize">
                          {h.replace(/([A-Z])/g, ' $1')}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-white/5 text-slate-800 dark:text-slate-200">
                    {filteredRecords.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-500/5 transition-colors">
                        {Object.keys(records[0]).map((col) => {
                          const val = row[col];
                          const strVal = String(val ?? '');

                          // Formatted badge rendering
                          if (col === 'riskLevel' || col === 'riskStatus' || col === 'severity') {
                            const isHigh = strVal.toLowerCase().includes('high') || strVal.toLowerCase().includes('crit');
                            return (
                              <td key={col} className="px-4 py-3">
                                <Badge tone={isHigh ? 'rose' : 'brand'}>{strVal || 'Normal'}</Badge>
                              </td>
                            );
                          }
                          if (col === 'status') {
                            const isDone = strVal.toLowerCase().includes('comp') || strVal.toLowerCase().includes('resol');
                            return (
                              <td key={col} className="px-4 py-3">
                                <Badge tone={isDone ? 'emerald' : 'amber'}>{strVal || 'Pending'}</Badge>
                              </td>
                            );
                          }
                          if (col === 'vaccinationStatus') {
                            const isUpToDate = strVal === 'UP_TO_DATE' || strVal === 'COMPLETED';
                            return (
                              <td key={col} className="px-4 py-3">
                                <Badge tone={isUpToDate ? 'emerald' : 'amber'}>{strVal || 'NOT_VACCINATED'}</Badge>
                              </td>
                            );
                          }
                          if (typeof val === 'boolean') {
                            return (
                              <td key={col} className="px-4 py-3">
                                <Badge tone={val ? 'rose' : 'slate'}>{val ? 'Yes' : 'No'}</Badge>
                              </td>
                            );
                          }

                          return (
                            <td key={col} className="px-4 py-3 font-medium">
                              {strVal || '—'}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function KPICard({ label, value, icon: Icon, tone = 'brand', trend }) {
  const toneStyles = {
    brand: 'bg-brand-500/10 text-brand-600 dark:text-brand-400',
    emerald: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    amber: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    rose: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
    blue: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    purple: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
    teal: 'bg-teal-500/10 text-teal-600 dark:text-teal-400',
  };

  return (
    <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-slate-900/60 p-4 backdrop-blur transition-all hover:border-brand-500/30">
      <div className="flex items-center justify-between gap-2">
        <span className={`flex h-8 w-8 items-center justify-center rounded-xl ${toneStyles[tone] || toneStyles.brand}`}>
          <Icon className="h-4 w-4" />
        </span>
        {trend !== undefined && trend !== null && (
          <div className={`flex items-center gap-0.5 text-xs font-semibold ${trend >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
            {trend >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {trend > 0 ? `+${trend}%` : `${trend}%`}
          </div>
        )}
      </div>
      <div className="mt-3">
        <p className="text-2xl font-bold text-slate-900 dark:text-white">
          {value !== undefined && value !== null ? value : 0}
        </p>
        <p className="mt-0.5 text-xs font-medium text-slate-500 dark:text-slate-400">
          {label}
        </p>
      </div>
    </div>
  );
}
