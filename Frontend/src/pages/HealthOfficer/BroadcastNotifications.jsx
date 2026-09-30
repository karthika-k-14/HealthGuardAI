import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Users, Send, Radio, ChevronDown } from 'lucide-react';
import { sendBroadcastNotification } from '../../api/broadcastApi';
import Button from '../../components/common/Button';

const ROLE_OPTIONS = [
  {
    value: 'CITIZEN',
    label: 'Send To Citizens',
    desc: 'Registered citizens in this district',
  },
  {
    value: 'ASHA_WORKER',
    label: 'Send To ASHA Workers',
    desc: 'Accredited Social Health Activists',
  },
];

const TYPE_OPTIONS = [
  { value: 'info',      label: 'Info' },
  { value: 'warning',   label: 'Warning' },
  { value: 'emergency', label: 'Emergency' },
];

export default function BroadcastNotifications() {
  const [selectedRole, setSelectedRole] = useState('CITIZEN');

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { isSubmitting, errors },
  } = useForm({
    defaultValues: {
      village: '',
      title: '',
      message: '',
      notificationType: 'info',
      category: '',
    },
  });

  const village = watch('village');

  const onSubmit = async (values) => {
    const payload = {
      title: values.title.trim(),
      message: values.message.trim(),
      role: selectedRole,
      village: values.village?.trim() || null,
      category: values.category?.trim() || 'General',
      notificationType: values.notificationType || 'info',
    };

    try {
      const result = await sendBroadcastNotification(payload);
      const msg = result?.message || 'Broadcast sent successfully!';
      const resData = result?.data || result;
      const recipientCount = resData?.recipientCount !== undefined ? resData.recipientCount : (result?.recipientCount || 'N/A');

      console.log('[Broadcast] Notification saved:', resData);
      console.log('[Broadcast] Target role:', selectedRole);
      console.log('[Broadcast] Target village:', payload.village || 'ALL');
      console.log('[Broadcast] Recipient count:', recipientCount);

      toast.success(msg);
      reset({
        village: '',
        title: '',
        message: '',
        notificationType: 'info',
        category: '',
      });
    } catch (err) {
      console.error('Failed to send broadcast:', err);
      const errMsg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        'Failed to send broadcast';
      toast.error(errMsg);
    }
  };

  const villageValue = village?.trim();

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mx-auto max-w-2xl space-y-6"
    >
      {/* Page Header */}
      <div>
        <div className="mb-1 flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
          <span>Health Officer</span>
          <span>/</span>
          <span className="text-brand-600 dark:text-brand-400">Broadcast</span>
        </div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Broadcast Notification
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Send health alerts to Citizens or ASHA Workers — across all villages or a specific village.
        </p>
      </div>

      {/* Role Selection */}
      <div className="grid grid-cols-2 gap-3">
        {ROLE_OPTIONS.map(({ value, label, desc }) => {
          const isActive = selectedRole === value;
          return (
            <button
              key={value}
              type="button"
              onClick={() => setSelectedRole(value)}
              className={`flex flex-col items-start gap-1 rounded-2xl border px-4 py-3.5 text-left transition-all duration-200 ${
                isActive
                  ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20 shadow-sm'
                  : 'border-slate-200 dark:border-white/10 bg-white/60 dark:bg-white/5 hover:border-brand-300 dark:hover:border-brand-700'
              }`}
            >
              <div className="flex w-full items-center gap-2">
                <Users
                  className={`h-4 w-4 shrink-0 ${
                    isActive ? 'text-brand-600 dark:text-brand-400' : 'text-slate-400'
                  }`}
                />
                <span
                  className={`text-sm font-semibold ${
                    isActive
                      ? 'text-brand-700 dark:text-brand-300'
                      : 'text-slate-700 dark:text-slate-200'
                  }`}
                >
                  {label}
                </span>
                {isActive && (
                  <span className="ml-auto h-2 w-2 rounded-full bg-brand-500 animate-pulse" />
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">{desc}</p>
            </button>
          );
        })}
      </div>

      {/* Broadcast Form */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-5 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-[#111714]/80 backdrop-blur-md shadow-sm p-6"
      >
        {/* Village Name (Optional) */}
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Village Name{' '}
            <span className="font-normal normal-case text-slate-400">(optional)</span>
          </label>
          <input
            {...register('village')}
            type="text"
            placeholder="Leave empty to send to all villages"
            className="input-field text-sm"
            autoComplete="off"
          />
          <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
            {villageValue
              ? `Only ${selectedRole === 'CITIZEN' ? 'citizens' : 'ASHA workers'} from "${villageValue}" will be notified.`
              : `All ${selectedRole === 'CITIZEN' ? 'citizens' : 'ASHA workers'} will be notified.`}
          </p>
        </div>

        {/* Title */}
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Notification Title
          </label>
          <input
            {...register('title', { required: 'Title is required' })}
            placeholder="e.g. Dengue Prevention Advisory"
            className="input-field text-sm"
          />
          {errors.title && (
            <p className="mt-1 text-xs text-rose-500">{errors.title.message}</p>
          )}
        </div>

        {/* Message */}
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Message
          </label>
          <textarea
            {...register('message', { required: 'Message is required' })}
            rows={4}
            placeholder="Write the health notification message here…"
            className="input-field text-sm resize-none"
          />
          {errors.message && (
            <p className="mt-1 text-xs text-rose-500">{errors.message.message}</p>
          )}
        </div>

        {/* Type & Category */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Notification Type
            </label>
            <div className="relative">
              <select
                {...register('notificationType')}
                className="input-field text-sm appearance-none pr-8"
              >
                {TYPE_OPTIONS.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Category{' '}
              <span className="font-normal normal-case text-slate-400">(optional)</span>
            </label>
            <input
              {...register('category')}
              placeholder="e.g. Dengue, Malaria, General"
              className="input-field text-sm"
            />
          </div>
        </div>

        {/* Summary Banner */}
        <div className="rounded-xl border border-brand-200 dark:border-brand-800/50 bg-brand-50/60 dark:bg-brand-900/10 px-4 py-3">
          <div className="flex items-center gap-2 text-xs text-brand-700 dark:text-brand-300">
            <Radio className="h-3.5 w-3.5 shrink-0" />
            <span>
              Will notify{' '}
              <strong>
                {selectedRole === 'CITIZEN' ? 'Citizens' : 'ASHA Workers'}
              </strong>{' '}
              {villageValue ? (
                <>
                  from village <strong>"{villageValue}"</strong>
                </>
              ) : (
                <>in <strong>all villages</strong></>
              )}
            </span>
          </div>
        </div>

        {/* Send Button */}
        <div className="pt-1">
          <Button
            type="submit"
            variant="primary"
            isLoading={isSubmitting}
            className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-semibold"
          >
            <Send className="h-4 w-4" />
            <span>Send Broadcast</span>
          </Button>
        </div>
      </form>
    </motion.div>
  );
}
