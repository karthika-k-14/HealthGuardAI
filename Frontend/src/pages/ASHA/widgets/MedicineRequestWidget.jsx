import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Pill, Plus } from 'lucide-react';
import { fetchMedicineRequests, submitMedicineRequest } from '../../../api/ashaApi';
import { Skeleton } from '../../../components/common/Skeleton';
import Badge from '../../../components/common/Badge';
import Button from '../../../components/common/Button';

const STATUS_TONE = { approved: 'brand', pending: 'amber', rejected: 'rose' };

export default function MedicineRequestWidget() {
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm();

  const load = () => {
    fetchMedicineRequests().then((data) => {
      setRequests(data);
      setIsLoading(false);
    });
  };

  useEffect(load, []);

  const onSubmit = async (values) => {
    const newRequest = await submitMedicineRequest(values);
    setRequests((prev) => [newRequest, ...prev]);
    toast.success('Medicine request submitted');
    reset();
  };

  return (
    <div className="surface-card p-6">
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400">
          <Pill className="h-4 w-4" />
        </span>
        <p className="text-sm font-semibold text-slate-900 dark:text-white">Medicine Requests</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-4 flex flex-col gap-2 sm:flex-row">
        <input
          {...register('medicine', { required: true })}
          placeholder="Medicine name"
          className="input-field flex-1 text-sm"
        />
        <input
          {...register('quantity', { required: true, valueAsNumber: true, min: 1 })}
          type="number"
          placeholder="Qty"
          className="input-field w-24 text-sm"
        />
        <Button type="submit" variant="primary" isLoading={isSubmitting} className="text-sm">
          {!isSubmitting && (
            <>
              <Plus className="h-4 w-4" /> Request
            </>
          )}
        </Button>
      </form>

      <div className="mt-4 space-y-2.5">
        {isLoading && Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
        {!isLoading &&
          requests.map((r) => (
            <div key={r.id} className="flex items-center justify-between rounded-xl border border-slate-200/70 px-3 py-2 text-sm dark:border-white/10">
              <span className="truncate text-slate-700 dark:text-slate-200">
                {r.medicine} <span className="text-slate-400">× {r.quantity}</span>
              </span>
              <Badge tone={STATUS_TONE[r.status] || 'neutral'}>{r.status}</Badge>
            </div>
          ))}
      </div>
    </div>
  );
}
