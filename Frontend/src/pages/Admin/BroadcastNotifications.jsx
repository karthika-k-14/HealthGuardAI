import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Radio, Users, MapPinned, Building2, Send } from 'lucide-react';
import { broadcastNotification } from '../../api/notificationApi';
import { fetchAdminVillages } from '../../api/adminVillageApi';
import { fetchPhcs } from '../../api/phcApi';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';

/**
 * Backend Role enum values (com.healthguard.entity.Role) with display
 * labels - distinct from the lowercase ROLES constants used for frontend
 * auth/routing, since this dropdown must send the exact enum name the
 * backend expects.
 */
const ROLE_OPTIONS = [
  { value: 'CITIZEN', label: 'Citizens' },
  { value: 'ASHA_WORKER', label: 'ASHA Workers' },
  { value: 'HEALTH_OFFICER', label: 'Health Officers' },
  { value: 'PHARMACIST', label: 'Pharmacists' },
  { value: 'ADMIN', label: 'Admins' },
];

const NOTIFICATION_TYPES = ['info', 'alert', 'success', 'emergency'];

const TARGET_TABS = [
  { value: 'ROLE', label: 'Send to Role', icon: Users },
  { value: 'VILLAGE', label: 'Send to Village', icon: MapPinned },
  { value: 'PHC', label: 'Send to PHC', icon: Building2 },
];

const TYPE_TONE = { alert: 'rose', info: 'sky', success: 'brand', emergency: 'rose' };

export default function BroadcastNotifications() {
  const [targetType, setTargetType] = useState('ROLE');
  const [villages, setVillages] = useState([]);
  const [phcs, setPhcs] = useState([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(true);
  const [history, setHistory] = useState([]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting, errors },
  } = useForm({
    defaultValues: { role: 'CITIZEN', villageId: '', phcId: '', title: '', message: '', type: 'info', category: '' },
  });

  useEffect(() => {
    Promise.all([fetchAdminVillages(), fetchPhcs()])
      .then(([villageData, phcData]) => {
        setVillages(villageData);
        setPhcs(phcData);
      })
      .catch(() => toast.error('Could not load villages/PHCs'))
      .finally(() => setIsLoadingOptions(false));
  }, []);

  const onSubmit = async (values) => {
    const payload = {
      targetType,
      title: values.title,
      message: values.message,
      type: values.type,
      category: values.category || undefined,
    };

    if (targetType === 'ROLE') payload.role = values.role;
    if (targetType === 'VILLAGE') payload.villageId = Number(values.villageId);
    if (targetType === 'PHC') payload.phcId = Number(values.phcId);

    try {
      const result = await broadcastNotification(payload);
      toast.success(`Broadcast sent to ${result.recipientCount} recipient${result.recipientCount === 1 ? '' : 's'}`);
      setHistory((prev) => [result, ...prev]);
      reset({ ...values, title: '', message: '', category: '' });
    } catch {
      // apiClient's response interceptor already surfaces a toast for this
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="mx-auto max-w-3xl space-y-6"
    >
      <div>
        <h1 className="font-display text-2xl font-semibold text-slate-900 dark:text-white">Broadcast Notification</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Send one notification to every active user of a role, village, or PHC.
        </p>
      </div>

      {/* Target type tabs */}
      <div className="surface-card p-1.5">
        <div className="grid grid-cols-3 gap-1">
          {TARGET_TABS.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              type="button"
              onClick={() => setTargetType(value)}
              className={`flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                targetType === value
                  ? 'bg-brand-500 text-white'
                  : 'text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/5'
              }`}
            >
              <Icon className="h-4 w-4" /> {label}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="surface-card space-y-4 p-5">
        {/* Target picker, based on selected tab */}
        {targetType === 'ROLE' && (
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Role</label>
            <select {...register('role', { required: true })} className="input-field text-sm">
              {ROLE_OPTIONS.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>
        )}

        {targetType === 'VILLAGE' && (
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Village</label>
            <select
              {...register('villageId', { required: 'Select a village' })}
              disabled={isLoadingOptions}
              className="input-field text-sm"
              defaultValue=""
            >
              <option value="" disabled>
                {isLoadingOptions ? 'Loading villages…' : 'Select a village'}
              </option>
              {villages.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.villageName}{v.district ? ` — ${v.district}` : ''}
                </option>
              ))}
            </select>
            {errors.villageId && <p className="mt-1 text-xs text-signal-rose">{errors.villageId.message}</p>}
            {!isLoadingOptions && villages.length === 0 && (
              <p className="mt-1 text-xs text-slate-400">No villages found.</p>
            )}
          </div>
        )}

        {targetType === 'PHC' && (
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">PHC</label>
            <select
              {...register('phcId', { required: 'Select a PHC' })}
              disabled={isLoadingOptions}
              className="input-field text-sm"
              defaultValue=""
            >
              <option value="" disabled>
                {isLoadingOptions ? 'Loading PHCs…' : 'Select a PHC'}
              </option>
              {phcs.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}{p.villageName ? ` — ${p.villageName}` : ''}
                </option>
              ))}
            </select>
            {errors.phcId && <p className="mt-1 text-xs text-signal-rose">{errors.phcId.message}</p>}
            {!isLoadingOptions && phcs.length === 0 && (
              <p className="mt-1 text-xs text-slate-400">No PHCs found.</p>
            )}
            <p className="mt-1 text-xs text-slate-400">Reaches ASHA Workers assigned to this PHC.</p>
          </div>
        )}

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Title</label>
          <input
            {...register('title', { required: 'Title is required' })}
            placeholder="e.g. Dengue prevention advisory"
            className="input-field text-sm"
          />
          {errors.title && <p className="mt-1 text-xs text-signal-rose">{errors.title.message}</p>}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Message</label>
          <textarea
            {...register('message', { required: 'Message is required' })}
            rows={4}
            placeholder="Notification message…"
            className="input-field text-sm"
          />
          {errors.message && <p className="mt-1 text-xs text-signal-rose">{errors.message.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Type</label>
            <select {...register('type')} className="input-field text-sm">
              {NOTIFICATION_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Category (optional)</label>
            <input {...register('category')} placeholder="e.g. health-alert" className="input-field text-sm" />
          </div>
        </div>

        <Button type="submit" variant="primary" isLoading={isSubmitting} className="w-full text-sm">
          <Send className="h-4 w-4" /> Send Broadcast
        </Button>
      </form>

      {history.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-display text-sm font-semibold text-slate-700 dark:text-slate-300">Recently sent</h2>
          {history.map((h, i) => (
            <div key={`${h.sentAt}-${i}`} className="surface-card flex items-start gap-3 p-4">
              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400">
                <Radio className="h-4 w-4" />
              </span>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{h.title}</p>
                  <Badge tone={TYPE_TONE[h.type] || 'neutral'}>{h.type}</Badge>
                </div>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{h.message}</p>
                <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">
                  {h.targetType} · {h.targetLabel} · {h.recipientCount} recipient{h.recipientCount === 1 ? '' : 's'} ·{' '}
                  {new Date(h.sentAt).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
