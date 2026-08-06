import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import {
  Search,
  Plus,
  Filter,
  Check,
  X,
  ClipboardList,
  UserRound,
  PackageCheck,
  Clock,
  Eye,
  Edit2,
  Trash2,
  History,
  Sparkles,
  RefreshCw,
  FileText,
  UserCheck,
} from 'lucide-react';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import { SkeletonGrid } from '../../components/common/Skeleton';
import {
  fetchPrescriptions,
  searchPrescriptions,
  deletePrescription,
  updatePrescriptionStatus,
  dispenseMedicine,
} from '../../api/prescriptionApi';
import PrescriptionFormModal from '../../components/prescription/PrescriptionFormModal';
import PrescriptionDetailsModal from '../../components/prescription/PrescriptionDetailsModal';
import CitizenHistoryModal from '../../components/prescription/CitizenHistoryModal';

const STATUS_TONE = {
  pending: 'amber',
  verified: 'sky',
  approved: 'brand',
  available: 'brand',
  dispensed: 'brand',
  rejected: 'rose',
  cancelled: 'rose',
};

export default function PHCReferralVerification() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modals state
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [selectedPrescriptionForEdit, setSelectedPrescriptionForEdit] = useState(null);

  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedPrescriptionForDetails, setSelectedPrescriptionForDetails] = useState(null);

  const [citizenHistoryOpen, setCitizenHistoryOpen] = useState(false);
  const [selectedCitizenForHistory, setSelectedCitizenForHistory] = useState({ id: null, name: '' });

  const [actionLoadingId, setActionLoadingId] = useState(null);

  const loadPrescriptions = async () => {
    setIsLoading(true);
    try {
      const data = await fetchPrescriptions({
        search: searchQuery,
        status: statusFilter,
      });
      setPrescriptions(data);
    } catch (err) {
      toast.error('Failed to load prescriptions from backend');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPrescriptions();
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadPrescriptions();
  };

  const handleCreateOpen = () => {
    setSelectedPrescriptionForEdit(null);
    setFormModalOpen(true);
  };

  const handleEditOpen = (prescription) => {
    setSelectedPrescriptionForEdit(prescription);
    setFormModalOpen(true);
  };

  const handleDetailsOpen = (prescription) => {
    setSelectedPrescriptionForDetails(prescription);
    setDetailsModalOpen(true);
  };

  const handleCitizenHistoryOpen = (prescription) => {
    setSelectedCitizenForHistory({
      id: prescription.citizenId,
      name: prescription.patientName,
    });
    setCitizenHistoryOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this prescription?')) {
      return;
    }
    setActionLoadingId(id);
    try {
      await deletePrescription(id);
      toast.success('Prescription deleted successfully');
      loadPrescriptions();
    } catch (err) {
      toast.error('Failed to delete prescription');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDispense = async (id) => {
    setActionLoadingId(id);
    try {
      await dispenseMedicine(id, 'Dispensed from PHC pharmacy');
      toast.success('Medicine dispensed — prescription updated');
      loadPrescriptions();
    } catch (err) {
      toast.error('Failed to dispense medicine');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleStatusChange = async (id, status) => {
    setActionLoadingId(id);
    try {
      await updatePrescriptionStatus(id, status, `Status changed to ${status}`);
      toast.success(`Prescription marked as ${status}`);
      loadPrescriptions();
    } catch (err) {
      toast.error(`Failed to update status to ${status}`);
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-slate-900 dark:text-white">
            Prescription Management & Verification
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            View, search, create, edit, dispense, and manage citizen prescription histories.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={loadPrescriptions} className="text-sm">
            <RefreshCw className="h-4 w-4" /> Refresh
          </Button>
          <Button variant="primary" onClick={handleCreateOpen} className="text-sm">
            <Plus className="h-4 w-4" /> New Prescription
          </Button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="surface-card p-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by patient name, citizen ID, doctor, or medicine..."
              className="input-field text-sm pl-9"
            />
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          </div>

          <div className="flex items-center gap-2">
            <div className="relative flex items-center">
              <Filter className="absolute left-3 h-4 w-4 text-slate-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="input-field text-sm pl-9 pr-8"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="verified">Verified</option>
                <option value="approved">Approved</option>
                <option value="dispensed">Dispensed</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <Button type="submit" variant="secondary" className="text-sm">
              Search
            </Button>
          </div>
        </form>
      </div>

      {/* Prescription List Container */}
      {isLoading ? (
        <SkeletonGrid count={4} className="grid gap-5 lg:grid-cols-2" />
      ) : prescriptions.length === 0 ? (
        <div className="surface-card p-12 text-center">
          <FileText className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-600 mb-3" />
          <h3 className="font-display text-base font-semibold text-slate-900 dark:text-white">
            No Prescriptions Found
          </h3>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {searchQuery || statusFilter !== 'all'
              ? 'Try clearing your search query or status filter.'
              : 'Create your first prescription by clicking the button above.'}
          </p>
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          {prescriptions.map((entry) => (
            <div key={entry.id} className="surface-card space-y-4 p-5 transition-all hover:shadow-md">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400">
                    <ClipboardList className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="font-display text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                      {entry.patientName}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {entry.patientAge ? `${entry.patientAge} yrs` : 'Age N/A'} · Referred by{' '}
                      <span className="font-medium text-slate-700 dark:text-slate-300">
                        {entry.doctorName || entry.referredBy}
                      </span>
                    </p>
                  </div>
                </div>
                <Badge tone={STATUS_TONE[entry.status] || 'neutral'}>{entry.status}</Badge>
              </div>

              {/* Medicines Badge List */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Prescribed Medicines</p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {Array.isArray(entry.medicines) && entry.medicines.length > 0 ? (
                    entry.medicines.map((m, idx) => (
                      <span
                        key={idx}
                        className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600 dark:bg-white/10 dark:text-slate-300"
                      >
                        {m}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-400">No medicines specified</span>
                  )}
                </div>
              </div>

              {/* AI Verification or Notes Preview */}
              {entry.aiVerification && (
                <div className="rounded-xl bg-brand-50 p-3 dark:bg-brand-500/10">
                  <div className="flex items-center justify-between">
                    <p className="flex items-center gap-1.5 text-xs font-semibold text-brand-700 dark:text-brand-300">
                      <Sparkles className="h-3.5 w-3.5" /> Stock & Verification Status
                    </p>
                    <span className="text-xs font-medium text-brand-700 dark:text-brand-300">
                      {entry.aiVerification.confidence}% confidence
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
                    {entry.aiVerification.result}
                  </p>
                </div>
              )}

              {/* Action Bar */}
              <div className="pt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleDetailsOpen(entry)}
                    className="flex items-center gap-1 text-xs font-medium text-brand-600 hover:underline dark:text-brand-400 px-2 py-1 rounded hover:bg-brand-50 dark:hover:bg-brand-500/10"
                    title="View Details & History"
                  >
                    <Eye className="h-3.5 w-3.5" /> Details
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCitizenHistoryOpen(entry)}
                    className="flex items-center gap-1 text-xs font-medium text-slate-600 hover:underline dark:text-slate-300 px-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-white/10"
                    title="View Citizen History"
                  >
                    <History className="h-3.5 w-3.5" /> History
                  </button>

                  <button
                    type="button"
                    onClick={() => handleEditOpen(entry)}
                    className="flex items-center gap-1 text-xs font-medium text-amber-600 hover:underline dark:text-amber-400 px-2 py-1 rounded hover:bg-amber-50 dark:hover:bg-amber-500/10"
                    title="Edit Prescription"
                  >
                    <Edit2 className="h-3.5 w-3.5" /> Edit
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(entry.id)}
                    className="flex items-center gap-1 text-xs font-medium text-rose-600 hover:underline dark:text-rose-400 px-2 py-1 rounded hover:bg-rose-50 dark:hover:bg-rose-500/10"
                    title="Delete Prescription"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Delete
                  </button>
                </div>

                {/* Primary Action Button (Dispense or Verify) */}
                <div className="flex items-center gap-2">
                  {entry.status === 'pending' && (
                    <Button
                      variant="secondary"
                      className="text-xs py-1 px-3"
                      onClick={() => handleStatusChange(entry.id, 'verified')}
                      isLoading={actionLoadingId === entry.id}
                    >
                      <Check className="h-3.5 w-3.5 text-emerald-500" /> Verify
                    </Button>
                  )}

                  {entry.status !== 'dispensed' && (
                    <Button
                      variant="primary"
                      className="text-xs py-1 px-3"
                      onClick={() => handleDispense(entry.id)}
                      isLoading={actionLoadingId === entry.id}
                    >
                      <PackageCheck className="h-3.5 w-3.5" /> Dispense
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Form Modal */}
      <PrescriptionFormModal
        open={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        prescription={selectedPrescriptionForEdit}
        onSuccess={loadPrescriptions}
      />

      {/* Details, History & Dispense Modal */}
      <PrescriptionDetailsModal
        open={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
        prescription={selectedPrescriptionForDetails}
        onUpdate={loadPrescriptions}
      />

      {/* Citizen Prescription History Modal */}
      <CitizenHistoryModal
        open={citizenHistoryOpen}
        onClose={() => setCitizenHistoryOpen(false)}
        citizenId={selectedCitizenForHistory.id}
        patientName={selectedCitizenForHistory.name}
      />
    </div>
  );
}
