import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Plus, Trash2, User, Pill, Stethoscope } from 'lucide-react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { createPrescription, updatePrescription } from '../../api/prescriptionApi';

export default function PrescriptionFormModal({ open, onClose, prescription = null, onSuccess }) {
  const isEdit = Boolean(prescription?.id);
  const [medicines, setMedicines] = useState(['']);
  
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm({
    defaultValues: {
      patientName: '',
      patientAge: '',
      citizenId: '',
      referredBy: '',
      diagnosis: '',
      notes: '',
      status: 'pending',
    },
  });

  useEffect(() => {
    if (open) {
      if (prescription) {
        reset({
          patientName: prescription.patientName || '',
          patientAge: prescription.patientAge || '',
          citizenId: prescription.citizenId || '',
          referredBy: prescription.referredBy || prescription.doctorName || '',
          diagnosis: prescription.diagnosis || '',
          notes: prescription.notes || '',
          status: prescription.status || 'pending',
        });
        const medList = Array.isArray(prescription.medicines) && prescription.medicines.length > 0
          ? prescription.medicines
          : typeof prescription.medicines === 'string' && prescription.medicines.trim()
          ? prescription.medicines.split(',').map(m => m.trim())
          : [''];
        setMedicines(medList);
      } else {
        reset({
          patientName: '',
          patientAge: '',
          citizenId: '',
          referredBy: '',
          diagnosis: '',
          notes: '',
          status: 'pending',
        });
        setMedicines(['']);
      }
    }
  }, [open, prescription, reset]);

  const handleAddMedicine = () => {
    setMedicines(prev => [...prev, '']);
  };

  const handleRemoveMedicine = (index) => {
    if (medicines.length === 1) {
      setMedicines(['']);
      return;
    }
    setMedicines(prev => prev.filter((_, i) => i !== index));
  };

  const handleMedicineChange = (index, value) => {
    setMedicines(prev => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const onSubmit = async (data) => {
    try {
      const cleanMedicines = medicines.map(m => m.trim()).filter(Boolean);
      if (cleanMedicines.length === 0) {
        toast.error('Please add at least one prescribed medicine');
        return;
      }

      const payload = {
        ...data,
        medicines: cleanMedicines,
      };

      if (isEdit) {
        await updatePrescription(prescription.id, payload);
        toast.success('Prescription updated successfully');
      } else {
        await createPrescription(payload);
        toast.success('Prescription created successfully');
      }
      
      onSuccess?.();
      onClose?.();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to save prescription');
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit Prescription' : 'Create New Prescription'}
      className="max-w-xl"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Patient Name *
            </label>
            <div className="relative">
              <input
                {...register('patientName', { required: true })}
                placeholder="e.g. Anita Desai"
                className="input-field text-sm pl-9"
              />
              <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Patient Age
            </label>
            <input
              {...register('patientAge')}
              type="number"
              placeholder="e.g. 34"
              className="input-field text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Citizen ID / UUID
            </label>
            <input
              {...register('citizenId')}
              placeholder="e.g. CIT-10492"
              className="input-field text-sm"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Prescribed / Referred By
            </label>
            <div className="relative">
              <input
                {...register('referredBy')}
                placeholder="e.g. Dr. Vivek Nair"
                className="input-field text-sm pl-9"
              />
              <Stethoscope className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            </div>
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Diagnosis / Condition
          </label>
          <input
            {...register('diagnosis')}
            placeholder="e.g. Upper Respiratory Tract Infection"
            className="input-field text-sm"
          />
        </div>

        <div>
          <div className="mb-1 flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Prescribed Medicines *
            </label>
            <button
              type="button"
              onClick={handleAddMedicine}
              className="flex items-center gap-1 text-xs font-medium text-brand-600 hover:underline dark:text-brand-400"
            >
              <Plus className="h-3.5 w-3.5" /> Add Medicine
            </button>
          </div>

          <div className="space-y-2">
            {medicines.map((med, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    value={med}
                    onChange={(e) => handleMedicineChange(idx, e.target.value)}
                    placeholder={`Medicine #${idx + 1} (e.g. Amoxicillin 500mg - 1 BD)`}
                    className="input-field text-sm pl-9"
                  />
                  <Pill className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveMedicine(idx)}
                  className="rounded-lg p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10"
                  title="Remove medicine"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Prescription Status
            </label>
            <select {...register('status')} className="input-field text-sm">
              <option value="pending">Pending</option>
              <option value="verified">Verified</option>
              <option value="approved">Approved</option>
              <option value="dispensed">Dispensed</option>
              <option value="rejected">Rejected</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Notes / Special Instructions
            </label>
            <input
              {...register('notes')}
              placeholder="Take after meals, finish 5-day course"
              className="input-field text-sm"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <Button variant="secondary" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" isLoading={isSubmitting}>
            {isEdit ? 'Update Prescription' : 'Create Prescription'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
