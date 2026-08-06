import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Search, Plus, Pencil, Trash2, ArrowUpRight } from 'lucide-react';
import { fetchReferrals, createReferral, updateReferral, deleteReferral } from '../../api/referralApi';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import { SkeletonGrid } from '../../components/common/Skeleton';

const STATUS_OPTIONS = ['Pending', 'Completed', 'Cancelled'];
const STATUS_TONE = { Pending: 'amber', Completed: 'brand', Cancelled: 'rose' };

function ReferralFormModal({ open, onClose, onSubmit, defaultValues, title }) {
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm({ defaultValues });

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  return (
    <Modal open={open} onClose={onClose} title={title}>
      <form
        onSubmit={handleSubmit(async (values) => {
          await onSubmit(values);
          onClose();
        })}
        className="space-y-3"
      >
        <input {...register('citizenName', { required: true })} placeholder="Citizen name" className="input-field text-sm" />
        <input {...register('referredBy')} placeholder="Referred by" className="input-field text-sm" />
        <div className="grid grid-cols-2 gap-3">
          <input {...register('fromFacility')} placeholder="From facility" className="input-field text-sm" />
          <input {...register('toFacility')} placeholder="To facility" className="input-field text-sm" />
        </div>
        <input {...register('reason')} placeholder="Reason" className="input-field text-sm" />
        <input {...register('notes')} placeholder="Notes (optional)" className="input-field text-sm" />
        <select {...register('status')} className="input-field text-sm">
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <Button type="submit" variant="primary" isLoading={isSubmitting} className="w-full text-sm">
          Save
        </Button>
      </form>
    </Modal>
  );
}

export default function AdminReferralManagement() {
  const [referrals, setReferrals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const load = () => {
    setIsLoading(true);
    fetchReferrals()
      .then((data) => setReferrals(data))
      .catch(() => toast.error('Could not load referrals'))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = referrals.filter((r) => r.citizenName.toLowerCase().includes(search.trim().toLowerCase()));

  const handleAdd = async (values) => {
    try {
      await createReferral(values);
      toast.success('Referral added');
      load();
    } catch {
      toast.error('Could not add referral');
    }
  };

  const handleEdit = async (values) => {
    try {
      await updateReferral(editing.id, values);
      toast.success('Referral updated');
      load();
    } catch {
      toast.error('Could not update referral');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteReferral(id);
      toast.success('Referral removed');
      load();
    } catch {
      toast.error('Could not delete referral');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-2xl font-semibold text-slate-900 dark:text-white">Referral Management</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Track and manage citizen referrals between facilities.</p>
        </div>
        <Button variant="primary" onClick={() => setShowAddModal(true)} className="text-sm">
          <Plus className="h-4 w-4" /> Add Referral
        </Button>
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search referrals…" className="input-field pl-10" />
      </div>

      {isLoading && <SkeletonGrid count={6} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" />}

      {!isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((r) => (
            <div key={r.id} className="surface-card space-y-3 p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400">
                    <ArrowUpRight className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{r.citizenName}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{r.fromFacility || '—'} → {r.toFacility || '—'}</p>
                  </div>
                </div>
                <Badge tone={STATUS_TONE[r.status] || 'neutral'}>{r.status}</Badge>
              </div>
              <div className="grid grid-cols-1 gap-1 text-xs text-slate-500 dark:text-slate-400">
                {r.referredBy && <span>Referred by: {r.referredBy}</span>}
                {r.reason && <span>Reason: {r.reason}</span>}
              </div>
              <div className="flex items-center justify-end gap-1">
                <button type="button" onClick={() => setEditing(r)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-white/5" aria-label="Edit">
                  <Pencil className="h-4 w-4" />
                </button>
                <button type="button" onClick={() => handleDelete(r.id)} className="rounded-lg p-1.5 text-slate-400 hover:bg-signal-rose/10 hover:text-signal-rose" aria-label="Delete">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ReferralFormModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAdd}
        defaultValues={{ citizenName: '', referredBy: '', fromFacility: '', toFacility: '', reason: '', notes: '', status: 'Pending' }}
        title="Add Referral"
      />
      <ReferralFormModal
        open={!!editing}
        onClose={() => setEditing(null)}
        onSubmit={handleEdit}
        defaultValues={editing || {}}
        title="Edit Referral"
      />
    </div>
  );
}
