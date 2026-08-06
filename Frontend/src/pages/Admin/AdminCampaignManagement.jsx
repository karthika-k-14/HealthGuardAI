import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, Send, CalendarClock, Megaphone } from 'lucide-react';
import { fetchCampaigns, addCampaign, updateCampaign, deleteCampaign, publishCampaign, scheduleCampaign } from '../../api/campaignApi';
import { publishCampaignNotify } from '../../api/workflowApi';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import { SkeletonGrid } from '../../components/common/Skeleton';

const STATUS_TONE = { active: 'brand', scheduled: 'sky', completed: 'neutral', draft: 'amber' };
const TYPES = ['Awareness', 'Vaccination Drive', 'Blood Donation', 'Nutrition Program'];

function CampaignFormModal({ open, onClose, onSubmit, defaultValues, title }) {
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
        <input {...register('title', { required: true })} placeholder="Campaign title" className="input-field text-sm" />
        <select {...register('type', { required: true })} className="input-field text-sm">
          {TYPES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        <div className="grid grid-cols-2 gap-3">
          <input {...register('startDate', { required: true })} type="date" className="input-field text-sm" />
          <input {...register('endDate', { required: true })} type="date" className="input-field text-sm" />
        </div>
        <input {...register('district')} placeholder="District" className="input-field text-sm" />
        <Button type="submit" variant="primary" isLoading={isSubmitting} className="w-full text-sm">
          Save
        </Button>
      </form>
    </Modal>
  );
}

export default function AdminCampaignManagement() {
  const [campaigns, setCampaigns] = useState(null);
  const [editing, setEditing] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const load = () => {
    fetchCampaigns().then(setCampaigns);
  };

  useEffect(load, []);

  const handleAdd = async (values) => {
    await addCampaign(values);
    toast.success('Campaign created as draft');
    load();
  };

  const handleEdit = async (values) => {
    await updateCampaign(editing.id, values);
    toast.success('Campaign updated');
    load();
  };

  const handleDelete = async (id) => {
    await deleteCampaign(id);
    toast.success('Campaign deleted');
    load();
  };

  const handlePublish = async (id) => {
    const campaign = await publishCampaign(id);
    toast.success('Campaign published');
    // Admin -> Citizens/ASHA/Health Officer: publishing pushes a
    // role-scoped notification to everyone downstream automatically.
    if (campaign) {
      await publishCampaignNotify({ title: campaign.title, campaignType: campaign.type || 'Awareness Campaign' });
    }
    load();
  };

  const handleSchedule = async (id) => {
    const startDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    await scheduleCampaign(id, startDate);
    toast.success(`Campaign scheduled for ${startDate}`);
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-2xl font-semibold text-slate-900 dark:text-white">Campaign Management</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Create, edit, publish, and schedule platform campaigns.</p>
        </div>
        <Button variant="primary" onClick={() => setShowAddModal(true)} className="text-sm">
          <Plus className="h-4 w-4" /> Create Campaign
        </Button>
      </div>

      {!campaigns && <SkeletonGrid count={5} className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3" />}

      {campaigns && (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {campaigns.map((c) => (
            <div key={c.id} className="surface-card space-y-3 p-5">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400">
                    <Megaphone className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{c.title}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{c.type || 'Awareness'}</p>
                  </div>
                </div>
                <Badge tone={STATUS_TONE[c.status] || 'neutral'}>{c.status}</Badge>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400">
                {new Date(c.startDate).toLocaleDateString()} – {new Date(c.endDate).toLocaleDateString()} · {c.reach?.toLocaleString() ?? 0} reached
              </p>

              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                {c.status !== 'active' && (
                  <button type="button" onClick={() => handlePublish(c.id)} className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600 hover:border-brand-400 hover:text-brand-600 dark:border-white/10 dark:text-slate-300">
                    <Send className="h-3 w-3" /> Publish
                  </button>
                )}
                <button type="button" onClick={() => handleSchedule(c.id)} className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600 hover:border-brand-400 hover:text-brand-600 dark:border-white/10 dark:text-slate-300">
                  <CalendarClock className="h-3 w-3" /> Schedule
                </button>
                <button type="button" onClick={() => setEditing(c)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-white/5" aria-label="Edit">
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button type="button" onClick={() => handleDelete(c.id)} className="rounded-lg p-1.5 text-slate-400 hover:bg-signal-rose/10 hover:text-signal-rose" aria-label="Delete">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <CampaignFormModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAdd}
        defaultValues={{ title: '', type: 'Awareness', startDate: '', endDate: '', district: 'Coimbatore' }}
        title="Create Campaign"
      />
      <CampaignFormModal
        open={!!editing}
        onClose={() => setEditing(null)}
        onSubmit={handleEdit}
        defaultValues={editing || {}}
        title="Edit Campaign"
      />
    </div>
  );
}
