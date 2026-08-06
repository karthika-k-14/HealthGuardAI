import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { CheckCircle2, History } from 'lucide-react';
import { getCompletedCases } from '../../api/workflowApi';
import { Spinner } from '../../components/common/Loader';
import WorkflowHistoryModal from '../../components/workflow/WorkflowHistoryModal';

export default function CompletedCases() {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedHistoryCaseId, setSelectedHistoryCaseId] = useState(null);

  useEffect(() => {
    getCompletedCases()
      .then((data) => setCases(data || []))
      .catch(() => toast.error('Failed to load completed cases.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-slate-900 dark:text-white">Completed Cases</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Resolved and completed workflow cases across the health system.
        </p>
      </div>

      <div className="surface-card p-4">
        {loading ? (
          <div className="flex justify-center p-8">
            <Spinner size={24} />
          </div>
        ) : cases.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500 flex flex-col items-center gap-2">
            <CheckCircle2 className="h-6 w-6 text-slate-400" />
            No completed workflow cases logged yet.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {cases.map((w) => (
              <div key={w.id} className="py-3 flex items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-xs text-slate-900 dark:text-white">{w.title}</h3>
                    <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                      COMPLETED
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Case #{w.caseNumber || w.id} · Citizen: {w.citizenName || 'N/A'} · Completed at: {w.completedAt ? new Date(w.completedAt).toLocaleString() : 'N/A'}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedHistoryCaseId(w.id)}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  <History className="h-3.5 w-3.5 text-amber-500 inline mr-1" /> View History
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <WorkflowHistoryModal
        workflowId={selectedHistoryCaseId}
        isOpen={Boolean(selectedHistoryCaseId)}
        onClose={() => setSelectedHistoryCaseId(null)}
      />
    </div>
  );
}
