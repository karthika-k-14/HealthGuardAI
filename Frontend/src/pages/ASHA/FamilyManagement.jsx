import React, { useEffect, useState, useMemo } from 'react';
import toast from 'react-hot-toast';
import { Search, Users, Phone, Home, Heart, Baby, ShieldAlert, Eye, Trash2, Pencil } from 'lucide-react';
import { fetchFamilies, fetchFamilyMetrics, deleteFamily, deleteFamilyMember, updateFamilyMember } from '../../api/ashaFamilyApi';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import { SkeletonGrid } from '../../components/common/Skeleton';

const RISK_TONE = { HIGH_RISK: 'rose', High: 'rose', MODERATE: 'amber', Medium: 'amber', NORMAL: 'brand', Low: 'brand' };

// Sub-component for Family Member Edit Modal
function FamilyMemberModal({ open, onClose, onSubmit, initialValues, title }) {
  const [name, setName] = useState('');
  const [relationship, setRelationship] = useState('SPOUSE');
  const [age, setAge] = useState(25);
  const [gender, setGender] = useState('Female');
  const [isPregnant, setIsPregnant] = useState(false);
  const [isChildMember, setIsChildMember] = useState(false);
  const [vaccinationStatus, setVaccinationStatus] = useState('UP_TO_DATE');
  const [healthConditions, setHealthConditions] = useState('None');
  const [riskStatus, setRiskStatus] = useState('NORMAL');

  useEffect(() => {
    if (open) {
      setName(initialValues?.name || '');
      setRelationship(initialValues?.relationship || 'SPOUSE');
      setAge(initialValues?.age ?? 25);
      setGender(initialValues?.gender || 'Female');
      setIsPregnant(Boolean(initialValues?.isPregnant));
      setIsChildMember(Boolean(initialValues?.isChildMember));
      setVaccinationStatus(initialValues?.vaccinationStatus || 'UP_TO_DATE');
      setHealthConditions(initialValues?.healthConditions || 'None');
      setRiskStatus(initialValues?.riskStatus || 'NORMAL');
    }
  }, [open, initialValues]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Please enter family member name.');
      return;
    }
    const parsedAge = Number(age);
    if (isNaN(parsedAge) || parsedAge < 0 || parsedAge > 125) {
      toast.error('Please enter a valid age (0 - 125).');
      return;
    }

    onSubmit({
      name: name.trim(),
      relationship,
      age: parsedAge,
      gender,
      isPregnant,
      isChildMember: isChildMember || parsedAge <= 5,
      vaccinationStatus,
      healthConditions: healthConditions?.trim() || 'None',
      riskStatus,
    });
  };

  return (
    <Modal open={open} onClose={onClose} title={title}>
      <form onSubmit={handleSubmit} className="space-y-3 text-sm">
        <div>
          <label className="label-text">Member Name</label>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Full name"
            className="input-field text-sm"
            autoFocus
          />
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="label-text">Relationship</label>
            <select value={relationship} onChange={(e) => setRelationship(e.target.value)} className="input-field text-sm">
              <option value="HEAD">Head of Household</option>
              <option value="SPOUSE">Spouse</option>
              <option value="CHILD">Child</option>
              <option value="PARENT">Parent</option>
              <option value="SIBLING">Sibling</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
          <div>
            <label className="label-text">Age</label>
            <input
              type="number"
              required
              min="0"
              max="125"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="input-field text-sm"
            />
          </div>
          <div>
            <label className="label-text">Gender</label>
            <select value={gender} onChange={(e) => setGender(e.target.value)} className="input-field text-sm">
              <option value="Female">Female</option>
              <option value="Male">Male</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        <div className="space-y-2 rounded-xl bg-slate-50 p-3 dark:bg-white/5">
          <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-800 dark:text-slate-100">
            <input
              type="checkbox"
              checked={isPregnant}
              onChange={(e) => setIsPregnant(e.target.checked)}
              className="rounded border-slate-300 text-rose-600 focus:ring-rose-500 h-4 w-4"
            />
            Pregnant Status (Track in Maternal Care Module)
          </label>

          <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-800 dark:text-slate-100">
            <input
              type="checkbox"
              checked={isChildMember || Number(age) <= 5}
              onChange={(e) => setIsChildMember(e.target.checked)}
              className="rounded border-slate-300 text-brand-600 focus:ring-brand-500 h-4 w-4"
            />
            Child Member under 5 (Track in Child Health Module)
          </label>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label-text">Vaccination Status</label>
            <select value={vaccinationStatus} onChange={(e) => setVaccinationStatus(e.target.value)} className="input-field text-sm">
              <option value="UP_TO_DATE">Up to date</option>
              <option value="PARTIAL">Partially Vaccinated</option>
              <option value="MISSED">Missed Doses</option>
              <option value="PENDING">Pending</option>
            </select>
          </div>
          <div>
            <label className="label-text">Risk Status</label>
            <select value={riskStatus} onChange={(e) => setRiskStatus(e.target.value)} className="input-field text-sm">
              <option value="NORMAL">Normal</option>
              <option value="MODERATE">Moderate Risk</option>
              <option value="HIGH_RISK">High Risk</option>
            </select>
          </div>
        </div>

        <div>
          <label className="label-text">Health Conditions / Notes</label>
          <input
            value={healthConditions}
            onChange={(e) => setHealthConditions(e.target.value)}
            placeholder="e.g. Hypertension, Asthma, None"
            className="input-field text-sm"
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="primary">Save Member</Button>
        </div>
      </form>
    </Modal>
  );
}

export default function FamilyManagement() {
  const [families, setFamilies] = useState([]);
  const [metrics, setMetrics] = useState({
    totalFamilies: 0,
    totalFamilyMembers: 0,
    pregnantWomen: 0,
    childrenUnder5: 0,
    highRiskCases: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedFamily, setSelectedFamily] = useState(null);
  const [editingMember, setEditingMember] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [fList, mData] = await Promise.all([fetchFamilies(), fetchFamilyMetrics()]);
      setFamilies(fList || []);
      setMetrics(mData || {
        totalFamilies: 0,
        totalFamilyMembers: 0,
        pregnantWomen: 0,
        childrenUnder5: 0,
        highRiskCases: 0,
      });
    } catch (e) {
      toast.error('Failed to load family records.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDeleteFamily = async (familyId, headName) => {
    if (!window.confirm(`Are you sure you want to delete the family record for "${headName}"?`)) return;
    try {
      await deleteFamily(familyId);
      toast.success(`Deleted family record for ${headName}`);
      if (selectedFamily?.id === familyId) setSelectedFamily(null);
      loadData();
    } catch (e) {
      toast.error('Failed to delete family record.');
    }
  };

  const handleDeleteMember = async (memberId, memberName) => {
    if (!window.confirm(`Are you sure you want to remove ${memberName} from this family?`)) return;
    try {
      await deleteFamilyMember(memberId);
      toast.success(`Removed ${memberName} from family`);
      setSelectedFamily((prev) =>
        prev
          ? {
              ...prev,
              members: (prev.members || []).filter((m) => String(m.id) !== String(memberId)),
            }
          : null
      );
      loadData();
    } catch (e) {
      toast.error('Failed to remove member.');
    }
  };

  const handleSaveMember = async (memberData) => {
    if (!editingMember) return;
    try {
      const updated = await updateFamilyMember(editingMember.id, memberData);
      toast.success(`Updated ${memberData.name} successfully`);

      const updatedRecord = {
        ...editingMember,
        ...memberData,
        ...(updated && typeof updated === 'object' ? updated : {}),
      };

      setSelectedFamily((prev) =>
        prev
          ? {
              ...prev,
              members: (prev.members || []).map((m) =>
                String(m.id) === String(editingMember.id) ? { ...m, ...updatedRecord } : m
              ),
            }
          : null
      );

      setFamilies((prevFamilies) =>
        prevFamilies.map((f) => {
          if (String(f.id) === String(selectedFamily?.id)) {
            return {
              ...f,
              members: (f.members || []).map((m) =>
                String(m.id) === String(editingMember.id) ? { ...m, ...updatedRecord } : m
              ),
            };
          }
          return f;
        })
      );

      setShowEditModal(false);
      setEditingMember(null);
      loadData();
    } catch (e) {
      toast.error('Failed to update family member.');
    }
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return families;
    return families.filter(
      (f) =>
        (f.headOfFamily || f.headName || '').toLowerCase().includes(q) ||
        (f.village || f.address || '').toLowerCase().includes(q) ||
        (f.houseNumber || '').toLowerCase().includes(q)
    );
  }, [families, search]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-slate-900 dark:text-white">Family Management</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Household survey &amp; family registration records for assigned citizens in your village area.
        </p>
      </div>

      {/* 5 Required Dashboard Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="surface-card p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400">Total Families</p>
            <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{metrics.totalFamilies}</p>
          </div>
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400">
            <Home className="h-5 w-5" />
          </span>
        </div>

        <div className="surface-card p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400">Total Members</p>
            <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{metrics.totalFamilyMembers}</p>
          </div>
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <Users className="h-5 w-5" />
          </span>
        </div>

        <div className="surface-card p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400">Pregnant Women</p>
            <p className="mt-1 text-2xl font-bold text-rose-600 dark:text-rose-400">{metrics.pregnantWomen}</p>
          </div>
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
            <Heart className="h-5 w-5 fill-rose-500" />
          </span>
        </div>

        <div className="surface-card p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400">Children Under 5</p>
            <p className="mt-1 text-2xl font-bold text-brand-600 dark:text-brand-400">{metrics.childrenUnder5}</p>
          </div>
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400">
            <Baby className="h-5 w-5" />
          </span>
        </div>

        <div className="surface-card p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400">High Risk Cases</p>
            <p className="mt-1 text-2xl font-bold text-amber-600 dark:text-amber-400">{metrics.highRiskCases}</p>
          </div>
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <ShieldAlert className="h-5 w-5" />
          </span>
        </div>
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by Head of Family, house number, or village…"
          className="input-field pl-10"
        />
      </div>

      {isLoading && <SkeletonGrid count={6} className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3" />}

      {!isLoading && filtered.length === 0 && (
        <div className="surface-card flex flex-col items-center gap-2 p-10 text-center text-sm text-slate-500">
          <Home className="h-8 w-8 text-slate-400" />
          No family records found. Families are registered by ASHA workers during home visits on the Assigned Citizens page.
        </div>
      )}

      {!isLoading && filtered.length > 0 && (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((f) => {
            const memberCount = (f.members || []).length;
            const hasPregnant = (f.members || []).some((m) => m.isPregnant);

            return (
              <div key={f.id} className="surface-card flex flex-col justify-between gap-3 p-5">
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">{f.headOfFamily || f.headName}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{memberCount} Members Registered</p>
                    </div>
                    {hasPregnant && <Badge tone="rose">Pregnant Member</Badge>}
                  </div>

                  <div className="space-y-1 text-xs text-slate-500 dark:text-slate-400">
                    <p className="flex items-center gap-1.5">
                      <Home className="h-3.5 w-3.5 shrink-0 text-slate-400" /> {f.houseNumber || 'H.No 12/A'}, {f.village}
                    </p>
                    <p className="flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5 shrink-0 text-slate-400" /> {f.contactPhone || f.contact || '—'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-white/10">
                  <button
                    type="button"
                    onClick={() => handleDeleteFamily(f.id, f.headOfFamily || f.headName)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-700 dark:text-rose-400"
                    title="Delete Family Record"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Delete
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedFamily(f)}
                    className="inline-flex items-center gap-1 text-xs font-bold text-brand-600 hover:text-brand-700 dark:text-brand-400"
                  >
                    <Eye className="h-3.5 w-3.5" /> View Family Details
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Details Modal */}
      <Modal open={!!selectedFamily} onClose={() => setSelectedFamily(null)} title={`Family Record - ${selectedFamily?.headOfFamily || selectedFamily?.headName}`}>
        {selectedFamily && (
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-4 dark:bg-white/5 text-xs">
              <div>
                <p className="text-slate-400">Head of Household</p>
                <p className="font-bold text-slate-800 dark:text-slate-100">{selectedFamily.headOfFamily || selectedFamily.headName}</p>
              </div>
              <div>
                <p className="text-slate-400">Address / Village</p>
                <p className="font-semibold text-slate-800 dark:text-slate-100">{selectedFamily.houseNumber}, {selectedFamily.village}</p>
              </div>
            </div>

            <div>
              <p className="mb-2 font-bold text-slate-900 dark:text-white">Registered Family Members ({(selectedFamily.members || []).length})</p>
              {(selectedFamily.members || []).length === 0 ? (
                <p className="text-xs text-slate-400 italic">No family members registered yet.</p>
              ) : (
                <div className="space-y-2">
                  {(selectedFamily.members || []).map((m) => (
                    <div key={m.id} className="rounded-xl border border-slate-200/80 p-3 text-xs dark:border-white/10">
                      <div className="flex items-center justify-between">
                        <p className="font-bold text-slate-800 dark:text-slate-100">{m.name} ({m.relationship} · {m.age} yrs)</p>
                        <div className="flex items-center gap-2">
                          <Badge tone={RISK_TONE[m.riskStatus] || 'neutral'}>{m.riskStatus || 'NORMAL'}</Badge>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingMember(m);
                              setShowEditModal(true);
                            }}
                            className="rounded p-1 text-brand-600 hover:bg-brand-50 dark:text-brand-400 dark:hover:bg-brand-950/30"
                            title="Edit Member"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteMember(m.id, m.name)}
                            className="rounded p-1 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                            title="Remove Member"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                      <p className="mt-1 text-slate-500">Vaccine: {m.vaccinationStatus} {m.isPregnant ? '· Pregnant' : ''} {m.isChildMember ? '· Child < 5' : ''}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Edit Family Member Sub-Component Modal */}
      <FamilyMemberModal
        open={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingMember(null);
        }}
        onSubmit={handleSaveMember}
        initialValues={editingMember}
        title={editingMember ? `Edit Family Member - ${editingMember.name}` : 'Edit Family Member'}
      />
    </div>
  );
}
