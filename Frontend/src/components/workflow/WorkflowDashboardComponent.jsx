import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import {
  Workflow,
  ClipboardList,
  CheckCircle2,
  Clock,
  UserCheck,
  History,
  GitPullRequest,
  Search,
  Plus,
  Filter,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';
import {
  getAllWorkflows,
  getPendingCases,
  getCompletedCases,
  createWorkflow,
  updateWorkflowStatus,
} from '../../api/workflowApi';
import { Spinner } from '../common/Loader';
import Button from '../common/Button';
import CaseAssignmentModal from './CaseAssignmentModal';
import WorkflowHistoryModal from './WorkflowHistoryModal';
import ReferralTrackerModal from './ReferralTrackerModal';

export default function WorkflowDashboardComponent() {
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'pending' | 'completed'
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('ALL');

  // Modals state
  const [assigningCase, setAssigningCase] = useState(null);
  const [historyCaseId, setHistoryCaseId] = useState(null);
  const [isReferralTrackerOpen, setIsReferralTrackerOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // New Workflow form state
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newCategory, setNewCategory] = useState('General Health');
  const [newCitizenName, setNewCitizenName] = useState('');
  const [newPriority, setNewPriority] = useState('NORMAL');
  const [newAssignedTo, setNewAssignedTo] = useState('');
  const [newFacilityName, setNewFacilityName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const fetchWorkflows = async () => {
    setLoading(true);
    try {
      let data = [];
      if (activeTab === 'pending') {
        data = await getPendingCases();
      } else if (activeTab === 'completed') {
        data = await getCompletedCases();
      } else {
        data = await getAllWorkflows();
      }
      setWorkflows(data || []);
    } catch {
      toast.error('Could not fetch workflow cases from backend.');
      setWorkflows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkflows();
  }, [activeTab]);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateWorkflowStatus(id, {
        status: newStatus,
        notes: `Status updated to ${newStatus}`,
      });
      toast.success(`Workflow status updated to ${newStatus}`);
      fetchWorkflows();
    } catch {
      toast.error('Failed to update workflow status.');
    }
  };

  const handleCreateWorkflow = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      toast.error('Title is required');
      return;
    }

    setIsCreating(true);
    try {
      await createWorkflow({
        title: newTitle,
        description: newDescription,
        category: newCategory,
        citizenName: newCitizenName,
        priority: newPriority,
        assignedTo: newAssignedTo,
        facilityName: newFacilityName,
      });
      toast.success('Workflow case created successfully!');
      setIsCreateModalOpen(false);
      // Reset form
      setNewTitle('');
      setNewDescription('');
      setNewCitizenName('');
      setNewAssignedTo('');
      setNewFacilityName('');
      fetchWorkflows();
    } catch {
      toast.error('Could not create workflow case.');
    } finally {
      setIsCreating(false);
    }
  };

  // Filter workflows locally by search query and priority
  const filteredWorkflows = workflows.filter((w) => {
    const matchesSearch =
      !searchQuery ||
      w.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.caseNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.citizenName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.assignedTo?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesPriority =
      priorityFilter === 'ALL' || w.priority === priorityFilter;

    return matchesSearch && matchesPriority;
  });

  const totalCount = workflows.length;
  const pendingCount = workflows.filter((w) => w.status !== 'COMPLETED' && w.status !== 'CANCELLED').length;
  const completedCount = workflows.filter((w) => w.status === 'COMPLETED').length;
  const highPriorityCount = workflows.filter((w) => w.priority === 'HIGH' || w.priority === 'CRITICAL').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-slate-900 dark:text-white">
            Workflow Dashboard & Case Management
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Track workflow cases, assignments, history timeline, and referrals.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            onClick={() => setIsReferralTrackerOpen(true)}
            className="text-xs"
          >
            <GitPullRequest className="h-4 w-4" /> Track Referral
          </Button>
          <Button
            variant="primary"
            onClick={() => setIsCreateModalOpen(true)}
            className="text-xs"
          >
            <Plus className="h-4 w-4" /> New Workflow Case
          </Button>
        </div>
      </div>

      {/* Metrics Bar */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="surface-card p-4 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400">
            <Workflow className="h-5 w-5" />
          </span>
          <div>
            <p className="font-display text-xl font-bold text-slate-900 dark:text-white">{totalCount}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Total Workflows</p>
          </div>
        </div>

        <div className="surface-card p-4 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <Clock className="h-5 w-5" />
          </span>
          <div>
            <p className="font-display text-xl font-bold text-slate-900 dark:text-white">{pendingCount}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Pending / Active</p>
          </div>
        </div>

        <div className="surface-card p-4 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-5 w-5" />
          </span>
          <div>
            <p className="font-display text-xl font-bold text-slate-900 dark:text-white">{completedCount}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Completed Cases</p>
          </div>
        </div>

        <div className="surface-card p-4 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
            <AlertTriangle className="h-5 w-5" />
          </span>
          <div>
            <p className="font-display text-xl font-bold text-slate-900 dark:text-white">{highPriorityCount}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">High / Urgent Priority</p>
          </div>
        </div>
      </div>

      {/* Tabs & Search Filter */}
      <div className="surface-card p-4 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3 dark:border-slate-800">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                activeTab === 'all'
                  ? 'bg-brand-500 text-white'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
              }`}
            >
              All Workflows ({totalCount})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('pending')}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                activeTab === 'pending'
                  ? 'bg-brand-500 text-white'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
              }`}
            >
              Pending Cases ({pendingCount})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('completed')}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                activeTab === 'completed'
                  ? 'bg-brand-500 text-white'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
              }`}
            >
              Completed Cases ({completedCount})
            </button>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search by case #, title, assignee..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-48 sm:w-64 rounded-lg border border-slate-200 bg-white pl-8 pr-3 py-1.5 text-xs text-slate-900 focus:border-brand-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white"
              />
            </div>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900 focus:border-brand-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white"
            >
              <option value="ALL">All Priorities</option>
              <option value="NORMAL">Normal</option>
              <option value="HIGH">High</option>
              <option value="CRITICAL">Critical</option>
            </select>
          </div>
        </div>

        {/* Workflow List Table / Grid */}
        {loading ? (
          <div className="flex justify-center p-12">
            <Spinner size={28} />
          </div>
        ) : filteredWorkflows.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-10 text-center">
            <Workflow className="h-8 w-8 text-slate-300 dark:text-white/20 mb-2" />
            <p className="text-sm font-medium text-slate-600 dark:text-slate-300">No workflow cases found</p>
            <p className="text-xs text-slate-400 mt-1">Try clearing filters or create a new workflow case.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredWorkflows.map((w) => (
              <div
                key={w.id}
                className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors rounded-lg px-2"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-mono font-semibold text-brand-600 dark:text-brand-400">
                      #{w.caseNumber || w.id}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">{w.title}</h3>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        w.priority === 'HIGH' || w.priority === 'CRITICAL'
                          ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                          : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                      }`}
                    >
                      {w.priority || 'NORMAL'}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        w.status === 'COMPLETED'
                          ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                          : w.status === 'CANCELLED'
                          ? 'bg-slate-500/15 text-slate-600 dark:text-slate-400'
                          : 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                      }`}
                    >
                      {w.status || 'NEW'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {w.description || 'No description provided.'}
                  </p>

                  <div className="flex items-center gap-4 text-[11px] text-slate-400 pt-1 flex-wrap">
                    {w.citizenName && <span>Citizen: <strong className="text-slate-600 dark:text-slate-300">{w.citizenName}</strong></span>}
                    <span>Assignee: <strong className="text-slate-600 dark:text-slate-300">{w.assignedTo || 'Unassigned'}</strong></span>
                    {w.facilityName && <span>Facility: <strong className="text-slate-600 dark:text-slate-300">{w.facilityName}</strong></span>}
                    <span>Created: {w.createdAt ? new Date(w.createdAt).toLocaleDateString() : 'N/A'}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <select
                    value={w.status || 'NEW'}
                    onChange={(e) => handleStatusChange(w.id, e.target.value)}
                    className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-700 focus:border-brand-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
                  >
                    <option value="NEW">NEW</option>
                    <option value="IN_PROGRESS">IN_PROGRESS</option>
                    <option value="UNDER_REVIEW">UNDER_REVIEW</option>
                    <option value="COMPLETED">COMPLETED</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>

                  <button
                    type="button"
                    onClick={() => setAssigningCase(w)}
                    title="Assign Case"
                    className="flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    <UserCheck className="h-3.5 w-3.5 text-brand-500" /> Assign
                  </button>

                  <button
                    type="button"
                    onClick={() => setHistoryCaseId(w.id)}
                    title="View History Timeline"
                    className="flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    <History className="h-3.5 w-3.5 text-amber-500" /> History
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <CaseAssignmentModal
        workflowCase={assigningCase}
        isOpen={Boolean(assigningCase)}
        onClose={() => setAssigningCase(null)}
        onAssigned={fetchWorkflows}
      />

      <WorkflowHistoryModal
        workflowId={historyCaseId}
        isOpen={Boolean(historyCaseId)}
        onClose={() => setHistoryCaseId(null)}
      />

      <ReferralTrackerModal
        isOpen={isReferralTrackerOpen}
        onClose={() => setIsReferralTrackerOpen(false)}
      />

      {/* Create Workflow Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="surface-card w-full max-w-md p-6 space-y-4 shadow-xl">
            <h3 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-200 pb-2 dark:border-slate-800">
              Create Workflow Case
            </h3>
            <form onSubmit={handleCreateWorkflow} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dengue Surveillance - Ward 3"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-brand-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Citizen Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Anitha Kumar"
                  value={newCitizenName}
                  onChange={(e) => setNewCitizenName(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-brand-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Category</label>
                  <input
                    type="text"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-brand-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Priority</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-brand-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                  >
                    <option value="NORMAL">NORMAL</option>
                    <option value="HIGH">HIGH</option>
                    <option value="CRITICAL">CRITICAL</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Assigned To</label>
                <input
                  type="text"
                  placeholder="e.g. Dr. Rajesh / ASHA Meena"
                  value={newAssignedTo}
                  onChange={(e) => setNewAssignedTo(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-brand-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Facility Name</label>
                <input
                  type="text"
                  placeholder="e.g. Central PHC"
                  value={newFacilityName}
                  onChange={(e) => setNewFacilityName(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-brand-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Detailed case description..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-brand-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <Button type="submit" variant="primary" isLoading={isCreating} className="text-xs">
                  Create Case
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
