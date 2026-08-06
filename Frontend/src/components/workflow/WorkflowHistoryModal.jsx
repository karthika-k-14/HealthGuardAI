import React, { useEffect, useState } from 'react';
import { History, X, Clock, Calendar, CheckCircle2, User } from 'lucide-react';
import { getWorkflowHistory } from '../../api/workflowApi';
import { Spinner } from '../common/Loader';

export default function WorkflowHistoryModal({ workflowId, isOpen, onClose }) {
  const [history, setHistory] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && workflowId) {
      setLoading(true);
      getWorkflowHistory(workflowId)
        .then((data) => setHistory(data))
        .catch(() => setHistory(null))
        .finally(() => setLoading(false));
    }
  }, [isOpen, workflowId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
      <div className="surface-card w-full max-w-lg p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400">
              <History className="h-4 w-4" />
            </span>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Workflow Case History</h3>
              <p className="text-xs text-slate-400">Case ID #{workflowId}</p>
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

        {loading ? (
          <div className="flex justify-center p-8">
            <Spinner size={24} />
          </div>
        ) : history ? (
          <div className="space-y-4 text-xs">
            <div className="rounded-xl bg-slate-50 dark:bg-white/5 p-3 space-y-1 border border-slate-100 dark:border-slate-800">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-slate-800 dark:text-slate-100">{history.title || 'Case'}</span>
                <span className="rounded-full bg-brand-500/10 px-2 py-0.5 text-[10px] font-bold text-brand-600 dark:text-brand-400">
                  {history.currentStatus}
                </span>
              </div>
              <p className="text-slate-500 dark:text-slate-400">
                Case #: {history.caseNumber || workflowId} · Current Assignee: {history.currentAssignee || 'Unassigned'}
              </p>
              <p className="text-slate-400 text-[10px]">
                Created: {history.createdAt ? new Date(history.createdAt).toLocaleString() : 'N/A'}
              </p>
            </div>

            <div>
              <h4 className="font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wide text-[10px]">
                Execution Timeline & Log History
              </h4>
              <div className="rounded-xl bg-slate-900 p-4 text-slate-200 font-mono text-[11px] whitespace-pre-wrap max-h-60 overflow-y-auto border border-slate-800">
                {history.historyTimeline || 'No log history recorded yet.'}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6 text-center text-slate-500 text-xs">
            Could not fetch workflow history or case history is empty.
          </div>
        )}

        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-4 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
