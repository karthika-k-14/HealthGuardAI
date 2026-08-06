import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Clock, UserCheck, History } from 'lucide-react';
import { getPendingCases, updateWorkflowStatus } from '../../api/workflowApi';
import { Spinner } from '../../components/common/Loader';
import CaseAssignmentModal from '../../components/workflow/CaseAssignmentModal';
import WorkflowHistoryModal from '../../components/workflow/WorkflowHistoryModal';

export default function PendingCases() {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAssignmentCase, setSelectedAssignmentCase] = useState(null);
  const [selectedHistoryCaseId, setSelectedHistoryCaseId] = useState(null);

  const loadPending = async () => {
    setLoading(true);
    try {
      const data = await getPendingCases();
      setCases(data || []);
    } catch {
      toast.error('Failed to load pending cases.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPending();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateWorkflowStatus(id, { status: newStatus, notes: `Updated to ${newStatus}` });
      toast.success(`Case updated to ${newStatus}`);
      loadPending();
    } catch {
      toast.error('Status update failed');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-slate-900 dark:text-white">Pending Cases</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Active workflow cases requiring healthcare attention or clinical action.
        </p>
      </div>

      <div className="surface-card p-4">
        {loading ? (
          <div className="flex justify-center p-8">
            <Spinner size={24} />
          </div>
        ) : cases.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500 flex flex-col items-center gap-2">
            <Clock className="h-6 w-6 text-slate-400" />
            No pending workflow cases at this time.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {cases.map((w) => (
              <div key={w.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-xs text-slate-900 dark:text-white">{w.title}</h3>
                    <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-600 dark:text-amber-400">
                      {w.status || 'PENDING'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Case #{w.caseNumber || w.id} · Citizen: {w.citizenName || 'N/A'} · Assigned: {w.assignedTo || 'Unassigned'}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={w.status || 'NEW'}
                    onChange={(e) => handleStatusChange(w.id, e.target.value)}
                    className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
                  >
                    <option value="NEW">NEW</option>
                    <option value="IN_PROGRESS">IN_PROGRESS</option>
                    <option value="UNDER_REVIEW">UNDER_REVIEW</option>
                    <option value="COMPLETED">COMPLETED</option>
                  </select>

                  <button
                    type="button"
                    onClick={() => setSelectedAssignmentCase(w)}
                    className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                  >
                    <UserCheck className="h-3.5 w-3.5 text-brand-500 inline mr-1" /> Assign
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedHistoryCaseId(w.id)}
                    className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                  >
                    <History className="h-3.5 w-3.5 text-amber-500 inline mr-1" /> History
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <CaseAssignmentModal
        workflowCase={selectedAssignmentCase}
        isOpen={Boolean(selectedAssignmentCase)}
        onClose={() => setSelectedAssignmentCase(null)}
        onAssigned={loadPending}
      />

      <WorkflowHistoryModal
        workflowId={selectedHistoryCaseId}
        isOpen={Boolean(selectedHistoryCaseId)}
        onClose={() => setSelectedHistoryCaseId(null)}
      />
    </div>
  );
}
