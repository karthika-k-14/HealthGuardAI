import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Search, Plus, Pencil, Trash2, Building2 } from 'lucide-react';
import { fetchPhcs, createPhc, updatePhc, deletePhc } from '../../api/phcApi';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import { SkeletonGrid } from '../../components/common/Skeleton';

function PhcFormModal({ open, onClose, onSubmit, defaultValues, title }) {
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
        <input {...register('name', { required: true })} placeholder="PHC name" className="input-field text-sm" />
        <input {...register('address')} placeholder="Address" className="input-field text-sm" />
        <div className="grid grid-cols-2 gap-3">
          <input {...register('district')} placeholder="District" className="input-field text-sm" />
          <input {...register('phone')} placeholder="Phone" className="input-field text-sm" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <input {...register('latitude', { valueAsNumber: true })} type="number" step="any" placeholder="Latitude" className="input-field text-sm" />
          <input {...register('longitude', { valueAsNumber: true })} type="number" step="any" placeholder="Longitude" className="input-field text-sm" />
        </div>
        <input {...register('villageId', { valueAsNumber: true })} type="number" placeholder="Village ID (optional)" className="input-field text-sm" />
        <Button type="submit" variant="primary" isLoading={isSubmitting} className="w-full text-sm">
          Save
        </Button>
      </form>
    </Modal>
  );
}

export default function AdminPhcManagement() {
  const [phcs, setPhcs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const load = () => {
    setIsLoading(true);
    fetchPhcs()
      .then((data) => setPhcs(data))
      .catch(() => toast.error('Could not load PHCs'))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = phcs.filter((p) => p.name.toLowerCase().includes(search.trim().toLowerCase()));

  const handleAdd = async (values) => {
    try {
      await createPhc(values);
      toast.success('PHC added');
      load();
    } catch {
      toast.error('Could not add PHC');
    }
  };

  const handleEdit = async (values) => {
    try {
      await updatePhc(editing.id, values);
      toast.success('PHC updated');
      load();
    } catch {
      toast.error('Could not update PHC');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deletePhc(id);
      toast.success('PHC removed');
      load();
    } catch {
      toast.error('Could not delete PHC');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-2xl font-semibold text-slate-900 dark:text-white">PHC Management</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Manage Primary Health Centres platform-wide.</p>
        </div>
        <Button variant="primary" onClick={() => setShowAddModal(true)} className="text-sm">
          <Plus className="h-4 w-4" /> Add PHC
        </Button>
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search PHCs…" className="input-field pl-10" />
      </div>

      {isLoading && <SkeletonGrid count={6} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" />}

      {!isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <div key={p.id} className="surface-card space-y-3 p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400">
                    <Building2 className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{p.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{p.villageName || 'No village assigned'}</p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 dark:text-slate-400">
                {p.district && <span>District: {p.district}</span>}
                {p.phone && <span>Phone: {p.phone}</span>}
              </div>
              <div className="flex items-center justify-end gap-1">
                <button type="button" onClick={() => setEditing(p)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-white/5" aria-label="Edit">
                  <Pencil className="h-4 w-4" />
                </button>
                <button type="button" onClick={() => handleDelete(p.id)} className="rounded-lg p-1.5 text-slate-400 hover:bg-signal-rose/10 hover:text-signal-rose" aria-label="Delete">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <PhcFormModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAdd}
        defaultValues={{ name: '', address: '', district: '', phone: '', latitude: undefined, longitude: undefined, villageId: undefined }}
        title="Add PHC"
      />
      <PhcFormModal
        open={!!editing}
        onClose={() => setEditing(null)}
        onSubmit={handleEdit}
        defaultValues={editing || {}}
        title="Edit PHC"
      />
    </div>
  );
}
