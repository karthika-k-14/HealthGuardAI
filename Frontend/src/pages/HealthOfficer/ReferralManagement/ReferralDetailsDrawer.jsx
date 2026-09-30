import React, { useState } from 'react';
import {
  X,
  User,
  Calendar,
  Phone,
  MapPin,
  Stethoscope,
  Activity,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  Building2,
  AlertTriangle,
  History,
  Send,
  Eye,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Badge from '../../../components/common/Badge';
import Button from '../../../components/common/Button';

const STATUS_TONE = {
  PENDING: 'amber',
  UNDER_REVIEW: 'sky',
  APPROVED: 'emerald',
  REJECTED: 'rose',
};

const SEVERITY_TONE = {
  Low: 'emerald',
  Medium: 'amber',
  High: 'rose',
  Critical: 'critical',
};

export default function ReferralDetailsDrawer({
  isOpen,
  onClose,
  referral,
  onApprove,
  onReject,
  onSetUnderReview,
  actionLoading,
}) {
  const [remarks, setRemarks] = useState('');
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectRemarks, setRejectRemarks] = useState('');
  const [rejectError, setRejectError] = useState('');

  if (!isOpen || !referral) return null;

  const isPending = referral.status === 'PENDING';
  const isUnderReview = referral.status === 'UNDER_REVIEW';
  const canVerify = isPending || isUnderReview;

  const handleApproveSubmit = () => {
    onApprove(referral.id, remarks);
    setRemarks('');
  };

  const handleRejectClick = () => {
    setRejectRemarks('');
    setRejectError('');
    setRejectModalOpen(true);
  };

  const handleRejectSubmit = () => {
    if (!rejectRemarks.trim()) {
      setRejectError('Verification remarks are required when rejecting a referral.');
      return;
    }
    onReject(referral.id, rejectRemarks);
    setRejectModalOpen(false);
    setRejectRemarks('');
  };

  return (
    <>
      {/* Slide-over backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Container */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed inset-y-0 right-0 z-50 w-full max-w-2xl bg-white dark:bg-slate-900 shadow-2xl flex flex-col overflow-hidden border-l border-slate-200 dark:border-slate-800"
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {referral.referralCode || `REF-${referral.id}`}
              </h2>
              <Badge tone={STATUS_TONE[referral.status] || 'neutral'}>
                {referral.status || 'PENDING'}
              </Badge>
              <Badge tone={SEVERITY_TONE[referral.severity] || 'neutral'}>
                {referral.severity || 'Medium'} Severity
              </Badge>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Referred to: {referral.referredPhc}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Patient Information Section */}
          <div className="surface-card p-4 rounded-xl space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
              <User className="h-4 w-4 text-brand-500" />
              <span>Patient Information</span>
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
              <div>
                <p className="text-xs text-slate-400">Full Name</p>
                <p className="font-semibold text-slate-800 dark:text-slate-200">
                  {referral.patientName}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Age / Gender</p>
                <p className="font-semibold text-slate-800 dark:text-slate-200">
                  {referral.patientAge ? `${referral.patientAge} yrs` : 'N/A'}{' '}
                  {referral.patientGender ? `(${referral.patientGender})` : ''}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Citizen ID</p>
                <p className="font-semibold text-slate-800 dark:text-slate-200">
                  {referral.citizenId || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Village</p>
                <p className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-slate-400" />
                  {referral.village}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Phone</p>
                <p className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                  <Phone className="h-3.5 w-3.5 text-slate-400" />
                  {referral.phoneNumber || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Created Date</p>
                <p className="font-semibold text-slate-800 dark:text-slate-200">
                  {referral.createdAt
                    ? new Date(referral.createdAt).toLocaleString()
                    : 'N/A'}
                </p>
              </div>
            </div>
            {referral.address && (
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
                <span className="font-medium text-slate-700 dark:text-slate-300">Address: </span>
                {referral.address}
              </div>
            )}
          </div>

          {/* Clinical Findings & Symptoms */}
          <div className="surface-card p-4 rounded-xl space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
              <Stethoscope className="h-4 w-4 text-emerald-500" />
              <span>Clinical Symptoms &amp; Vitals</span>
            </h3>
            <div className="space-y-2">
              <div>
                <p className="text-xs text-slate-400 font-medium">Reported Disease</p>
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  {referral.disease}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium">Symptoms Observed</p>
                <p className="text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-lg">
                  {referral.symptoms || 'No detailed symptoms recorded.'}
                </p>
              </div>
              {referral.vitalSigns && (
                <div>
                  <p className="text-xs text-slate-400 font-medium mb-1">Vital Signs Recorded</p>
                  <div className="flex flex-wrap gap-2">
                    {referral.vitalSigns.split(',').map((vital, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800"
                      >
                        {vital.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Referral Reason & Field Notes */}
          <div className="surface-card p-4 rounded-xl space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
              <FileText className="h-4 w-4 text-purple-500" />
              <span>Referral Reason &amp; Field Notes</span>
            </h3>
            <div className="space-y-2 text-sm">
              <div>
                <p className="text-xs text-slate-400 font-medium">Reason for PHC Referral</p>
                <p className="text-slate-800 dark:text-slate-200 font-medium">
                  {referral.referralReason || 'Urgent physician evaluation and hospital management required.'}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium">Field Worker / Created By</p>
                <p className="text-slate-700 dark:text-slate-300 font-medium">
                  {referral.createdBy || 'ASHA Field Worker'}
                </p>
              </div>
              {referral.attachedNotes && (
                <div>
                  <p className="text-xs text-slate-400 font-medium">Attached Clinical Notes</p>
                  <div className="text-xs text-slate-600 dark:text-slate-400 italic bg-amber-50/60 dark:bg-amber-950/20 p-2.5 rounded-lg border border-amber-200 dark:border-amber-900/30">
                    "{referral.attachedNotes}"
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Verification Status & Officer Decision */}
          {referral.verifiedBy && (
            <div
              className={`p-4 rounded-xl border ${
                referral.status === 'APPROVED'
                  ? 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/40'
                  : 'bg-rose-50/60 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800/40'
              }`}
            >
              <h3 className="text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 text-slate-700 dark:text-slate-200">
                {referral.status === 'APPROVED' ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <XCircle className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                )}
                <span>Health Officer Verification Decision</span>
              </h3>
              <div className="mt-2 text-xs space-y-1 text-slate-700 dark:text-slate-300">
                <p>
                  <span className="font-semibold">Verified By:</span> {referral.verifiedBy}
                </p>
                <p>
                  <span className="font-semibold">Verified At:</span>{' '}
                  {referral.verifiedAt ? new Date(referral.verifiedAt).toLocaleString() : 'N/A'}
                </p>
                {referral.verificationRemarks && (
                  <p className="mt-1 pt-1 border-t border-slate-200/50 dark:border-slate-700/50">
                    <span className="font-semibold">Officer Remarks:</span>{' '}
                    {referral.verificationRemarks}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Audit History Timeline */}
          <div className="surface-card p-4 rounded-xl space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
              <History className="h-4 w-4 text-indigo-500" />
              <span>Referral Audit Status Trail</span>
            </h3>
            <div className="space-y-3 border-l-2 border-slate-200 dark:border-slate-800 ml-2 pl-3">
              {referral.statusHistory && referral.statusHistory.length > 0 ? (
                referral.statusHistory.map((item, idx) => (
                  <div key={item.id || idx} className="relative text-xs">
                    <span
                      className={`absolute -left-[19px] top-1 h-2.5 w-2.5 rounded-full ring-4 ring-white dark:ring-slate-900 ${
                        item.status === 'APPROVED'
                          ? 'bg-emerald-500'
                          : item.status === 'REJECTED'
                          ? 'bg-rose-500'
                          : item.status === 'UNDER_REVIEW'
                          ? 'bg-sky-500'
                          : 'bg-amber-500'
                      }`}
                    />
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {item.status}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {item.createdAt ? new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                      </span>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                      Changed by <span className="font-medium">{item.changedBy}</span>
                    </p>
                    {item.remarks && (
                      <p className="mt-0.5 text-slate-600 dark:text-slate-300 italic">
                        "{item.remarks}"
                      </p>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-xs text-slate-400 italic">
                  Referral created and pending initial review.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Panel Footer for Verification */}
        {canVerify && (
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/70 space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Verification Remarks (Required for Rejection)
              </label>
              <input
                type="text"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Add clinical observation, admission approval, or instructions..."
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div className="flex items-center justify-between gap-3">
              {isPending && onSetUnderReview && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onSetUnderReview(referral.id, remarks)}
                  disabled={actionLoading}
                  className="text-xs text-sky-600 dark:text-sky-400"
                >
                  Mark Under Review
                </Button>
              )}

              <div className="flex items-center gap-2 ml-auto">
                <Button
                  variant="danger"
                  size="sm"
                  onClick={handleRejectClick}
                  disabled={actionLoading}
                  className="gap-1 text-xs"
                >
                  <XCircle className="h-4 w-4" />
                  <span>Reject</span>
                </Button>

                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleApproveSubmit}
                  disabled={actionLoading}
                  className="gap-1 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Approve Referral</span>
                </Button>
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {/* Reject Modal with Mandatory Remarks */}
      {rejectModalOpen && (
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
                  {referral.referralCode} ({referral.patientName})
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300">
              Rejection requires clinical justification so the field worker and patient understand next steps.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">
                Reason for Rejection <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                value={rejectRemarks}
                onChange={(e) => {
                  setRejectRemarks(e.target.value);
                  if (rejectError) setRejectError('');
                }}
                placeholder="Enter mandatory clinical reason (e.g., mild case manageable via home care, duplicate referral)..."
                className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:ring-2 focus:ring-rose-500 focus:outline-none"
              />
              {rejectError && <p className="text-xs text-rose-500 mt-1">{rejectError}</p>}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setRejectModalOpen(false)}
                disabled={actionLoading}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleRejectSubmit}
                disabled={actionLoading}
                className="gap-1.5"
              >
                <XCircle className="h-4 w-4" />
                <span>Confirm Rejection</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
