import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import {
  Plus, Pencil, Trash2, Send, CalendarClock,
  Megaphone, MapPin, Calendar, Users, Tag
} from 'lucide-react';
import {
  fetchCampaigns, addCampaign, updateCampaign,
  deleteCampaign, publishCampaign, scheduleCampaign
} from '../../api/campaignApi';
import { publishCampaignNotify } from '../../api/workflowApi';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import EmptyState from '../../components/common/EmptyState';
import { SkeletonGrid } from '../../components/common/Skeleton';

const STATUS_TONE = {
  active:    'brand',
  Active:    'brand',
  ACTIVE:    'brand',
  scheduled: 'sky',
  Scheduled: 'sky',
  SCHEDULED: 'sky',
  completed: 'neutral',
  Completed: 'neutral',
  COMPLETED: 'neutral',
  draft:     'amber',
  Draft:     'amber',
  DRAFT:     'amber',
};

// ─────────────────────────────────────────────────────────────────────────────
// Helper – format a date string as DD-MM-YYYY
// ─────────────────────────────────────────────────────────────────────────────
function fmtDate(val) {
  if (!val) return '—';
  try {
    const d = new Date(val);
    if (isNaN(d)) return val;
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd}-${mm}-${yyyy}`;
  } catch {
    return val;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Campaign Form Modal
// Form order: Title → Type (text) → Start Date → End Date → Village → Description
// ─────────────────────────────────────────────────────────────────────────────
function CampaignFormModal({ open, onClose, onSubmit, defaultValues, title }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues });

  useEffect(() => {
    if (open) {
      reset(defaultValues);
    }
  }, [open, defaultValues, reset]);

  const Field = ({ label, required, error, children }) => (
    <div className="space-y-1">
      <label className="block text-xs font-medium text-slate-300">
        {label} {required && <span className="text-rose-400">*</span>}
      </label>
      {children}
      {error && (
        <p className="text-xs text-rose-400">{error.message}</p>
      )}
    </div>
  );

  return (
    <Modal open={open} onClose={onClose} title={title}>
      <form
        onSubmit={handleSubmit(async (values) => {
          await onSubmit(values);
          onClose();
        })}
        className="space-y-4"
      >
        {/* Campaign Title */}
        <Field label="Campaign Title" required error={errors.title}>
          <input
            {...register('title', { required: 'Please enter campaign title' })}
            placeholder="e.g. Dengue Awareness Drive 2026"
            className="input-field text-sm w-full"
            id="campaign-title"
          />
        </Field>

        {/* Campaign Type — pure text input */}
        <Field label="Campaign Type" required error={errors.type}>
          <input
            {...register('type', { required: 'Please enter campaign type' })}
            placeholder="e.g. Awareness, Vaccination Drive, Dengue Prevention…"
            className="input-field text-sm w-full"
            id="campaign-type"
          />
        </Field>

        {/* Dates — side by side */}
        <div className="grid grid-cols-2 gap-3">
          <Field label="Start Date" required error={errors.startDate}>
            <input
              {...register('startDate', { required: 'Please select start date' })}
              type="date"
              className="input-field text-sm w-full"
              id="campaign-start-date"
            />
          </Field>
          <Field label="End Date" required error={errors.endDate}>
            <input
              {...register('endDate', { required: 'Please select end date' })}
              type="date"
              className="input-field text-sm w-full"
              id="campaign-end-date"
            />
          </Field>
        </div>

        {/* Village Name — pure text input */}
        <Field label="Village Name" required error={errors.villageName}>
          <input
            {...register('villageName', { required: 'Please enter village name' })}
            placeholder="e.g. Coimbatore Village, Madukkarai, Myleripalayam…"
            className="input-field text-sm w-full"
            id="campaign-village-name"
          />
        </Field>

        {/* Description */}
        <Field label="Description" error={errors.description}>
          <textarea
            {...register('description')}
            placeholder="Brief description of the campaign objectives…"
            rows={3}
            className="input-field text-sm w-full resize-none"
            id="campaign-description"
          />
        </Field>


        <Button
          type="submit"
          variant="primary"
          isLoading={isSubmitting}
          className="w-full text-sm mt-2"
        >
          Save Campaign
        </Button>
      </form>
    </Modal>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────
export default function AdminCampaignManagement() {
  const [campaigns, setCampaigns] = useState(null);
  const [editing, setEditing]     = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const load = () => fetchCampaigns().then(setCampaigns);
  useEffect(() => { load(); }, []);

  const handleAdd = async (values) => {
    try {
      await addCampaign(values);
      toast.success('Campaign created successfully');
      load();
    } catch (err) {
      console.error('[AdminCampaignManagement] Failed to create campaign:', err);
      toast.error(err?.response?.data?.message || 'Failed to create campaign');
    }
  };

  const handleEdit = async (values) => {
    try {
      await updateCampaign(editing.id, values);
      toast.success('Campaign updated successfully');
      load();
    } catch (err) {
      console.error('[AdminCampaignManagement] Failed to update campaign:', err);
      toast.error(err?.response?.data?.message || 'Failed to update campaign');
    }
  };

  const handleDelete = async (campaignId) => {
    try {
      setCampaigns((prev) =>
        prev ? prev.filter((c) => String(c.id) !== String(campaignId)) : prev
      );
      await deleteCampaign(campaignId);
      toast.success('Campaign deleted successfully');
      const refreshed = await fetchCampaigns();
      setCampaigns(refreshed);
    } catch {
      toast.error('Failed to delete campaign');
      load();
    }
  };

  const handlePublish = async (id) => {
    try {
      const campaign = await publishCampaign(id);
      toast.success('Campaign published');
      if (campaign) {
        await publishCampaignNotify({
          title: campaign.title,
          campaignType: campaign.type || 'Awareness Campaign',
        });
      }
      await load();
    } catch {
      toast.error('Failed to publish campaign');
    }
  };

  const handleSchedule = async (id) => {
    try {
      const startDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .slice(0, 10);
      await scheduleCampaign(id, startDate);
      toast.success(`Campaign scheduled for ${startDate}`);
      await load();
    } catch {
      toast.error('Failed to schedule campaign');
    }
  };

  const defaultAdd = {
    title: '',
    type: '',
    startDate: '',
    endDate: '',
    villageName: '',
    description: '',
  };

  return (
    <div className="space-y-6">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-2xl font-semibold text-slate-900 dark:text-white">
            Campaign Management
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Create, edit, publish, and schedule public health campaigns.
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => setShowAddModal(true)}
          className="text-sm"
          id="create-campaign-btn"
        >
          <Plus className="h-4 w-4" /> Create Campaign
        </Button>
      </div>

      {/* ── Loading skeleton ─────────────────────────────────────────────── */}
      {!campaigns && (
        <SkeletonGrid count={5} className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3" />
      )}

      {/* ── Empty state ──────────────────────────────────────────────────── */}
      {campaigns && campaigns.length === 0 && (
        <EmptyState
          icon={Megaphone}
          title="No campaigns available."
          description="There are currently no public health campaigns. Click 'Create Campaign' to create one."
        />
      )}

      {/* ── Campaign Table ───────────────────────────────────────────────── */}
      {campaigns && campaigns.length > 0 && (
        <div className="overflow-x-auto rounded-2xl border border-slate-800/80 bg-slate-900/60">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-left">
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  <div className="flex items-center gap-1.5"><Megaphone className="h-3.5 w-3.5" /> Campaign Title</div>
                </th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  <div className="flex items-center gap-1.5"><Tag className="h-3.5 w-3.5" /> Type</div>
                </th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  <div className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> Village</div>
                </th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  <div className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> Start Date</div>
                </th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  <div className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> End Date</div>
                </th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Status</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {campaigns.map((c) => (
                <tr
                  key={c.id}
                  className="group transition-colors hover:bg-slate-800/40"
                >
                  {/* Title */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-500/10 text-brand-400">
                        <Megaphone className="h-3.5 w-3.5" />
                      </span>
                      <div>
                        <p className="font-medium text-slate-100">{c.title}</p>
                        {c.description && (
                          <p className="mt-0.5 max-w-[200px] truncate text-xs text-slate-500">
                            {c.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Type */}
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center rounded-full bg-cyan-500/10 px-2.5 py-0.5 text-xs font-medium text-cyan-300 border border-cyan-500/20">
                      {c.type || 'Awareness'}
                    </span>
                  </td>

                  {/* Village */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 text-slate-300">
                      <MapPin className="h-3 w-3 shrink-0 text-slate-500" />
                      <span className="text-xs">{c.villageName || c.village || c.district || '—'}</span>
                    </div>
                  </td>

                  {/* Start Date */}
                  <td className="px-4 py-3 text-xs text-slate-400">
                    {fmtDate(c.startDate)}
                  </td>

                  {/* End Date */}
                  <td className="px-4 py-3 text-xs text-slate-400">
                    {fmtDate(c.endDate)}
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3">
                    <Badge tone={STATUS_TONE[c.status] || 'neutral'}>
                      {c.status}
                    </Badge>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      {c.status?.toLowerCase() !== 'active' && (
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); handlePublish(c.id); }}
                          title="Publish"
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-700 px-2 py-1 text-xs font-medium text-slate-300 transition hover:border-brand-500 hover:text-brand-400"
                        >
                          <Send className="h-3 w-3" /> Publish
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); handleSchedule(c.id); }}
                        title="Schedule"
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-700 px-2 py-1 text-xs font-medium text-slate-300 transition hover:border-sky-500 hover:text-sky-400"
                      >
                        <CalendarClock className="h-3 w-3" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setEditing(c); }}
                        title="Edit"
                        className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-700 hover:text-slate-100"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); handleDelete(c.id); }}
                        title="Delete"
                        className="rounded-lg p-1.5 text-slate-400 transition hover:bg-rose-500/10 hover:text-rose-400"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Modals ───────────────────────────────────────────────────────── */}
      <CampaignFormModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAdd}
        defaultValues={defaultAdd}
        title="Create Campaign"
      />
      <CampaignFormModal
        open={!!editing}
        onClose={() => setEditing(null)}
        onSubmit={handleEdit}
        defaultValues={editing || defaultAdd}
        title="Edit Campaign"
      />
    </div>
  );
}
