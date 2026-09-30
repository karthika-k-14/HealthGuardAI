import React, { useEffect, useState, useMemo } from 'react';
import toast from 'react-hot-toast';
import { Users, UserPlus, Search, Filter, Trash2, RefreshCw, CheckCircle, ShieldAlert, MapPin, Calendar, Check } from 'lucide-react';
import {
  fetchCitizensList,
  fetchAshaWorkersList,
  fetchAssignments,
  assignCitizen,
  reassignCitizen,
  removeAssignment,
} from '../../api/citizenAssignmentApi';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import { SkeletonGrid } from '../../components/common/Skeleton';
import { useAuth } from '../../contexts/AuthContext';
import { ROLES } from '../../constants/roles';

export default function CitizenAssignmentManagement() {
  const { role: userRole } = useAuth();
  const [citizens, setCitizens] = useState([]);
  const [ashaWorkers, setAshaWorkers] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [villageFilter, setVillageFilter] = useState('All');
  const [ashaFilter, setAshaFilter] = useState('All');

  // Modals
  const [selectedCitizenToAssign, setSelectedCitizenToAssign] = useState(null);
  const [selectedAssignmentToReassign, setSelectedAssignmentToReassign] = useState(null);
  const [selectedAshaWorkerId, setSelectedAshaWorkerId] = useState('');

  const isAssignmentAllowed = userRole === ROLES.ADMIN || userRole === ROLES.HEALTH_OFFICER;

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [cList, wList, aList] = await Promise.all([
        fetchCitizensList(),
        fetchAshaWorkersList(),
        fetchAssignments(),
      ]);
      setCitizens(cList || []);
      setAshaWorkers(wList || []);
      setAssignments(aList || []);
    } catch (e) {
      toast.error('Failed to load assignment data.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const villages = useMemo(() => {
    const set = new Set();
    citizens.forEach((c) => {
      if (c.village) set.add(c.village);
    });
    return ['All', ...Array.from(set)];
  }, [citizens]);

  const assignmentMap = useMemo(() => {
    const map = new Map();
    assignments.forEach((a) => {
      map.set(String(a.citizenId), a);
    });
    return map;
  }, [assignments]);

  const rows = useMemo(() => {
    return citizens.map((c) => {
      const assign = assignmentMap.get(String(c.id));
      return {
        citizen: c,
        assignment: assign || null,
        assignedAshaName: assign ? assign.ashaWorkerName : 'Unassigned',
        assignedAshaId: assign ? assign.ashaWorkerId : null,
        assignedAt: assign ? assign.assignedAt : null,
        status: assign ? (assign.status || 'ACTIVE') : 'UNASSIGNED',
      };
    });
  }, [citizens, assignmentMap]);

  const filteredRows = useMemo(() => {
    return rows.filter((r) => {
      const c = r.citizen;
      const q = search.trim().toLowerCase();

      const matchesSearch =
        !q ||
        (c.name || '').toLowerCase().includes(q) ||
        (c.village || '').toLowerCase().includes(q) ||
        (r.assignedAshaName || '').toLowerCase().includes(q);

      const matchesVillage = villageFilter === 'All' || c.village === villageFilter;

      const matchesAsha =
        ashaFilter === 'All' ||
        (ashaFilter === 'Unassigned' && !r.assignment) ||
        (r.assignedAshaId && String(r.assignedAshaId) === String(ashaFilter));

      return matchesSearch && matchesVillage && matchesAsha;
    });
  }, [rows, search, villageFilter, ashaFilter]);

  const handleAssignSubmit = async () => {
    if (!selectedCitizenToAssign || !selectedAshaWorkerId) {
      toast.error('Please select an ASHA worker.');
      return;
    }

    const worker = ashaWorkers.find((w) => String(w.id) === String(selectedAshaWorkerId));
    if (!worker) {
      toast.error('Invalid ASHA worker selection.');
      return;
    }

    try {
      await assignCitizen({
        citizenId: selectedCitizenToAssign.id,
        ashaWorkerId: worker.id,
        citizenName: selectedCitizenToAssign.name,
        ashaWorkerName: worker.name,
        village: selectedCitizenToAssign.village,
      });
      toast.success(`Assigned ${selectedCitizenToAssign.name} to ASHA Worker ${worker.name}`);
      setSelectedCitizenToAssign(null);
      setSelectedAshaWorkerId('');
      loadData();
    } catch (err) {
      if (err.status === 403 || err.message?.includes('403')) {
        toast.error('403 Forbidden: Only Admin and Health Officers can assign citizens.');
      } else {
        toast.error(err.message || 'Unable to complete assignment.');
      }
    }
  };

  const handleReassignSubmit = async () => {
    if (!selectedAssignmentToReassign || !selectedAshaWorkerId) {
      toast.error('Please select a new ASHA worker.');
      return;
    }

    const worker = ashaWorkers.find((w) => String(w.id) === String(selectedAshaWorkerId));
    if (!worker) {
      toast.error('Invalid ASHA worker selection.');
      return;
    }

    try {
      await reassignCitizen(selectedAssignmentToReassign.assignment.id, {
        ashaWorkerId: worker.id,
        ashaWorkerName: worker.name,
      });
      toast.success(`Reassigned to ASHA Worker ${worker.name}`);
      setSelectedAssignmentToReassign(null);
      setSelectedAshaWorkerId('');
      loadData();
    } catch (err) {
      if (err.status === 403 || err.message?.includes('403')) {
        toast.error('403 Forbidden: Only Admin and Health Officers can reassign citizens.');
      } else {
        toast.error(err.message || 'Unable to reassign citizen.');
      }
    }
  };

  const handleRemoveAssignment = async (assignmentId, citizenName) => {
    if (!window.confirm(`Are you sure you want to remove the assignment for ${citizenName}?`)) return;

    try {
      await removeAssignment(assignmentId);
      toast.success(`Assignment removed for ${citizenName}`);
      loadData();
    } catch (err) {
      if (err.status === 403 || err.message?.includes('403')) {
        toast.error('403 Forbidden: Only Admin and Health Officers can remove assignments.');
      } else {
        toast.error(err.message || 'Unable to remove assignment.');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-2xl font-semibold text-slate-900 dark:text-white">
            Citizen Assignment System
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Assign registered citizens to ASHA Workers by village area. Only Admin and Health Officers can manage assignments.
          </p>
        </div>
        {!isAssignmentAllowed && (
          <div className="flex items-center gap-2 rounded-xl bg-amber-500/10 px-3.5 py-2 text-xs font-semibold text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <ShieldAlert className="h-4 w-4" />
            Read-only mode (Only Admin & Health Officer can assign)
          </div>
        )}
      </div>

      {/* Dashboard Statistics (4 Required Metrics) */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="surface-card p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400">Total Citizens</p>
            <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{citizens.length}</p>
          </div>
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400">
            <Users className="h-5 w-5" />
          </span>
        </div>

        <div className="surface-card p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400">Total Assignments</p>
            <p className="mt-1 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {assignments.length}
            </p>
          </div>
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <CheckCircle className="h-5 w-5" />
          </span>
        </div>

        <div className="surface-card p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400">Assigned Citizens</p>
            <p className="mt-1 text-2xl font-bold text-brand-600 dark:text-brand-400">
              {rows.filter((r) => r.assignment).length}
            </p>
          </div>
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400">
            <UserPlus className="h-5 w-5" />
          </span>
        </div>

        <div className="surface-card p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400">Unassigned Citizens</p>
            <p className="mt-1 text-2xl font-bold text-amber-500">
              {rows.filter((r) => !r.assignment).length}
            </p>
          </div>
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
            <Filter className="h-5 w-5" />
          </span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search citizen name, village, or assigned ASHA worker…"
            className="input-field pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <select
            value={villageFilter}
            onChange={(e) => setVillageFilter(e.target.value)}
            className="input-field text-sm sm:w-44"
          >
            <option value="All">All Villages</option>
            {villages.filter((v) => v !== 'All').map((v) => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
          <select
            value={ashaFilter}
            onChange={(e) => setAshaFilter(e.target.value)}
            className="input-field text-sm sm:w-48"
          >
            <option value="All">All ASHA Workers</option>
            <option value="Unassigned">Unassigned Only</option>
            {ashaWorkers.map((w) => (
              <option key={w.id} value={w.id}>{w.name}</option>
            ))}
          </select>
        </div>
      </div>

      {isLoading && <SkeletonGrid count={6} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" />}

      {!isLoading && filteredRows.length === 0 && (
        <div className="surface-card p-10 text-center text-slate-500">
          <Users className="mx-auto h-8 w-8 text-slate-400" />
          <p className="mt-2 text-sm font-medium">No citizen assignments found matching your filter criteria.</p>
        </div>
      )}

      {/* Main Table */}
      {!isLoading && filteredRows.length > 0 && (
        <div className="surface-card overflow-x-auto p-0">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200/70 text-xs uppercase tracking-wide text-slate-400 dark:border-white/10">
              <tr>
                <th className="px-4 py-3">Citizen Name</th>
                <th className="px-4 py-3">Village</th>
                <th className="px-4 py-3">Assigned ASHA Worker</th>
                <th className="px-4 py-3">Assignment Date</th>
                <th className="px-4 py-3">Status</th>
                {isAssignmentAllowed && <th className="px-4 py-3 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/70 dark:divide-white/10">
              {filteredRows.map(({ citizen, assignment, assignedAshaName, assignedAt, status }) => (
                <tr key={citizen.id} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02]">
                  <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">
                    {citizen.name}
                    {citizen.phone && <p className="text-xs text-slate-400 font-normal">{citizen.phone}</p>}
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-slate-400" /> {citizen.village || '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-100">
                    {assignment ? (
                      <span className="inline-flex items-center gap-1.5 font-semibold text-brand-600 dark:text-brand-400">
                        <Users className="h-3.5 w-3.5" /> {assignedAshaName}
                      </span>
                    ) : (
                      <span className="text-slate-400 italic">Not Assigned</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500 dark:text-slate-400">
                    {assignedAt ? (
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        {new Date(assignedAt).toLocaleDateString()}
                      </span>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone={status === 'ACTIVE' ? 'brand' : 'neutral'}>
                      {status}
                    </Badge>
                  </td>

                  {isAssignmentAllowed && (
                    <td className="px-4 py-3 text-right">
                      {assignment ? (
                        <div className="inline-flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedAssignmentToReassign({ assignment, citizen });
                              setSelectedAshaWorkerId(assignment.ashaWorkerId || '');
                            }}
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-brand-600 hover:bg-brand-50 hover:border-brand-300 dark:border-white/10 dark:bg-white/5 dark:text-brand-400"
                          >
                            <RefreshCw className="h-3 w-3" /> Reassign
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveAssignment(assignment.id, citizen.name)}
                            className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-100 dark:border-rose-900/30 dark:bg-rose-950/20 dark:text-rose-400"
                          >
                            <Trash2 className="h-3 w-3" /> Remove
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedCitizenToAssign(citizen);
                            setSelectedAshaWorkerId('');
                          }}
                          className="inline-flex items-center gap-1 rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-brand-700 transition-all shadow-sm"
                        >
                          <UserPlus className="h-3.5 w-3.5" /> Assign ASHA
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Assign Modal */}
      <Modal
        open={!!selectedCitizenToAssign}
        onClose={() => setSelectedCitizenToAssign(null)}
        title={`Assign ASHA Worker to ${selectedCitizenToAssign?.name}`}
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Select an active ASHA Worker to take responsibility for home visits, maternal care, and child immunization for {selectedCitizenToAssign?.name} in {selectedCitizenToAssign?.village}.
          </p>

          <div>
            <label className="label-text">Select ASHA Worker</label>
            {ashaWorkers.length === 0 ? (
              <p className="text-xs text-amber-600 dark:text-amber-400 bg-amber-500/10 p-2.5 rounded-lg border border-amber-500/20">
                No active ASHA workers found. Please add an ASHA worker from <strong>User Management</strong> or ensure community services are active.
              </p>
            ) : (
              <select
                value={selectedAshaWorkerId}
                onChange={(e) => setSelectedAshaWorkerId(e.target.value)}
                className="input-field text-sm"
              >
                <option value="">-- Choose ASHA Worker --</option>
                {ashaWorkers.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name} ({w.village || w.district || 'Assigned Area'})
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setSelectedCitizenToAssign(null)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleAssignSubmit} disabled={ashaWorkers.length === 0}>
              <Check className="h-4 w-4" /> Confirm Assignment
            </Button>
          </div>
        </div>
      </Modal>

      {/* Reassign Modal */}
      <Modal
        open={!!selectedAssignmentToReassign}
        onClose={() => setSelectedAssignmentToReassign(null)}
        title={`Reassign ASHA Worker for ${selectedAssignmentToReassign?.citizen?.name}`}
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Currently assigned to: <strong className="text-slate-800 dark:text-white">{selectedAssignmentToReassign?.assignment?.ashaWorkerName}</strong>. Choose a new ASHA worker to transfer responsibility.
          </p>

          <div>
            <label className="label-text">New ASHA Worker</label>
            {ashaWorkers.length === 0 ? (
              <p className="text-xs text-amber-600 dark:text-amber-400 bg-amber-500/10 p-2.5 rounded-lg border border-amber-500/20">
                No active ASHA workers found.
              </p>
            ) : (
              <select
                value={selectedAshaWorkerId}
                onChange={(e) => setSelectedAshaWorkerId(e.target.value)}
                className="input-field text-sm"
              >
                <option value="">-- Choose New ASHA Worker --</option>
                {ashaWorkers.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name} ({w.village || w.district || 'Assigned Area'})
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setSelectedAssignmentToReassign(null)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleReassignSubmit} disabled={ashaWorkers.length === 0}>
              <RefreshCw className="h-4 w-4" /> Confirm Reassignment
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
