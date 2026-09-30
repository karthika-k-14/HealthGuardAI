import React, { useEffect, useState, useMemo } from 'react';
import toast from 'react-hot-toast';
import { Search, Users, MapPin, Phone, Eye, Home, UserPlus, CalendarPlus, Pencil, Trash2 } from 'lucide-react';
import { fetchAssignedCitizens, fetchAssignedCitizenDetails } from '../../api/ashaAssignedApi';
import { fetchFamilyByCitizen, createFamily, addFamilyMember, updateFamilyMember, deleteFamilyMember } from '../../api/ashaFamilyApi';
import { scheduleHomeVisit } from '../../api/ashaVisitApi';

import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';
import RetryBlock from '../../components/common/RetryBlock';
import { SkeletonGrid } from '../../components/common/Skeleton';

const RISK_TONE = { NORMAL: 'brand', MODERATE: 'amber', HIGH_RISK: 'rose' };
const VISIT_TYPES = [
  'Routine Checkup',
  'Pregnancy Follow-up',
  'Child Health',
  'Immunization Follow-up',
  'Elderly Care',
  'Disease Surveillance',
];

// Sub-component for Family Member Modal so typing never loses focus
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
      setAge(initialValues?.age || 25);
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

// Sub-component for Create Family Modal so typing never loses focus
function CreateFamilyModal({ open, onClose, onSubmit, citizen }) {
  const [headOfFamily, setHeadOfFamily] = useState('');
  const [houseNumber, setHouseNumber] = useState('H.No 12/A');
  const [village, setVillage] = useState('Coimbatore Village');
  const [contactPhone, setContactPhone] = useState('—');

  useEffect(() => {
    if (open && citizen) {
      const citizenName = citizen.name || citizen.citizenName || citizen.fullName || citizen.email || 'Citizen';
      setHeadOfFamily(citizenName);
      setHouseNumber('H.No 12/A');
      setVillage(citizen.address || citizen.villageName || 'Coimbatore Village');
      setContactPhone(citizen.phone && citizen.phone !== '—' ? citizen.phone : (citizen.mobileNumber || citizen.phoneNumber || '—'));
    }
  }, [open, citizen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!headOfFamily.trim()) {
      toast.error('Please enter head of household name.');
      return;
    }
    onSubmit({
      headOfFamily,
      houseNumber,
      village,
      contactPhone,
    });
  };

  const citizenName = citizen?.name || citizen?.citizenName || citizen?.fullName || citizen?.email || 'Citizen';

  return (
    <Modal open={open} onClose={onClose} title={`Create Family Record - ${citizenName}`}>
      <form onSubmit={handleSubmit} className="space-y-3 text-sm">
        <div>
          <label className="label-text">Head of Household</label>
          <input
            required
            value={headOfFamily}
            onChange={(e) => setHeadOfFamily(e.target.value)}
            className="input-field text-sm"
            autoFocus
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="label-text">House Number</label>
            <input
              required
              value={houseNumber}
              onChange={(e) => setHouseNumber(e.target.value)}
              className="input-field text-sm"
            />
          </div>
          <div>
            <label className="label-text">Village</label>
            <input
              required
              value={village}
              onChange={(e) => setVillage(e.target.value)}
              className="input-field text-sm"
            />
          </div>
        </div>
        <div>
          <label className="label-text">Contact Phone</label>
          <input
            value={contactPhone}
            onChange={(e) => setContactPhone(e.target.value)}
            className="input-field text-sm"
          />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="primary">Create Family Record</Button>
        </div>
      </form>
    </Modal>
  );
}

export default function AssignedCitizens() {
  const [citizens, setCitizens] = useState([]);
  const [familyMap, setFamilyMap] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [search, setSearch] = useState('');

  // Citizen Details Modal
  const [selectedId, setSelectedId] = useState(null);
  const [detail, setDetail] = useState(null);

  // Schedule Visit Modal
  const [selectedCitizenToVisit, setSelectedCitizenToVisit] = useState(null);
  const [visitType, setVisitType] = useState('Routine Checkup');
  const [visitDate, setVisitDate] = useState(new Date().toISOString().slice(0, 10));
  const [visitNotes, setVisitNotes] = useState('');

  // Family Management Modals
  const [activeFamilyCitizen, setActiveFamilyCitizen] = useState(null);
  const [activeFamilyRecord, setActiveFamilyRecord] = useState(null);
  const [showCreateFamilyModal, setShowCreateFamilyModal] = useState(false);

  // Member Modal
  const [editingMember, setEditingMember] = useState(null);
  const [showMemberModal, setShowMemberModal] = useState(false);

  const loadCitizens = async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const data = await fetchAssignedCitizens();
      setCitizens(data || []);

      const map = {};
      await Promise.all(
        (data || []).map(async (c) => {
          const fam = await fetchFamilyByCitizen(c.id);
          if (fam) map[String(c.id)] = fam;
        })
      );
      setFamilyMap(map);
    } catch {
      setLoadError("We couldn't load your assigned citizens. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCitizens();
  }, []);

  useEffect(() => {
    if (!selectedId) {
      setDetail(null);
      return;
    }
    const currentCitizen = citizens.find((c) => String(c.id) === String(selectedId));
    if (currentCitizen) {
      setDetail(currentCitizen);
    }
    fetchAssignedCitizenDetails(selectedId).then((data) => {
      if (data) {
        setDetail((prev) => {
          const merged = { ...(prev || currentCitizen || {}), ...data };
          const resolvedPhone =
            (data.phone && data.phone !== '—')
              ? data.phone
              : (currentCitizen?.phone && currentCitizen.phone !== '—'
                ? currentCitizen.phone
                : (data.mobileNumber || currentCitizen?.mobileNumber || data.phoneNumber || currentCitizen?.phoneNumber || '—'));
          return {
            ...merged,
            phone: resolvedPhone,
            mobileNumber: resolvedPhone,
            phoneNumber: resolvedPhone,
          };
        });
      }
    });
  }, [selectedId, citizens]);

  const q = search.trim().toLowerCase();
  const filtered = useMemo(() => {
    if (!q) return citizens;
    return citizens.filter((c) => {
      const nameStr = (c.name || c.citizenName || c.fullName || c.email || '').toLowerCase();
      const phoneStr = c.phone || c.phoneNumber || '';
      const addrStr = (c.address || c.villageName || c.village || '').toLowerCase();
      return nameStr.includes(q) || phoneStr.includes(q) || addrStr.includes(q);
    });
  }, [citizens, q]);

  // Schedule Visit Submit Handler
  const handleScheduleVisitSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCitizenToVisit) return;

    const citizenName = selectedCitizenToVisit.name || selectedCitizenToVisit.citizenName || 'Assigned Citizen';

    try {
      await scheduleHomeVisit({
        citizenId: selectedCitizenToVisit.id,
        citizenName,
        visitType,
        visitDate,
        notes: visitNotes,
      });

      toast.success(`Home visit scheduled for ${citizenName} on ${visitDate}`);
      setSelectedCitizenToVisit(null);
      setVisitNotes('');
    } catch (e) {
      toast.error('Failed to schedule visit.');
    }
  };

  const openFamilyModal = (citizen) => {
    setActiveFamilyCitizen(citizen);
    const existing = familyMap[String(citizen.id)];

    if (existing) {
      setActiveFamilyRecord(existing);
    } else {
      setShowCreateFamilyModal(true);
    }
  };

  const handleDeleteFamilyMember = async (memberId, memberName) => {
    if (!window.confirm(`Are you sure you want to remove ${memberName} from this family?`)) return;
    try {
      await deleteFamilyMember(memberId);
      toast.success(`Removed ${memberName} from family`);
      if (activeFamilyCitizen) {
        const updatedFam = await fetchFamilyByCitizen(activeFamilyCitizen.id);
        setActiveFamilyRecord(updatedFam);
        setFamilyMap((prev) => ({ ...prev, [String(activeFamilyCitizen.id)]: updatedFam }));
      }
    } catch (e) {
      toast.error('Failed to remove member.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-2xl font-semibold text-slate-900 dark:text-white">Assigned Citizens</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Citizens explicitly assigned to you by Admin / Health Officer. Schedule home visits, manage family records, and record health observations.
          </p>
        </div>
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search assigned citizens by name, phone, or village…"
          className="input-field pl-10"
        />
      </div>

      {isLoading && <SkeletonGrid count={6} className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3" />}
      {!isLoading && loadError && <RetryBlock message={loadError} onRetry={loadCitizens} />}

      {!isLoading && !loadError && filtered.length === 0 && (
        <EmptyState
          icon={Users}
          title="No assigned citizens"
          description="No citizens have been assigned to your profile yet."
        />
      )}

      {!isLoading && !loadError && filtered.length > 0 && (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c) => {
            const displayName = c.name || c.citizenName || c.fullName || c.email || 'Assigned Citizen';
            const risk = c.riskStatus || 'NORMAL';
            const fam = familyMap[String(c.id)];

            return (
              <div key={c.id} className="surface-card flex flex-col justify-between gap-4 p-5">
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-base font-bold text-slate-900 dark:text-white">{displayName}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {c.gender || '—'}{c.age ? ` · ${c.age} yrs` : ''}
                      </p>
                    </div>
                    <Badge tone={RISK_TONE[risk] || 'brand'}>{risk.replace('_', ' ')}</Badge>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-500 dark:text-slate-400">
                    <p className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400" /> {c.address || c.villageName || 'Assigned Village'}
                    </p>
                    <p className="flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5 shrink-0 text-slate-400" /> {c.phone && c.phone !== '—' ? c.phone : (c.mobileNumber || c.phoneNumber || 'Not provided')}
                    </p>
                    <p className="flex items-center gap-1.5">
                      <Home className="h-3.5 w-3.5 shrink-0 text-brand-500" />
                      Family Record: {fam ? <span className="font-semibold text-emerald-600 dark:text-emerald-400">{fam.members?.length || 0} Members</span> : <span className="text-amber-500 font-medium">Not Created</span>}
                    </p>
                  </div>
                </div>

                {/* 3 Requirement Action Controls */}
                <div className="grid grid-cols-3 gap-1.5 pt-2 border-t border-slate-200/60 dark:border-white/10">
                  <button
                    type="button"
                    onClick={() => setSelectedCitizenToVisit(c)}
                    className="inline-flex items-center justify-center gap-1 rounded-xl bg-brand-600 px-2 py-1.5 text-[11px] font-bold text-white hover:bg-brand-700 shadow-xs"
                  >
                    <CalendarPlus className="h-3.5 w-3.5" /> Visit
                  </button>

                  <button
                    type="button"
                    onClick={() => openFamilyModal(c)}
                    className="inline-flex items-center justify-center gap-1 rounded-xl border border-brand-200 bg-brand-50 px-2 py-1.5 text-[11px] font-semibold text-brand-700 hover:bg-brand-100 dark:border-brand-900/30 dark:bg-brand-950/20 dark:text-brand-300"
                  >
                    <Home className="h-3.5 w-3.5" /> Family
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedId(c.id)}
                    className="inline-flex items-center justify-center gap-1 rounded-xl border border-slate-200 bg-white px-2 py-1.5 text-[11px] font-semibold text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
                  >
                    <Eye className="h-3.5 w-3.5" /> Details
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Schedule Home Visit Modal (Requirement 2) */}
      <Modal
        open={!!selectedCitizenToVisit}
        onClose={() => setSelectedCitizenToVisit(null)}
        title={`Schedule Home Visit - ${selectedCitizenToVisit?.name || selectedCitizenToVisit?.citizenName || 'Citizen'}`}
      >
        <form onSubmit={handleScheduleVisitSubmit} className="space-y-3 text-sm">
          <div>
            <label className="label-text">Visit Type</label>
            <select
              value={visitType}
              onChange={(e) => setVisitType(e.target.value)}
              className="input-field text-sm"
            >
              {VISIT_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="label-text">Visit Date</label>
            <input
              type="date"
              required
              value={visitDate}
              onChange={(e) => setVisitDate(e.target.value)}
              className="input-field text-sm"
            />
          </div>

          <div>
            <label className="label-text">Visit Objectives &amp; Notes</label>
            <textarea
              rows={3}
              value={visitNotes}
              onChange={(e) => setVisitNotes(e.target.value)}
              placeholder="e.g. Conduct routine antenatal care checkup, review maternal nutrition…"
              className="input-field text-sm"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setSelectedCitizenToVisit(null)}>Cancel</Button>
            <Button type="submit" variant="primary">Confirm Schedule</Button>
          </div>
        </form>
      </Modal>

      {/* Family Management Modal */}
      <Modal
        open={!!activeFamilyRecord}
        onClose={() => setActiveFamilyRecord(null)}
        title={`Household & Family Record - ${activeFamilyCitizen?.name || activeFamilyCitizen?.citizenName || 'Citizen'}`}
      >
        {activeFamilyRecord && (
          <div className="space-y-5 text-sm">
            <div className="grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-4 dark:bg-white/5 text-xs">
              <div>
                <p className="text-slate-400">Head of Household</p>
                <p className="font-bold text-slate-800 dark:text-slate-100">{activeFamilyRecord.headOfFamily}</p>
              </div>
              <div>
                <p className="text-slate-400">House Number / Village</p>
                <p className="font-semibold text-slate-800 dark:text-slate-100">{activeFamilyRecord.houseNumber}, {activeFamilyRecord.village}</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="font-bold text-slate-900 dark:text-white">
                  Family Members ({(activeFamilyRecord.members || []).length})
                </p>
                <Button variant="primary" size="sm" onClick={() => { setEditingMember(null); setShowMemberModal(true); }}>
                  <UserPlus className="h-3.5 w-3.5" /> Add Member
                </Button>
              </div>

              <div className="space-y-2">
                {(activeFamilyRecord.members || []).map((m) => (
                  <div key={m.id} className="flex items-center justify-between gap-3 rounded-xl border border-slate-200/80 bg-white p-3 dark:border-white/10 dark:bg-white/5">
                    <div className="space-y-1 min-w-0">
                      <p className="font-bold text-slate-900 dark:text-white">{m.name} ({m.relationship} · {m.age} yrs)</p>
                      <p className="text-xs text-slate-500">Vaccine: {m.vaccinationStatus} {m.isPregnant ? '· Pregnant' : ''} {m.isChildMember ? '· Child < 5' : ''}</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingMember(m);
                          setShowMemberModal(true);
                        }}
                        className="rounded p-1 text-brand-600 hover:bg-brand-50 dark:text-brand-400 dark:hover:bg-brand-950/30"
                        title="Edit Member"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteFamilyMember(m.id, m.name)}
                        className="rounded p-1 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                        title="Remove Member"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Add / Edit Family Member Sub-Component Modal */}
      <FamilyMemberModal
        open={showMemberModal}
        onClose={() => {
          setShowMemberModal(false);
          setEditingMember(null);
        }}
        onSubmit={async (memberData) => {
          if (!activeFamilyRecord) return;
          try {
            if (editingMember) {
              await updateFamilyMember(editingMember.id, memberData);
              toast.success(`Updated ${memberData.name}`);
            } else {
              await addFamilyMember(activeFamilyRecord.id, memberData);
              toast.success(`Added ${memberData.name} to family`);
            }
            const updatedFam = await fetchFamilyByCitizen(activeFamilyCitizen.id);
            setActiveFamilyRecord(updatedFam);
            setFamilyMap((prev) => ({ ...prev, [String(activeFamilyCitizen.id)]: updatedFam }));
            setShowMemberModal(false);
            setEditingMember(null);
          } catch (e) {
            toast.error('Failed to save family member.');
          }
        }}
        initialValues={editingMember}
        title={editingMember ? `Edit Family Member - ${editingMember.name}` : 'Add Family Member'}
      />

      {/* Create Family Record Sub-Component Modal */}
      <CreateFamilyModal
        open={showCreateFamilyModal}
        onClose={() => setShowCreateFamilyModal(false)}
        citizen={activeFamilyCitizen}
        onSubmit={async (formData) => {
          if (!activeFamilyCitizen) return;
          try {
            const newFam = await createFamily({
              citizenId: activeFamilyCitizen.id,
              ...formData,
            });
            toast.success('Family record created successfully');
            setShowCreateFamilyModal(false);
            setActiveFamilyRecord(newFam);
            setFamilyMap((prev) => ({ ...prev, [String(activeFamilyCitizen.id)]: newFam }));
          } catch (err) {
            toast.error('Failed to create family record.');
          }
        }}
      />

      {/* Citizen Details Modal */}
      <Modal
        open={!!selectedId}
        onClose={() => { setSelectedId(null); setDetail(null); }}
        title={`Citizen Details - ${detail?.name || 'Loading...'}`}
      >
        {detail ? (
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-4 dark:bg-white/5 text-xs">
              <div>
                <p className="text-slate-400">Full Name</p>
                <p className="font-bold text-slate-800 dark:text-slate-100">{detail.name}</p>
              </div>
              <div>
                <p className="text-slate-400">Phone</p>
                <p className="font-semibold text-slate-800 dark:text-slate-100">
                  {detail.phone && detail.phone !== '—'
                    ? detail.phone
                    : (detail.mobileNumber || detail.phoneNumber || '—')}
                </p>
              </div>
              <div>
                <p className="text-slate-400">Age / Gender</p>
                <p className="font-semibold text-slate-800 dark:text-slate-100">{detail.age} yrs · {detail.gender}</p>
              </div>
              <div>
                <p className="text-slate-400">Blood Group</p>
                <p className="font-semibold text-slate-800 dark:text-slate-100">{detail.bloodGroup || 'Not specified'}</p>
              </div>
              <div className="col-span-2">
                <p className="text-slate-400">Address / Village</p>
                <p className="font-semibold text-slate-800 dark:text-slate-100">{detail.address || detail.villageName}</p>
              </div>
            </div>
            <div className="flex justify-end">
              <Button variant="secondary" onClick={() => { setSelectedId(null); setDetail(null); }}>Close</Button>
            </div>
          </div>
        ) : (
          <p className="text-center py-6 text-slate-500">Loading citizen profile...</p>
        )}
      </Modal>
    </div>
  );
}
