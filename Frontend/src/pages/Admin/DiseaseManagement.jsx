import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, Bug } from 'lucide-react';
import { fetchAdminDiseases, addDisease, updateDisease, deleteDisease } from '../../api/adminApi';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import { SkeletonGrid } from '../../components/common/Skeleton';

const RISK_TONE = { High: 'rose', Medium: 'amber', Low: 'brand', Critical: 'critical' };

function DiseaseFormModal({ open, onClose, onSubmit, defaultValues, title }) {
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm({ defaultValues });

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  const toList = (v) => (v ? v.split(',').map((s) => s.trim()).filter(Boolean) : []);

  return (
    <Modal open={open} onClose={onClose} title={title}>
      <form
        onSubmit={handleSubmit(async (values) => {
          await onSubmit({
            ...values,
            symptoms: toList(values.symptoms),
            prevention: toList(values.prevention),
            treatments: toList(values.treatments),
          });
          onClose();
        })}
        className="space-y-3"
      >
        <input {...register('name', { required: true })} placeholder="Disease name" className="input-field text-sm" />
        <div className="grid grid-cols-2 gap-3">
          <input {...register('category', { required: true })} placeholder="Category" className="input-field text-sm" />
          <select {...register('riskLevel', { required: true })} className="input-field text-sm">
            <option value="Low">Low risk</option>
            <option value="Medium">Medium risk</option>
            <option value="High">High risk</option>
          </select>
        </div>
        <textarea {...register('symptoms')} rows={2} placeholder="Symptoms (comma-separated)" className="input-field text-sm" />
        <textarea {...register('prevention')} rows={2} placeholder="Prevention (comma-separated)" className="input-field text-sm" />
        <textarea {...register('treatments')} rows={2} placeholder="Treatments (comma-separated)" className="input-field text-sm" />
        <Button type="submit" variant="primary" isLoading={isSubmitting} className="w-full text-sm">
          Save
        </Button>
      </form>
    </Modal>
  );
}

function toFormValues(disease) {
  if (!disease) return {};
  return {
    ...disease,
    symptoms: disease.symptoms?.join(', '),
    prevention: disease.prevention?.join(', '),
    treatments: disease.treatments?.join(', '),
  };
}

export default function DiseaseManagement() {
  const [diseases, setDiseases] = useState(null);
  const [editing, setEditing] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const load = () => {
    fetchAdminDiseases().then(setDiseases);
  };

  useEffect(load, []);

  const handleAdd = async (values) => {
    await addDisease(values);
    toast.success('Disease record added');
    load();
  };

  const handleEdit = async (values) => {
    await updateDisease(editing.id, values);
    toast.success('Disease record updated');
    load();
  };

  const handleDelete = async (id) => {
    await deleteDisease(id);
    toast.success('Disease record removed');
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-2xl font-semibold text-slate-900 dark:text-white">Disease Management</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Maintain categories, symptoms, prevention, and treatment records.</p>
        </div>
        <Button variant="primary" onClick={() => setShowAddModal(true)} className="text-sm">
          <Plus className="h-4 w-4" /> Add Disease
        </Button>
      </div>

      {!diseases && <SkeletonGrid count={4} className="grid gap-5 lg:grid-cols-2" />}

      {diseases && (
        <div className="grid gap-5 lg:grid-cols-2">
          {diseases.map((d) => (
            <div key={d.id} className="surface-card space-y-3 p-5">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400">
                    <Bug className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{d.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{d.category}</p>
                  </div>
                </div>
                <Badge tone={RISK_TONE[d.riskLevel]}>{d.riskLevel} risk</Badge>
              </div>

              <div className="grid gap-2 text-xs">
                <div>
                  <p className="font-semibold uppercase tracking-wide text-slate-400">Symptoms</p>
                  <p className="mt-0.5 text-slate-600 dark:text-slate-300">{d.symptoms.join(', ')}</p>
                </div>
                <div>
                  <p className="font-semibold uppercase tracking-wide text-slate-400">Prevention</p>
                  <p className="mt-0.5 text-slate-600 dark:text-slate-300">{d.prevention.join(', ')}</p>
                </div>
                <div>
                  <p className="font-semibold uppercase tracking-wide text-slate-400">Treatments</p>
                  <p className="mt-0.5 text-slate-600 dark:text-slate-300">{d.treatments.join(', ')}</p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-1 pt-1">
                <button type="button" onClick={() => setEditing(d)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-white/5" aria-label="Edit">
                  <Pencil className="h-4 w-4" />
                </button>
                <button type="button" onClick={() => handleDelete(d.id)} className="rounded-lg p-1.5 text-slate-400 hover:bg-signal-rose/10 hover:text-signal-rose" aria-label="Delete">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <DiseaseFormModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAdd}
        defaultValues={{ name: '', category: '', riskLevel: 'Medium', symptoms: '', prevention: '', treatments: '' }}
        title="Add Disease"
      />
      <DiseaseFormModal
        open={!!editing}
        onClose={() => setEditing(null)}
        onSubmit={handleEdit}
        defaultValues={toFormValues(editing)}
        title="Edit Disease"
      />
    </div>
  );
}
