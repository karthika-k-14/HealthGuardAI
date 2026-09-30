import React, { useEffect, useState, useMemo } from 'react';
import toast from 'react-hot-toast';
import {
  Building2,
  RefreshCw,
  Download,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import Button from '../../../components/common/Button';
import Badge from '../../../components/common/Badge';

import ReferralStatisticsCard from './ReferralStatisticsCard';
import ReferralFilters from './ReferralFilters';
import ReferralList from './ReferralList';
import ReferralDetailsDrawer from './ReferralDetailsDrawer';

import {
  fetchReferrals,
  fetchReferralById,
  approveReferral,
  rejectReferral,
  setReferralUnderReview,
  fetchReferralStatistics,
} from '../../../api/officerApi';

const STATUS_TABS = [
  { id: 'all', label: 'All Cases' },
  { id: 'PENDING', label: 'Pending Verification', isPending: true },
  { id: 'UNDER_REVIEW', label: 'Under Review' },
  { id: 'APPROVED', label: 'Approved' },
  { id: 'REJECTED', label: 'Rejected' },
];

export default function ReferralManagementPage() {
  const [referrals, setReferrals] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // Filters State
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    village: 'all',
    disease: 'all',
    severity: 'all',
  });

  // Drawer & Selection State
  const [selectedReferral, setSelectedReferral] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Rejection Dialog State
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [referralToReject, setReferralToReject] = useState(null);
  const [rejectionRemarks, setRejectionRemarks] = useState('');
  const [rejectionError, setRejectionError] = useState('');

  // Quick Approve Dialog State
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [referralToApprove, setReferralToApprove] = useState(null);
  const [approvalRemarks, setApprovalRemarks] = useState('');

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [refList, stats] = await Promise.all([
        fetchReferrals(filters),
        fetchReferralStatistics(),
      ]);
      setReferrals(refList || []);
      setStatistics(stats || null);
    } catch (err) {
      console.error('Error loading referrals:', err);
      toast.error('Failed to load PHC referrals.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [filters.status, filters.village, filters.disease, filters.severity]);

  // Debounced search trigger
  useEffect(() => {
    const timer = setTimeout(() => {
      loadData();
    }, 300);
    return () => clearTimeout(timer);
  }, [filters.search]);

  const handleResetFilters = () => {
    setFilters({
      search: '',
      status: 'all',
      village: 'all',
      disease: 'all',
      severity: 'all',
    });
  };

  const handleOpenDetails = async (referral) => {
    try {
      const fullDetails = await fetchReferralById(referral.id);
      setSelectedReferral(fullDetails || referral);
    } catch {
      setSelectedReferral(referral);
    }
    setDrawerOpen(true);
  };

  // Approval Execution
  const executeApprove = async (id, remarks) => {
    setActionLoadingId(id);
    try {
      const updated = await approveReferral(id, { remarks });
      toast.success(`Referral #${id} approved successfully.`);
      if (selectedReferral && selectedReferral.id === id) {
        setSelectedReferral(updated);
      }
      setApproveModalOpen(false);
      setApprovalRemarks('');
      setReferralToApprove(null);
      loadData();
    } catch (err) {
      toast.error('Failed to approve referral.');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Rejection Execution (Mandatory Remarks)
  const executeReject = async (id, remarks) => {
    if (!remarks || !remarks.trim()) {
      toast.error('Verification remarks are required when rejecting a referral.');
      return;
    }
    setActionLoadingId(id);
    try {
      const updated = await rejectReferral(id, { remarks: remarks.trim() });
      toast.success(`Referral #${id} rejected with remarks logged.`);
      if (selectedReferral && selectedReferral.id === id) {
        setSelectedReferral(updated);
      }
      setRejectModalOpen(false);
      setRejectionRemarks('');
      setRejectionError('');
      setReferralToReject(null);
      loadData();
    } catch (err) {
      toast.error('Failed to reject referral.');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Under Review Execution
  const executeSetUnderReview = async (id, remarks) => {
    setActionLoadingId(id);
    try {
      const updated = await setReferralUnderReview(id, { remarks });
      toast.success(`Referral #${id} set to Under Review.`);
      if (selectedReferral && selectedReferral.id === id) {
        setSelectedReferral(updated);
      }
      loadData();
    } catch (err) {
      toast.error('Failed to update referral status.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleQuickApproveClick = (referral) => {
    setReferralToApprove(referral);
    setApprovalRemarks('Approved for hospital consultation and medical care.');
    setApproveModalOpen(true);
  };

  const handleQuickRejectClick = (referral) => {
    setReferralToReject(referral);
    setRejectionRemarks('');
    setRejectionError('');
    setRejectModalOpen(true);
  };

  // CSV Export for Health Officer documentation
  const handleExportCSV = () => {
    if (referrals.length === 0) {
      toast.error('No referrals available to export.');
      return;
    }
    const headers = [
      'Referral Code',
      'Patient Name',
      'Age',
      'Gender',
      'Village',
      'Disease',
      'Severity',
      'Referred PHC',
      'Status',
      'Created By',
      'Created At',
      'Verified By',
      'Remarks',
    ];
    const rows = referrals.map((r) => [
      `"${r.referralCode || r.id}"`,
      `"${r.patientName || ''}"`,
      `"${r.patientAge || ''}"`,
      `"${r.patientGender || ''}"`,
      `"${r.village || ''}"`,
      `"${r.disease || ''}"`,
      `"${r.severity || ''}"`,
      `"${r.referredPhc || ''}"`,
      `"${r.status || ''}"`,
      `"${r.createdBy || ''}"`,
      `"${r.createdAt || ''}"`,
      `"${r.verifiedBy || ''}"`,
      `"${(r.verificationRemarks || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `phc_referrals_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Referral dataset exported successfully.');
  };

  const pendingCount = statistics?.pendingReferrals ?? 0;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400">
              <Building2 className="h-6 w-6" />
            </span>
            <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
              PHC Referral Management
            </h1>
          </div>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Dedicated Health Officer verification portal for reviewing, approving, and auditing Primary Health Centre referrals.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            disabled={isLoading}
            className="gap-1.5 text-xs text-slate-700 dark:text-slate-300"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            className="gap-1.5 text-xs text-slate-700 dark:text-slate-300"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export CSV</span>
          </Button>
        </div>
      </div>

      {/* KPI Cards & Charts */}
      <ReferralStatisticsCard
        statistics={statistics}
        onSelectStatus={(st) => setFilters((prev) => ({ ...prev, status: st }))}
      />

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto border-b border-slate-200 dark:border-slate-800 pb-1">
        {STATUS_TABS.map((tab) => {
          const isActive = (filters.status || 'all').toUpperCase() === tab.id.toUpperCase();
          return (
            <button
              key={tab.id}
              onClick={() => setFilters((prev) => ({ ...prev, status: tab.id }))}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-brand-500 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <span>{tab.label}</span>
              {tab.isPending && pendingCount > 0 && (
                <span
                  className={`inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold rounded-full ${
                    isActive ? 'bg-white text-brand-600' : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                  }`}
                >
                  {pendingCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Search & Secondary Filters */}
      <ReferralFilters
        filters={filters}
        onChange={setFilters}
        onReset={handleResetFilters}
        availableVillages={statistics?.availableVillages || []}
        availableDiseases={statistics?.availableDiseases || []}
      />

      {/* Referral Table List */}
      <ReferralList
        referrals={referrals}
        isLoading={isLoading}
        onViewDetails={handleOpenDetails}
        onQuickApprove={handleQuickApproveClick}
        onQuickReject={handleQuickRejectClick}
        actionLoadingId={actionLoadingId}
      />

      {/* Slide-over Details Drawer */}
      <ReferralDetailsDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        referral={selectedReferral}
        onApprove={executeApprove}
        onReject={executeReject}
        onSetUnderReview={executeSetUnderReview}
        actionLoading={Boolean(actionLoadingId)}
      />

      {/* Quick Approve Dialog Modal */}
      {approveModalOpen && referralToApprove && (
        <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center gap-3 text-emerald-600">
              <span className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/60">
                <CheckCircle2 className="h-6 w-6" />
              </span>
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Approve PHC Referral
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {referralToApprove.referralCode} ({referralToApprove.patientName})
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300">
              Approving this referral validates clinical necessity and authorizes PHC admission or treatment.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">
                Approval Remarks / Clinical Guidance
              </label>
              <textarea
                rows={3}
                value={approvalRemarks}
                onChange={(e) => setApprovalRemarks(e.target.value)}
                placeholder="Enter approval instructions..."
                className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setApproveModalOpen(false)}
                disabled={Boolean(actionLoadingId)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => executeApprove(referralToApprove.id, approvalRemarks)}
                disabled={Boolean(actionLoadingId)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>Confirm Approval</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Reject Dialog Modal (Mandatory Remarks) */}
      {rejectModalOpen && referralToReject && (
        <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <span className="p-2 rounded-xl bg-rose-100 dark:bg-rose-950/60">
                <AlertTriangle className="h-6 w-6" />
              </span>
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Reject PHC Referral
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {referralToReject.referralCode} ({referralToReject.patientName})
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300">
              A clinical justification is required so the field worker and patient understand next steps.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">
                Reason for Rejection <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                value={rejectionRemarks}
                onChange={(e) => {
                  setRejectionRemarks(e.target.value);
                  if (rejectionError) setRejectionError('');
                }}
                placeholder="Enter mandatory clinical reason..."
                className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:ring-2 focus:ring-rose-500 focus:outline-none"
              />
              {rejectionError && (
                <p className="text-xs text-rose-500 mt-1">{rejectionError}</p>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setRejectModalOpen(false)}
                disabled={Boolean(actionLoadingId)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => {
                  if (!rejectionRemarks.trim()) {
                    setRejectionError('Verification remarks are required when rejecting a referral.');
                    return;
                  }
                  executeReject(referralToReject.id, rejectionRemarks);
                }}
                disabled={Boolean(actionLoadingId)}
                className="gap-1.5"
              >
                <XCircle className="h-4 w-4" />
                <span>Confirm Rejection</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
