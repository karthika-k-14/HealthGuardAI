import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { History, Search } from 'lucide-react';
import { getAllWorkflows } from '../../api/workflowApi';
import { Spinner } from '../../components/common/Loader';
import WorkflowHistoryModal from '../../components/workflow/WorkflowHistoryModal';

export default function WorkflowHistory() {
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCaseId, setSelectedCaseId] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    getAllWorkflows()
      .then((data) => setWorkflows(data || []))
      .catch(() => toast.error('Failed to load workflow history.'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = workflows.filter(
    (w) =>
      !search ||
      w.title?.toLowerCase().includes(search.toLowerCase()) ||
      w.caseNumber?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-slate-900 dark:text-white">Workflow History</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Inspect execution timelines and audit change logs of workflow cases.
        </p>
      </div>

      <div className="surface-card p-4 space-y-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by case # or title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 py-2 text-xs text-slate-900 focus:border-brand-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white"
          />
        </div>

        {loading ? (
          <div className="flex justify-center p-8">
            <Spinner size={24} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">No workflow history records found.</div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {filtered.map((w) => (
              <div key={w.id} className="py-3 flex items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-xs text-slate-900 dark:text-white">{w.title}</h3>
                  <p className="text-[10px] text-slate-400">Case #{w.caseNumber || w.id} · Assignee: {w.assignedTo || 'Unassigned'}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedCaseId(w.id)}
                  className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  <History className="h-3.5 w-3.5 text-amber-500" /> View History Log
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <WorkflowHistoryModal
        workflowId={selectedCaseId}
        isOpen={Boolean(selectedCaseId)}
        onClose={() => setSelectedCaseId(null)}
      />
    </div>
  );
}
