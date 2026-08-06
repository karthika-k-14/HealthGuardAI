import React, { useEffect, useState } from 'react';
import { Search, Users, MapPin, Phone, Eye, Cake, Droplet, HeartPulse, FileText, ShieldCheck } from 'lucide-react';
import { fetchAssignedCitizens, fetchAssignedCitizenDetails } from '../../api/ashaAssignedApi';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import EmptyState from '../../components/common/EmptyState';
import RetryBlock from '../../components/common/RetryBlock';
import { SkeletonGrid } from '../../components/common/Skeleton';

const STATUS_TONE = { ACTIVE: 'brand', PENDING: 'amber', SUSPENDED: 'rose', REJECTED: 'rose' };

/**
 * Phase 2A - Assigned Citizens. Lists every citizen registered in the
 * authenticated ASHA worker's assigned village (real backend, via
 * ashaAssignedApi.js / AshaController: GET /asha/citizens), with a detail
 * modal backed by GET /asha/citizens/{citizenId}.
 * <p>
 * Read-only for this phase - no add/edit/delete, and no pregnancy,
 * vaccination, home-visit, survey, or follow-up data, all of which are
 * out of scope until a later phase.
 */
export default function AssignedCitizens() {
  const [citizens, setCitizens] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [search, setSearch] = useState('');

  const [selectedId, setSelectedId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState(null);

  const loadCitizens = () => {
    setIsLoading(true);
    setLoadError(null);
    fetchAssignedCitizens()
      .then((data) => setCitizens(data))
      .catch(() => setLoadError("We couldn't load your assigned citizens. Please try again."))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadCitizens();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!selectedId) {
      setDetail(null);
      return;
    }
    let mounted = true;
    setIsDetailLoading(true);
    setDetailError(null);
    fetchAssignedCitizenDetails(selectedId)
      .then((data) => {
        if (mounted) setDetail(data);
      })
      .catch(() => {
        if (mounted) setDetailError("We couldn't load this citizen's details. Please try again.");
      })
      .finally(() => {
        if (mounted) setIsDetailLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [selectedId]);

  const q = search.trim().toLowerCase();
  const filtered = q
    ? citizens.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          (c.phone || '').includes(q) ||
          (c.address || '').toLowerCase().includes(q)
      )
    : citizens;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-slate-900 dark:text-white">Assigned Citizens</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Citizens registered in your assigned village.
        </p>
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, phone, or address…"
          className="input-field pl-10"
        />
      </div>

      {isLoading && <SkeletonGrid count={6} className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3" />}

      {!isLoading && loadError && <RetryBlock message={loadError} onRetry={loadCitizens} />}

      {!isLoading && !loadError && filtered.length === 0 && (
        <EmptyState
          icon={Users}
          title="No assigned citizens found"
          description={
            citizens.length === 0
              ? 'No citizens are registered in your assigned village yet.'
              : 'No citizens match your search.'
          }
        />
      )}

      {!isLoading && !loadError && filtered.length > 0 && (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c) => (
            <div key={c.id} className="surface-card flex flex-col gap-3 p-5">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate font-semibold text-slate-900 dark:text-white">{c.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {c.gender || '—'}{c.age ? ` · ${c.age} yrs` : ''}
                  </p>
                </div>
                <Badge tone={STATUS_TONE[c.accountStatus] || 'neutral'}>{c.accountStatus || 'ACTIVE'}</Badge>
              </div>

              <div className="space-y-1.5 text-xs text-slate-500 dark:text-slate-400">
                <p className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 shrink-0" /> {c.address || c.villageName || 'Not provided'}
                </p>
                <p className="flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5 shrink-0" /> {c.phone || 'Not provided'}
                </p>
                {c.bloodGroup && (
                  <p className="flex items-center gap-1.5">
                    <Droplet className="h-3.5 w-3.5 shrink-0" /> {c.bloodGroup}
                  </p>
                )}
              </div>

              <div className="mt-1 flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedId(c.id)}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400"
                >
                  <Eye className="h-3.5 w-3.5" /> View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={!!selectedId} onClose={() => setSelectedId(null)} title={detail?.name || 'Citizen Details'}>
        {isDetailLoading && (
          <div className="space-y-3">
            <SkeletonGrid count={2} className="grid gap-3" />
          </div>
        )}

        {!isDetailLoading && detailError && <RetryBlock message={detailError} onRetry={() => setSelectedId(selectedId)} />}

        {!isDetailLoading && !detailError && detail && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs text-slate-400">Phone</p>
                <p className="text-slate-800 dark:text-slate-100">{detail.phone || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Email</p>
                <p className="truncate text-slate-800 dark:text-slate-100">{detail.email || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Age / Gender</p>
                <p className="flex items-center gap-1.5 text-slate-800 dark:text-slate-100">
                  <Cake className="h-3.5 w-3.5 text-slate-400" />
                  {detail.age ? `${detail.age} yrs` : '—'}{detail.gender ? `, ${detail.gender}` : ''}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Blood Group</p>
                <p className="text-slate-800 dark:text-slate-100">{detail.bloodGroup || 'Not provided'}</p>
              </div>
              <div className="col-span-2">
                <p className="text-xs text-slate-400">Address</p>
                <p className="text-slate-800 dark:text-slate-100">
                  {[detail.address, detail.villageName, detail.district, detail.state, detail.pincode]
                    .filter(Boolean)
                    .join(', ') || 'Not provided'}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Emergency Contact</p>
                <p className="text-slate-800 dark:text-slate-100">
                  {detail.emergencyContactName
                    ? `${detail.emergencyContactName} (${detail.emergencyContactPhone || '—'})`
                    : 'Not provided'}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Account Status</p>
                <Badge tone={STATUS_TONE[detail.accountStatus] || 'neutral'}>{detail.accountStatus || 'ACTIVE'}</Badge>
              </div>
            </div>

            {(detail.chronicDiseases || detail.allergies || detail.medicalHistory) && (
              <div>
                <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
                  <HeartPulse className="h-3.5 w-3.5" /> Medical Background
                </p>
                <div className="space-y-1.5 text-sm text-slate-700 dark:text-slate-200">
                  {detail.chronicDiseases && <p><span className="text-slate-400">Chronic conditions:</span> {detail.chronicDiseases}</p>}
                  {detail.allergies && <p><span className="text-slate-400">Allergies:</span> {detail.allergies}</p>}
                  {detail.medicalHistory && <p><span className="text-slate-400">History:</span> {detail.medicalHistory}</p>}
                </div>
              </div>
            )}

            <div>
              <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
                <Users className="h-3.5 w-3.5" /> Family Members ({detail.familyMembers.length})
              </p>
              {detail.familyMembers.length === 0 && (
                <p className="text-sm text-slate-400">No family members recorded.</p>
              )}
              {detail.familyMembers.length > 0 && (
                <ul className="space-y-2">
                  {detail.familyMembers.map((m) => (
                    <li key={m.id} className="flex items-center justify-between rounded-xl border border-slate-200/70 px-3 py-2 text-sm dark:border-white/10">
                      <div className="min-w-0">
                        <p className="truncate font-medium text-slate-800 dark:text-slate-100">{m.name}</p>
                        <p className="text-xs text-slate-400">{m.relation}{m.age ? ` · ${m.age} yrs` : ''}</p>
                      </div>
                      {m.bloodGroup && <Badge tone="neutral">{m.bloodGroup}</Badge>}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div>
              <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
                <FileText className="h-3.5 w-3.5" /> Health Records ({detail.healthRecords.length})
              </p>
              {detail.healthRecords.length === 0 && (
                <p className="text-sm text-slate-400">No health records recorded.</p>
              )}
              {detail.healthRecords.length > 0 && (
                <ul className="space-y-2 border-l border-slate-200/70 pl-4 dark:border-white/10">
                  {detail.healthRecords.map((r) => (
                    <li key={r.id} className="relative">
                      <span className="absolute -left-[21px] top-1 h-2 w-2 rounded-full bg-brand-500" />
                      <p className="text-sm text-slate-700 dark:text-slate-200">{r.title}</p>
                      <p className="text-xs text-slate-400">
                        {r.recordType} · {new Date(r.recordDate).toLocaleDateString()}
                        {r.hospitalName ? ` · ${r.hospitalName}` : ''}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <p className="flex items-center gap-1.5 text-xs text-slate-400">
              <ShieldCheck className="h-3.5 w-3.5" /> Read-only view. Editing citizen records is not available in this phase.
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
}
