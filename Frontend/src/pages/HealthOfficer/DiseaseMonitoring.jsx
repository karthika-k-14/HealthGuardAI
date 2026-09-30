import React, { useEffect, useState, useMemo } from 'react';
import toast from 'react-hot-toast';
import { 
  Activity, 
  ShieldAlert, 
  CheckCircle2, 
  UserCheck, 
  Eye, 
  XCircle, 
  AlertTriangle,
  Clock,
  Filter,
  Check,
  AlertCircle,
  FileText,
  User,
  Calendar,
  Lock
} from 'lucide-react';
import { 
  fetchOfficerSurveillanceReports, 
  updateOfficerReportStatus, 
  fetchSurveillanceStatistics,
  fetchOfficerReportCounts 
} from '../../api/surveillanceApi';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import { SkeletonGrid } from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';

const RISK_TONE = { 
  Critical: 'rose', 
  High: 'rose', 
  Medium: 'amber', 
  Low: 'brand' 
};

// Phase 7 Badge Formatter
function getStatusBadge(status) {
  const norm = (status || 'PENDING_REVIEW').trim().toUpperCase().replace(/ /g, '_');
  switch (norm) {
    case 'VERIFIED':
      return <Badge tone="emerald" className="font-semibold px-2 py-0.5">✓ VERIFIED</Badge>;
    case 'ESCALATED':
      return <Badge tone="amber" className="font-semibold px-2 py-0.5">⚠ ESCALATED TO PHC</Badge>;
    case 'REJECTED':
      return <Badge tone="rose" className="font-semibold px-2 py-0.5">✕ REJECTED</Badge>;
    case 'PENDING_REVIEW':
    case 'PENDING':
    default:
      return <Badge tone="amber" className="font-semibold px-2 py-0.5">⏳ PENDING REVIEW</Badge>;
  }
}

export default function DiseaseMonitoring() {
  const [reports, setReports] = useState([]);
  const [stats, setStats] = useState({ activeOutbreaks: 0, outbreakAlerts: [] });
  const [counts, setCounts] = useState({ all: 0, pending: 0, verified: 0, escalated: 0, rejected: 0 });
  const [selectedFilter, setSelectedFilter] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [actingId, setActingId] = useState(null);
  const [officerNotesMap, setOfficerNotesMap] = useState({});
  const [selectedReportDetail, setSelectedReportDetail] = useState(null);

  // Load initial data
  const loadData = async () => {
    setIsLoading(true);
    try {
      const [rData, sData, cData] = await Promise.all([
        fetchOfficerSurveillanceReports(),
        fetchSurveillanceStatistics(),
        fetchOfficerReportCounts(),
      ]);

      const reportList = Array.isArray(rData) ? rData : [];
      setReports(reportList);
      setStats(sData || { activeOutbreaks: 0, outbreakAlerts: [] });

      // Compute or update counters from data
      if (cData && typeof cData.all === 'number') {
        setCounts(cData);
      } else {
        computeCounts(reportList);
      }
    } catch (e) {
      toast.error('Failed to load surveillance reports.');
    } finally {
      setIsLoading(false);
    }
  };

  const computeCounts = (list) => {
    let pending = 0, verified = 0, escalated = 0, rejected = 0;
    list.forEach(r => {
      const s = (r.status || 'PENDING_REVIEW').trim().toUpperCase().replace(/ /g, '_');
      if (s === 'VERIFIED') verified++;
      else if (s === 'ESCALATED') escalated++;
      else if (s === 'REJECTED') rejected++;
      else pending++;
    });
    setCounts({ all: list.length, pending, verified, escalated, rejected });
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtered reports calculation (Phase 10: instant without reload)
  const filteredReports = useMemo(() => {
    if (selectedFilter === 'ALL') return reports;
    return reports.filter(r => {
      const s = (r.status || 'PENDING_REVIEW').trim().toUpperCase().replace(/ /g, '_');
      if (selectedFilter === 'PENDING') return s === 'PENDING_REVIEW' || s === 'PENDING';
      return s === selectedFilter;
    });
  }, [reports, selectedFilter]);

  // Phase 8: Real-Time UI updates without reload
  const handleReviewAction = async (reportId, actionType) => {
    const report = reports.find(r => (r.reportId || r.id) === reportId);
    if (!report) return;

    const currentStatus = (report.status || 'PENDING_REVIEW').trim().toUpperCase().replace(/ /g, '_');
    if (currentStatus === 'VERIFIED' || currentStatus === 'ESCALATED' || currentStatus === 'REJECTED') {
      toast.error(`Report #${reportId} has already been reviewed and is locked.`);
      return;
    }

    const notes = officerNotesMap[reportId] || '';
    let currentUser = {};
    try {
      currentUser = JSON.parse(localStorage.getItem('hg_user') || localStorage.getItem('user') || '{}');
    } catch (e) {}
    const officerName = currentUser.fullName || currentUser.name || currentUser.email || 'Health Officer';
    const nowIso = new Date().toISOString();

    setActingId(`${reportId}:${actionType}`);

    // Phase 8: Optimistic immediate UI update
    const previousReports = [...reports];
    const previousCounts = { ...counts };

    const updatedReports = reports.map(r => {
      if ((r.reportId || r.id) === reportId) {
        return {
          ...r,
          status: actionType,
          reviewedBy: officerName,
          reviewedAt: nowIso,
          healthOfficerNotes: notes || (actionType === 'VERIFIED' ? 'Verified by Health Officer' : actionType === 'ESCALATED' ? 'Escalated to PHC' : 'Rejected by Health Officer'),
        };
      }
      return r;
    });

    setReports(updatedReports);
    computeCounts(updatedReports);

    try {
      const res = await updateOfficerReportStatus(reportId, {
        status: actionType,
        healthOfficerNotes: notes || (actionType === 'VERIFIED' ? 'Verified by Health Officer' : actionType === 'ESCALATED' ? 'Escalated to PHC for urgent medical review' : 'Rejected and requires correction'),
        reviewedBy: officerName,
      });

      const updatedReport = res?.report || res;
      if (updatedReport && updatedReport.reportId) {
        setReports(prev => prev.map(r => ((r.reportId || r.id) === reportId ? { ...r, ...updatedReport } : r)));
      }

      if (actionType === 'VERIFIED') {
        toast.success(`✓ Case for ${report.affectedPersonName || report.citizenName} verified successfully!`);
      } else if (actionType === 'ESCALATED') {
        toast.success(`⚠ Case escalated to PHC successfully! Alert dispatched.`);
      } else if (actionType === 'REJECTED') {
        toast.success(`✕ Case report rejected.`);
      }

      // Clear note field for this report
      setOfficerNotesMap(prev => ({ ...prev, [reportId]: '' }));
    } catch (err) {
      console.error('Review action failed:', err);
      // Rollback on failure
      setReports(previousReports);
      setCounts(previousCounts);
      const msg = err?.response?.data?.message || err?.message || 'Failed to submit review action.';
      toast.error(msg);
    } finally {
      setActingId(null);
    }
  };

  const isReportLocked = (status) => {
    const s = (status || 'PENDING_REVIEW').trim().toUpperCase().replace(/ /g, '_');
    return s === 'VERIFIED' || s === 'ESCALATED' || s === 'REJECTED';
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch {
      return String(dateStr);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-semibold text-slate-900 dark:text-white">
          Disease Monitoring &amp; Health Officer Reviews
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Clinical review workflow for field surveillance reports submitted by ASHA workers. Verified cases automatically drive Disease Intelligence and ML forecasting.
        </p>
      </div>

      {/* Outbreak Alerts Banner */}
      {stats.outbreakAlerts && stats.outbreakAlerts.length > 0 && (
        <div className="space-y-2">
          {stats.outbreakAlerts.map((a, idx) => (
            <div key={a.id || idx} className="flex items-center justify-between rounded-xl border border-rose-500/40 bg-rose-500/10 p-4 text-rose-800 dark:text-rose-300">
              <div className="flex items-center gap-3">
                <ShieldAlert className="h-6 w-6 text-rose-600 shrink-0 animate-pulse" />
                <div>
                  <p className="font-bold text-sm text-rose-700 dark:text-rose-300">{a.message}</p>
                  <p className="text-xs text-rose-600/90 dark:text-rose-300/90">Automated threshold reached. Rapid response PHC team dispatched.</p>
                </div>
              </div>
              <Badge tone="rose">Active Outbreak Alert</Badge>
            </div>
          ))}
        </div>
      )}

      {/* PHASE 9 – COUNTERS */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {/* All Reports */}
        <div 
          onClick={() => setSelectedFilter('ALL')}
          className={`surface-card p-3.5 rounded-xl cursor-pointer transition-all border ${
            selectedFilter === 'ALL' ? 'ring-2 ring-brand-500 border-transparent shadow-md' : 'hover:border-slate-300 dark:hover:border-white/20'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">All Reports</span>
            <Activity className="h-4 w-4 text-slate-400" />
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">{counts.all}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Total surveillance cases</p>
        </div>

        {/* Pending Review */}
        <div 
          onClick={() => setSelectedFilter('PENDING')}
          className={`surface-card p-3.5 rounded-xl cursor-pointer transition-all border ${
            selectedFilter === 'PENDING' ? 'ring-2 ring-amber-500 border-transparent shadow-md' : 'hover:border-slate-300 dark:hover:border-white/20'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">Pending Review</span>
            <Clock className="h-4 w-4 text-amber-500" />
          </div>
          <p className="mt-2 text-2xl font-bold text-amber-600 dark:text-amber-400">{counts.pending}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Awaiting clinical review</p>
        </div>

        {/* Verified */}
        <div 
          onClick={() => setSelectedFilter('VERIFIED')}
          className={`surface-card p-3.5 rounded-xl cursor-pointer transition-all border ${
            selectedFilter === 'VERIFIED' ? 'ring-2 ring-brand-500 border-transparent shadow-md' : 'hover:border-slate-300 dark:hover:border-white/20'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-600 dark:text-brand-400">Verified</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-500 dark:text-brand-400" />
          </div>
          <p className="mt-2 text-2xl font-bold text-emerald-600 dark:text-brand-400">{counts.verified}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Drives AI Intelligence</p>
        </div>

        {/* Escalated */}
        <div 
          onClick={() => setSelectedFilter('ESCALATED')}
          className={`surface-card p-3.5 rounded-xl cursor-pointer transition-all border ${
            selectedFilter === 'ESCALATED' ? 'ring-2 ring-orange-500 border-transparent shadow-md' : 'hover:border-slate-300 dark:hover:border-white/20'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-orange-600 dark:text-orange-400">Escalated</span>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </div>
          <p className="mt-2 text-2xl font-bold text-orange-600 dark:text-orange-400">{counts.escalated}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Dispatched to PHC</p>
        </div>

        {/* Rejected */}
        <div 
          onClick={() => setSelectedFilter('REJECTED')}
          className={`surface-card p-3.5 rounded-xl cursor-pointer transition-all border ${
            selectedFilter === 'REJECTED' ? 'ring-2 ring-rose-500 border-transparent shadow-md' : 'hover:border-slate-300 dark:hover:border-white/20'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-600 dark:text-rose-400">Rejected</span>
            <XCircle className="h-4 w-4 text-rose-500" />
          </div>
          <p className="mt-2 text-2xl font-bold text-rose-600 dark:text-rose-400">{counts.rejected}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Excluded from ML</p>
        </div>
      </div>

      {/* PHASE 10 – FILTERS TABS */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-3">
        <div className="flex items-center gap-1.5 overflow-x-auto py-1">
          <Filter className="h-4 w-4 text-slate-400 mr-1 shrink-0" />
          {[
            { key: 'ALL', label: 'All', count: counts.all },
            { key: 'PENDING', label: 'Pending', count: counts.pending },
            { key: 'VERIFIED', label: 'Verified', count: counts.verified },
            { key: 'ESCALATED', label: 'Escalated', count: counts.escalated },
            { key: 'REJECTED', label: 'Rejected', count: counts.rejected },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setSelectedFilter(tab.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                selectedFilter === tab.key
                  ? 'bg-brand-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'
              }`}
            >
              {tab.label}
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                selectedFilter === tab.key ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-300'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        <span className="text-xs text-slate-400 hidden sm:inline">
          Showing {filteredReports.length} of {reports.length} cases
        </span>
      </div>

      {/* Surveillance Reports Grid */}
      <div className="space-y-4">
        {isLoading && <SkeletonGrid count={4} className="grid gap-4 sm:grid-cols-2" />}

        {!isLoading && filteredReports.length === 0 && (
          <EmptyState
            icon={Activity}
            title={`No ${selectedFilter !== 'ALL' ? selectedFilter.toLowerCase() : ''} surveillance reports found`}
            description="Reports submitted by ASHA workers will appear here for review."
          />
        )}

        {!isLoading && filteredReports.length > 0 && (
          <div className="grid gap-4 lg:grid-cols-2">
            {filteredReports.map((r) => {
              const reportId = r.reportId || r.id;
              const sev = r.severity || 'Medium';
              const locked = isReportLocked(r.status);
              const diseaseName = (r.disease === 'Other' && r.otherDiseaseName) ? r.otherDiseaseName : (r.otherDiseaseName || r.disease);

              return (
                <div 
                  key={reportId} 
                  className={`surface-card rounded-xl border p-4 space-y-3 transition-all ${
                    locked ? 'border-slate-200/60 dark:border-white/10 bg-slate-50/40 dark:bg-white/[0.02]' : 'border-slate-200/90 dark:border-white/15'
                  }`}
                >
                  {/* Top Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-base text-slate-900 dark:text-white">
                          {r.affectedPersonName ? `${r.affectedPersonName} (${r.relationship || 'Member'})` : r.citizenName}
                        </p>
                        {locked && (
                          <span title="Report is locked" className="inline-flex items-center text-slate-400 dark:text-slate-500">
                            <Lock className="h-3.5 w-3.5" />
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                        Village: <strong className="text-brand-600 dark:text-brand-400">{r.village}</strong> · Suspected: <strong className="text-slate-800 dark:text-slate-200">{diseaseName}</strong>
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap justify-end">
                      <Badge tone={RISK_TONE[sev] || 'amber'}>{sev}</Badge>
                      {getStatusBadge(r.status)}
                    </div>
                  </div>

                  {/* Vitals Summary */}
                  <div className="grid grid-cols-4 gap-1 text-center bg-slate-100/70 p-2 rounded-lg text-[11px] font-semibold dark:bg-white/5">
                    <div><span className="text-slate-400 block font-normal text-[10px]">Temp</span>{r.temperatureC || r.temperature || 38.0}°C</div>
                    <div><span className="text-slate-400 block font-normal text-[10px]">BP</span>{r.bloodPressure || '120/80'}</div>
                    <div><span className="text-slate-400 block font-normal text-[10px]">Pulse</span>{r.pulseRate || 80} bpm</div>
                    <div><span className="text-slate-400 block font-normal text-[10px]">SpO2</span>{r.spo2Percent || r.spo2 || 98}%</div>
                  </div>

                  {/* Symptoms & Observations */}
                  <div className="rounded-lg bg-slate-100/70 p-2.5 text-xs dark:bg-white/5 space-y-1">
                    <p className="text-slate-700 dark:text-slate-300"><strong>Symptoms:</strong> {r.symptoms || 'None specified'}</p>
                    {r.observations && <p className="text-slate-500 dark:text-slate-400 italic text-[11px]">&quot;{r.observations}&quot;</p>}
                  </div>

                  {/* PHASE 7: Reviewed Metadata Card for reviewed reports */}
                  {locked && (
                    <div className="rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 p-2.5 text-xs dark:bg-white/[0.04] space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3 text-brand-500" />
                          <strong>Reviewed By:</strong> {r.reviewedBy || 'Health Officer'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-slate-400" />
                          {formatDate(r.reviewedAt)}
                        </span>
                      </div>
                      {r.healthOfficerNotes && (
                        <p className="text-slate-700 dark:text-slate-300 text-[11px]">
                          <strong>Officer Notes:</strong> {r.healthOfficerNotes}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Review Actions Section */}
                  <div className="space-y-2 pt-2 border-t border-slate-200/60 dark:border-white/10">
                    {/* Notes input only editable if not locked */}
                    {!locked && (
                      <input
                        placeholder="Enter Health Officer clinical notes / review remarks…"
                        value={officerNotesMap[reportId] || ''}
                        onChange={(e) => setOfficerNotesMap({ ...officerNotesMap, [reportId]: e.target.value })}
                        className="input-field w-full text-xs py-1.5"
                      />
                    )}

                    <div className="flex items-center gap-2">
                      {/* View Report Button - Always active */}
                      <Button
                        variant="ghost"
                        className="text-[11px] py-1 px-2.5 border border-slate-200 dark:border-white/10 shrink-0"
                        onClick={() => setSelectedReportDetail(r)}
                      >
                        <Eye className="h-3 w-3 mr-1" /> View Details
                      </Button>

                      {/* PHASE 2 & 3: Three Review Action Buttons with Locked state */}
                      <div className="grid grid-cols-3 gap-1.5 flex-1 text-xs">
                        {/* 1. VERIFY ACTION */}
                        <Button
                          variant="secondary"
                          className="text-[11px] py-1 px-2 bg-emerald-600/10 text-emerald-700 hover:bg-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-400"
                          onClick={() => handleReviewAction(reportId, 'VERIFIED')}
                          disabled={locked}
                          isLoading={actingId === `${reportId}:VERIFIED`}
                          title={locked ? 'Report already reviewed' : 'Verify case and confirm diagnosis'}
                        >
                          <UserCheck className="h-3 w-3 mr-1" /> Verify
                        </Button>

                        {/* 2. ESCALATE ACTION */}
                        <Button
                          variant="ghost"
                          className="text-[11px] py-1 px-2 bg-amber-500/10 text-amber-700 hover:bg-amber-500/20 dark:bg-amber-500/10 dark:text-amber-400 font-medium"
                          onClick={() => handleReviewAction(reportId, 'ESCALATED')}
                          disabled={locked}
                          isLoading={actingId === `${reportId}:ESCALATED`}
                          title={locked ? 'Report already reviewed' : 'Escalate case to PHC for urgent management'}
                        >
                          <AlertTriangle className="h-3 w-3 mr-1" /> Escalate
                        </Button>

                        {/* 3. REJECT ACTION */}
                        <Button
                          variant="ghost"
                          className="text-[11px] py-1 px-2 bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 dark:bg-rose-500/10 dark:text-rose-400 font-medium"
                          onClick={() => handleReviewAction(reportId, 'REJECTED')}
                          disabled={locked}
                          isLoading={actingId === `${reportId}:REJECTED`}
                          title={locked ? 'Report already reviewed' : 'Reject report if unconfirmed'}
                        >
                          <XCircle className="h-3 w-3 mr-1" /> Reject
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Clinical Details Modal */}
      <Modal 
        open={!!selectedReportDetail} 
        onClose={() => setSelectedReportDetail(null)} 
        title={`Field Case Report - ${selectedReportDetail?.affectedPersonName || selectedReportDetail?.citizenName}`}
      >
        {selectedReportDetail && (
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-4 dark:bg-white/5 text-xs">
              <div>
                <p className="text-slate-400">Citizen Name</p>
                <p className="font-bold text-slate-800 dark:text-slate-100">{selectedReportDetail.citizenName}</p>
              </div>
              <div>
                <p className="text-slate-400">Affected Person</p>
                <p className="font-semibold text-slate-800 dark:text-slate-100">
                  {selectedReportDetail.affectedPersonName || selectedReportDetail.citizenName} ({selectedReportDetail.relationship || 'Head of Household'})
                </p>
              </div>
              <div>
                <p className="text-slate-400">Age &amp; Gender</p>
                <p className="font-semibold text-slate-800 dark:text-slate-100">
                  {selectedReportDetail.age} yrs · {selectedReportDetail.gender}
                </p>
              </div>
              <div>
                <p className="text-slate-400">Village</p>
                <p className="font-semibold text-slate-800 dark:text-slate-100">{selectedReportDetail.village}</p>
              </div>
              <div>
                <p className="text-slate-400">Suspected Disease</p>
                <p className="font-semibold text-slate-800 dark:text-slate-100">
                  {(selectedReportDetail.disease === 'Other' && selectedReportDetail.otherDiseaseName)
                    ? selectedReportDetail.otherDiseaseName
                    : (selectedReportDetail.otherDiseaseName || selectedReportDetail.disease)}
                </p>
              </div>
              <div>
                <p className="text-slate-400">Severity &amp; Status</p>
                <div className="flex items-center gap-1 mt-1">
                  <Badge tone={RISK_TONE[selectedReportDetail.severity] || 'amber'}>{selectedReportDetail.severity}</Badge>
                  {getStatusBadge(selectedReportDetail.status)}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2 text-center bg-slate-50 p-3 rounded-xl text-xs dark:bg-white/5 font-semibold">
              <div><span className="text-slate-400 block font-normal text-[10px]">Temp</span>{selectedReportDetail.temperatureC || selectedReportDetail.temperature || 38.0}°C</div>
              <div><span className="text-slate-400 block font-normal text-[10px]">BP</span>{selectedReportDetail.bloodPressure || '120/80'}</div>
              <div><span className="text-slate-400 block font-normal text-[10px]">Pulse</span>{selectedReportDetail.pulseRate || 80} bpm</div>
              <div><span className="text-slate-400 block font-normal text-[10px]">SpO2</span>{selectedReportDetail.spo2Percent || selectedReportDetail.spo2 || 98}%</div>
            </div>

            <div>
              <p className="font-bold text-slate-800 dark:text-slate-100 mb-1 text-xs">Symptoms Checklist</p>
              <p className="text-xs text-slate-600 dark:text-slate-300 font-medium bg-slate-50 dark:bg-white/5 p-2.5 rounded-lg">
                {selectedReportDetail.symptoms || 'None recorded'}
              </p>
            </div>

            {selectedReportDetail.observations && (
              <div>
                <p className="font-bold text-slate-800 dark:text-slate-100 mb-1 text-xs">ASHA Field Observations</p>
                <p className="rounded-xl bg-slate-50 p-3 text-xs text-slate-600 dark:bg-white/5 dark:text-slate-300">
                  {selectedReportDetail.observations}
                </p>
              </div>
            )}

            {isReportLocked(selectedReportDetail.status) && (
              <div className="rounded-xl border border-brand-500/20 bg-brand-500/5 p-3.5 text-xs space-y-1">
                <p className="font-bold text-brand-700 dark:text-brand-300">Official Health Officer Review Record</p>
                <p className="text-slate-600 dark:text-slate-300"><strong>Reviewed By:</strong> {selectedReportDetail.reviewedBy || 'Health Officer'}</p>
                <p className="text-slate-600 dark:text-slate-300"><strong>Reviewed At:</strong> {formatDate(selectedReportDetail.reviewedAt)}</p>
                {selectedReportDetail.healthOfficerNotes && (
                  <p className="text-slate-600 dark:text-slate-300"><strong>Officer Notes:</strong> {selectedReportDetail.healthOfficerNotes}</p>
                )}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
