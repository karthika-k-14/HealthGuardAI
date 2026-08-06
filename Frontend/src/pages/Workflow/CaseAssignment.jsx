import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { UserCheck, Search, Filter } from 'lucide-react';
import { getAllWorkflows } from '../../api/workflowApi';
import { Spinner } from '../../components/common/Loader';
import CaseAssignmentModal from '../../components/workflow/CaseAssignmentModal';

export default function CaseAssignment() {
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCase, setSelectedCase] = useState(null);
  const [search, setSearch] = useState('');

  const loadWorkflows = async () => {
    setLoading(true);
    try {
      const data = await getAllWorkflows();
      setWorkflows(data || []);
    } catch {
      toast.error('Failed to load workflow cases.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWorkflows();
  }, []);

  const filtered = workflows.filter(
    (w) =>
      !search ||
      w.title?.toLowerCase().includes(search.toLowerCase()) ||
      w.citizenName?.toLowerCase().includes(search.toLowerCase()) ||
      w.assignedTo?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-slate-900 dark:text-white">Case Assignment</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Assign and reassign workflow cases to healthcare workers, officers, or facilities.
        </p>
      </div>

      <div className="surface-card p-4 space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search cases to assign..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 py-2 text-xs text-slate-900 focus:border-brand-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center p-8">
            <Spinner size={24} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">No workflow cases available for assignment.</div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((w) => (
              <div key={w.id} className="surface-card p-4 space-y-2 border border-slate-100 dark:border-slate-800">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-xs">{w.title}</h3>
                    <p className="text-[10px] text-slate-400">Case #{w.caseNumber || w.id}</p>
                  </div>
                  <span className="rounded-full bg-brand-500/10 px-2 py-0.5 text-[10px] font-bold text-brand-600 dark:text-brand-400">
                    {w.status}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Current Assignee: <strong className="text-slate-700 dark:text-slate-200">{w.assignedTo || 'Unassigned'}</strong>
                </p>
                {w.facilityName && (
                  <p className="text-xs text-slate-400">Facility: {w.facilityName}</p>
                )}
                <button
                  type="button"
                  onClick={() => setSelectedCase(w)}
                  className="w-full mt-2 flex items-center justify-center gap-1.5 rounded-lg bg-brand-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-600 transition-colors"
                >
                  <UserCheck className="h-3.5 w-3.5" /> Reassign / Assign Case
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <CaseAssignmentModal
        workflowCase={selectedCase}
        isOpen={Boolean(selectedCase)}
        onClose={() => setSelectedCase(null)}
        onAssigned={loadWorkflows}
      />
    </div>
  );
}
