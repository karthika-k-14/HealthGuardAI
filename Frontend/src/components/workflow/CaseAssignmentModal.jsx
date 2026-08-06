import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { UserCheck, Building2, User, X, CheckCircle } from 'lucide-react';
import { assignCase } from '../../api/workflowApi';
import Button from '../common/Button';

export default function CaseAssignmentModal({ workflowCase, isOpen, onClose, onAssigned }) {
  const [assignedTo, setAssignedTo] = useState(workflowCase?.assignedTo || '');
  const [assignedRole, setAssignedRole] = useState(workflowCase?.assignedRole || 'ASHA');
  const [assignedBy, setAssignedBy] = useState(workflowCase?.assignedBy || 'Health Administrator');
  const [facilityName, setFacilityName] = useState(workflowCase?.facilityName || '');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !workflowCase) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!assignedTo.trim()) {
      toast.error('Recipient name is required');
      return;
    }

    setIsSubmitting(true);
    try {
      const updated = await assignCase(workflowCase.id, {
        assignedTo,
        assignedRole,
        assignedBy,
        facilityName,
        notes,
      });
      toast.success(`Case #${workflowCase.caseNumber || workflowCase.id} assigned to ${assignedTo}`);
      if (onAssigned) onAssigned(updated);
      onClose();
    } catch {
      toast.error('Could not assign case. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
      <div className="surface-card w-full max-w-md p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400">
              <UserCheck className="h-4 w-4" />
            </span>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Case Assignment</h3>
              <p className="text-xs text-slate-400">
                Case #{workflowCase.caseNumber || workflowCase.id} — {workflowCase.title || 'Workflow Case'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
              Assignee Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Dr. Ramesh Kumar / Asha Worker Anita"
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-brand-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                Assigned Role
              </label>
              <select
                value={assignedRole}
                onChange={(e) => setAssignedRole(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-brand-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white"
              >
                <option value="ASHA">ASHA Worker</option>
                <option value="HEALTH_OFFICER">Health Officer</option>
                <option value="PHARMACIST">Pharmacist</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                Assigned By
              </label>
              <input
                type="text"
                value={assignedBy}
                onChange={(e) => setAssignedBy(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-brand-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
              Facility / PHC / Hospital
            </label>
            <input
              type="text"
              placeholder="e.g. Periyanaickenpalayam PHC"
              value={facilityName}
              onChange={(e) => setFacilityName(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-brand-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
              Assignment Notes
            </label>
            <textarea
              rows={3}
              placeholder="Add details, instructions or clinical guidance..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-brand-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-200 px-3 py-1.5 font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <Button type="submit" variant="primary" isLoading={isSubmitting} className="text-xs">
              <CheckCircle className="h-3.5 w-3.5" /> Confirm Assignment
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
