import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Lock, Eye, EyeOff, KeyRound } from 'lucide-react';
import apiClient from '../../api/axios';
import Button from '../../components/common/Button';
import Logo from '../../components/common/Logo';
import { useAuth } from '../../contexts/AuthContext';
import { getRoleRedirect } from '../../utils/roleMapper';
import { STORAGE_KEYS } from '../../constants/storageKeys';
import { getJSON } from '../../utils/storage';

export default function ChangePassword() {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const newPasswordVal = watch('newPassword');

  const onSubmit = async (values) => {
    try {
      const storedUser = getJSON(STORAGE_KEYS.USER) || {};
      const email = user?.email || storedUser?.email || localStorage.getItem('hg_email') || '';
      await apiClient.post('/api/auth/change-password', { ...values, email });
      toast.success('Password changed successfully!');
      if (user) {
        setUser({ ...user, mustChangePassword: false });
        navigate(getRoleRedirect(user.role), { replace: true });
      } else {
        navigate('/login', { replace: true });
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to change password. Please try again.');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-aurora bg-dot-grid px-4 py-12">
      <div className="w-full max-w-md space-y-6 rounded-2xl border border-slate-200/80 bg-white/80 p-8 shadow-xl backdrop-blur-md dark:border-white/10 dark:bg-slate-900/80">
        <div className="flex flex-col items-center text-center">
          <Logo />
          <div className="mt-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-400">
            <KeyRound size={24} />
          </div>
          <h2 className="mt-3 font-display text-2xl font-semibold text-slate-900 dark:text-white">
            Change Temporary Password
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Your account was created with a temporary password. Please set a new password to proceed.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">
              Current Password
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                <Lock size={16} />
              </span>
              <input
                {...register('currentPassword', { required: 'Current password is required' })}
                type={showCurrent ? 'text' : 'password'}
                placeholder="Enter temporary password"
                className="input-field pl-10 pr-10 text-sm"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.currentPassword && (
              <p className="mt-1 text-xs text-signal-rose">{errors.currentPassword.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">
              New Password
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                <Lock size={16} />
              </span>
              <input
                {...register('newPassword', {
                  required: 'New password is required',
                  minLength: { value: 6, message: 'Password must be at least 6 characters' },
                })}
                type={showNew ? 'text' : 'password'}
                placeholder="Enter new password"
                className="input-field pl-10 pr-10 text-sm"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.newPassword && (
              <p className="mt-1 text-xs text-signal-rose">{errors.newPassword.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">
              Confirm New Password
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                <Lock size={16} />
              </span>
              <input
                {...register('confirmPassword', {
                  required: 'Please confirm your new password',
                  validate: (val) => val === newPasswordVal || 'Passwords do not match',
                })}
                type={showConfirm ? 'text' : 'password'}
                placeholder="Confirm new password"
                className="input-field pl-10 pr-10 text-sm"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="mt-1 text-xs text-signal-rose">{errors.confirmPassword.message}</p>
            )}
          </div>

          <Button type="submit" variant="primary" isLoading={isSubmitting} className="w-full text-sm">
            Update Password & Continue
          </Button>
        </form>
      </div>
    </div>
  );
}
