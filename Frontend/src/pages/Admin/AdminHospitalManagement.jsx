import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Search, Plus, Pencil, Trash2, Hospital } from 'lucide-react';
import { fetchHospitals, createHospital, updateHospital, deleteHospital } from '../../api/hospitalApi';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import { SkeletonGrid } from '../../components/common/Skeleton';

const HOSPITAL_TYPES = ['Government', 'Private', 'Community Health Centre'];
const STATUS_TONE = { Operational: 'brand', 'Near Capacity': 'amber', Critical: 'rose' };

function HospitalFormModal({ open, onClose, onSubmit, defaultValues, title }) {
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
        <input {...register('name', { required: true })} placeholder="Hospital name" className="input-field text-sm" />
        <select {...register('type', { required: true })} className="input-field text-sm">
          {HOSPITAL_TYPES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        <input {...register('address')} placeholder="Address" className="input-field text-sm" />
        <div className="grid grid-cols-2 gap-3">
          <input {...register('district')} placeholder="District" className="input-field text-sm" />
          <input {...register('phone')} placeholder="Phone" className="input-field text-sm" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <input {...register('latitude', { valueAsNumber: true })} type="number" step="any" placeholder="Latitude" className="input-field text-sm" />
          <input {...register('longitude', { valueAsNumber: true })} type="number" step="any" placeholder="Longitude" className="input-field text-sm" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <input {...register('beds', { valueAsNumber: true })} type="number" placeholder="Beds" className="input-field text-sm" />
          <select {...register('status')} className="input-field text-sm">
            {Object.keys(STATUS_TONE).map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
          <input type="checkbox" {...register('emergencyServices')} />
          Emergency services available
        </label>
        <Button type="submit" variant="primary" isLoading={isSubmitting} className="w-full text-sm">
          Save
        </Button>
      </form>
    </Modal>
  );
}

export default function AdminHospitalManagement() {
  const [hospitals, setHospitals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const load = () => {
    setIsLoading(true);
    fetchHospitals()
      .then((data) => setHospitals(data))
      .catch(() => toast.error('Could not load hospitals'))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = hospitals.filter((h) => h.name.toLowerCase().includes(search.trim().toLowerCase()));

  const handleAdd = async (values) => {
    try {
      await createHospital(values);
      toast.success('Hospital added');
      load();
    } catch {
      toast.error('Could not add hospital');
    }
  };

  const handleEdit = async (values) => {
    try {
      await updateHospital(editing.id, values);
      toast.success('Hospital updated');
      load();
    } catch {
      toast.error('Could not update hospital');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteHospital(id);
      toast.success('Hospital removed');
      load();
    } catch {
      toast.error('Could not delete hospital');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-2xl font-semibold text-slate-900 dark:text-white">Hospital Management</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Manage hospitals (referral destinations) platform-wide.</p>
        </div>
        <Button variant="primary" onClick={() => setShowAddModal(true)} className="text-sm">
          <Plus className="h-4 w-4" /> Add Hospital
        </Button>
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search hospitals…" className="input-field pl-10" />
      </div>

      {isLoading && <SkeletonGrid count={6} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" />}

      {!isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((h) => (
            <div key={h.id} className="surface-card space-y-3 p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400">
                    <Hospital className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{h.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{h.type}</p>
                  </div>
                </div>
                <Badge tone={STATUS_TONE[h.status] || 'neutral'}>{h.status}</Badge>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 dark:text-slate-400">
                {h.district && <span>District: {h.district}</span>}
                {h.beds != null && <span>Beds: {h.beds}</span>}
                {h.phone && <span>Phone: {h.phone}</span>}
                <span>{h.emergencyServices ? 'Emergency: Yes' : 'Emergency: No'}</span>
              </div>
              <div className="flex items-center justify-end gap-1">
                <button type="button" onClick={() => setEditing(h)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-white/5" aria-label="Edit">
                  <Pencil className="h-4 w-4" />
                </button>
                <button type="button" onClick={() => handleDelete(h.id)} className="rounded-lg p-1.5 text-slate-400 hover:bg-signal-rose/10 hover:text-signal-rose" aria-label="Delete">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <HospitalFormModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAdd}
        defaultValues={{ name: '', type: 'Government', address: '', district: '', phone: '', latitude: undefined, longitude: undefined, beds: 0, status: 'Operational', emergencyServices: false }}
        title="Add Hospital"
      />
      <HospitalFormModal
        open={!!editing}
        onClose={() => setEditing(null)}
        onSubmit={handleEdit}
        defaultValues={editing || {}}
        title="Edit Hospital"
      />
    </div>
  );
}
