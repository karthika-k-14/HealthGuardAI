import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import {
  FileText,
  UserRound,
  Stethoscope,
  Pill,
  Clock,
  CheckCircle2,
  PackageCheck,
  XCircle,
  History,
  Send,
  Sparkles,
} from 'lucide-react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Badge from '../common/Badge';
import { SkeletonGrid } from '../common/Skeleton';
import {
  fetchPrescriptionHistory,
  dispenseMedicine,
  updatePrescriptionStatus,
} from '../../api/prescriptionApi';

const STATUS_TONE = {
  pending: 'amber',
  verified: 'sky',
  approved: 'brand',
  available: 'brand',
  dispensed: 'brand',
  rejected: 'rose',
  cancelled: 'rose',
};

export default function PrescriptionDetailsModal({
  open,
  onClose,
  prescription,
  onUpdate,
}) {
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [notes, setNotes] = useState('');
  const [isDispensing, setIsDispensing] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [activeTab, setActiveTab] = useState('details');

  useEffect(() => {
    if (open && prescription?.id) {
      setNotes('');
      setLoadingHistory(true);
      fetchPrescriptionHistory(prescription.id)
        .then((data) => setHistory(data))
        .catch(() => setHistory([]))
        .finally(() => setLoadingHistory(false));
    }
  }, [open, prescription]);

  if (!prescription) return null;

  const handleDispense = async () => {
    setIsDispensing(true);
    try {
      await dispenseMedicine(prescription.id, notes || 'Medicines dispensed from PHC pharmacy');
      toast.success('Medicine dispensed successfully');
      setNotes('');
      onUpdate?.();
      onClose?.();
    } catch (err) {
      toast.error('Failed to dispense medicine');
    } finally {
      setIsDispensing(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    setIsUpdatingStatus(true);
    try {
      await updatePrescriptionStatus(prescription.id, newStatus, notes);
      toast.success(`Prescription status updated to ${newStatus}`);
      setNotes('');
      onUpdate?.();
      onClose?.();
    } catch (err) {
      toast.error('Failed to update prescription status');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Prescription Details — #${prescription.prescriptionNumber || prescription.id}`}
      className="max-w-2xl"
    >
      <div className="space-y-4">
        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 dark:border-white/10">
          <button
            type="button"
            onClick={() => setActiveTab('details')}
            className={`flex items-center gap-2 border-b-2 px-4 py-2 text-xs font-semibold ${
              activeTab === 'details'
                ? 'border-brand-500 text-brand-600 dark:text-brand-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'
            }`}
          >
            <FileText className="h-4 w-4" /> Details & Actions
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 border-b-2 px-4 py-2 text-xs font-semibold ${
              activeTab === 'history'
                ? 'border-brand-500 text-brand-600 dark:text-brand-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'
            }`}
          >
            <History className="h-4 w-4" /> History Log ({history.length})
          </button>
        </div>

        {activeTab === 'details' ? (
          <div className="space-y-4">
            {/* Header info card */}
            <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 dark:border-white/5 dark:bg-white/5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400">
                    <UserRound className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="font-display text-base font-semibold text-slate-900 dark:text-white">
                      {prescription.patientName}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {prescription.patientAge ? `${prescription.patientAge} years old` : 'Age not specified'}
                      {prescription.citizenId ? ` · ID: ${prescription.citizenId}` : ''}
                    </p>
                  </div>
                </div>
                <Badge tone={STATUS_TONE[prescription.status] || 'neutral'}>
                  {prescription.status}
                </Badge>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-3 pt-3 border-t border-slate-200/60 dark:border-white/10 text-xs">
                <div>
                  <span className="text-slate-400">Prescribed by:</span>
                  <p className="font-medium text-slate-700 dark:text-slate-200 flex items-center gap-1 mt-0.5">
                    <Stethoscope className="h-3.5 w-3.5 text-slate-400" />
                    {prescription.doctorName || prescription.referredBy}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400">Date Issued:</span>
                  <p className="font-medium text-slate-700 dark:text-slate-200 flex items-center gap-1 mt-0.5">
                    <Clock className="h-3.5 w-3.5 text-slate-400" />
                    {new Date(prescription.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Diagnosis & Medicines */}
            <div className="space-y-3">
              {prescription.diagnosis && (
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-400">Diagnosis</h4>
                  <p className="mt-1 text-sm text-slate-700 dark:text-slate-200">{prescription.diagnosis}</p>
                </div>
              )}

              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-400">Prescribed Medicines</h4>
                <div className="mt-2 space-y-2">
                  {Array.isArray(prescription.medicines) && prescription.medicines.length > 0 ? (
                    prescription.medicines.map((med, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-xs font-medium text-slate-700 dark:bg-white/10 dark:text-slate-200"
                      >
                        <Pill className="h-4 w-4 text-brand-500" />
                        <span>{med}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400">No medicines explicitly listed</p>
                  )}
                </div>
              </div>

              {prescription.notes && (
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-400">Instructions / Notes</h4>
                  <p className="mt-1 text-xs italic text-slate-600 dark:text-slate-300 bg-slate-50 p-2.5 rounded-lg dark:bg-white/5">
                    "{prescription.notes}"
                  </p>
                </div>
              )}
            </div>

            {/* AI verification block if available */}
            {prescription.aiVerification && (
              <div className="rounded-xl bg-brand-50 p-3.5 dark:bg-brand-500/10">
                <div className="flex items-center justify-between text-xs font-semibold text-brand-700 dark:text-brand-300">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4 text-brand-500" /> AI Stock Verification Check
                  </span>
                  <span>{prescription.aiVerification.confidence || 90}% Confidence</span>
                </div>
                <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
                  {prescription.aiVerification.result}
                </p>
              </div>
            )}

            {/* Action / Dispense & Status Section */}
            <div className="border-t border-slate-200 pt-4 dark:border-white/10 space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-400">Dispense & Update Status</h4>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Enter verification notes, dosage guidance, or dispensing remarks..."
                rows={2}
                className="input-field text-xs w-full"
              />

              <div className="flex flex-wrap items-center gap-2 pt-1">
                {prescription.status !== 'dispensed' && (
                  <Button
                    variant="primary"
                    onClick={handleDispense}
                    isLoading={isDispensing}
                    className="text-xs"
                  >
                    <PackageCheck className="h-4 w-4" /> Dispense Medicine
                  </Button>
                )}

                {prescription.status === 'pending' && (
                  <Button
                    variant="secondary"
                    onClick={() => handleStatusChange('verified')}
                    isLoading={isUpdatingStatus}
                    className="text-xs"
                  >
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Verify Prescription
                  </Button>
                )}

                {prescription.status !== 'rejected' && prescription.status !== 'cancelled' && (
                  <Button
                    variant="ghost"
                    onClick={() => handleStatusChange('rejected')}
                    isLoading={isUpdatingStatus}
                    className="text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10"
                  >
                    <XCircle className="h-4 w-4" /> Reject / Cancel
                  </Button>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Prescription History Log Tab */
          <div className="space-y-3 py-2">
            {loadingHistory ? (
              <SkeletonGrid count={3} className="grid gap-3" />
            ) : history.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-400">
                No historical status updates found for this prescription.
              </div>
            ) : (
              <div className="relative border-l-2 border-slate-200 ml-3 space-y-4 dark:border-white/10">
                {history.map((item, idx) => (
                  <div key={item.id || idx} className="relative pl-5">
                    <span className="absolute -left-[9px] top-0 h-4 w-4 rounded-full bg-brand-500 ring-4 ring-white dark:ring-slate-900" />
                    <div>
                      <p className="text-xs font-semibold text-slate-900 dark:text-white">
                        {item.action}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        By {item.performedBy} · {new Date(item.timestamp).toLocaleString()}
                      </p>
                      {item.notes && (
                        <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
                          {item.notes}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}
