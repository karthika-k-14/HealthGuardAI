import React, { useEffect, useMemo, useState } from 'react';
import { Activity, Users, ClipboardList, Sparkles, PackageCheck, CheckCircle2, TriangleAlert, Building2 } from 'lucide-react';
import { fetchDiseaseCountsSnapshot } from '../../../api/workflowApi';
import { useAllCasesForAdmin } from '../../../contexts/CaseContext';
import Badge from '../../../components/common/Badge';
import { SkeletonGrid } from '../../../components/common/Skeleton';

const RISK_TONE = { Low: 'brand', Medium: 'amber', High: 'rose', Critical: 'critical' };

const TILES = [
  { key: 'totalCases', label: 'Total Cases', icon: Users, tone: 'text-brand-600 dark:text-brand-400 bg-brand-500/10' },
  { key: 'totalCitizens', label: 'Total Citizens', icon: Users, tone: 'text-cyan-600 dark:text-cyan-300 bg-cyan-500/10' },
  { key: 'activeCases', label: 'Active Cases', icon: Activity, tone: 'text-sky-600 dark:text-sky-400 bg-sky-500/10' },
  { key: 'criticalCases', label: 'Critical Cases', icon: TriangleAlert, tone: 'text-rose-600 dark:text-rose-300 bg-signal-rose/10' },
  { key: 'pendingOfficerReview', label: 'Awaiting Officer Review', icon: ClipboardList, tone: 'text-amber-600 dark:text-amber-300 bg-signal-amber/10' },
  { key: 'referralNotesIssued', label: 'Referral Notes Issued', icon: Sparkles, tone: 'text-purple-600 dark:text-purple-300 bg-purple-500/10' },
  { key: 'medicinesAvailable', label: 'Medicine Availability Confirmed', icon: PackageCheck, tone: 'text-indigo-600 dark:text-indigo-300 bg-indigo-500/10' },
  { key: 'hospitalReferrals', label: 'Hospital Referrals', icon: Building2, tone: 'text-teal-600 dark:text-teal-300 bg-teal-500/10' },
  { key: 'closedCases', label: 'Completed Cases', icon: CheckCircle2, tone: 'text-emerald-600 dark:text-emerald-300 bg-emerald-500/10' },
];

/**
 * Reflects the live cross-role case pipeline (Citizen -> ASHA ->
 * Officer -> Pharmacist) on the Admin dashboard, derived directly from
 * the shared CaseContext — the same single source of truth every
 * other dashboard reads from — so Admin is never looking at a
 * dashboard isolated from what the other four roles are doing.
 */
export default function CasePipelineWidget() {
  const { cases, isLoading } = useAllCasesForAdmin();
  const [outbreakWards, setOutbreakWards] = useState([]);

  useEffect(() => {
    fetchDiseaseCountsSnapshot().then((rows) => {
      setOutbreakWards([...new Set(rows.filter((r) => r.isOutbreak).map((r) => r.ward))]);
    });
  }, []);

  const snapshot = useMemo(() => {
    const totalCases = cases.length;
    const closedCases = cases.filter((c) => c.status === 'Completed').length;
    const pendingOfficerReview = cases.filter(
      (c) => c.status === 'Officer Reviewing' || c.status === 'Lab Test Requested'
    ).length;
    const criticalCases = cases.filter((c) => c.riskLevel === 'High' && c.status !== 'Completed').length;
    const hospitalReferrals = cases.filter((c) => c.hospitalReferral).length;
    const totalCitizens = new Set(cases.map((c) => c.citizenName)).size;
    const referralNotesIssued = cases.filter((c) => c.referralNote).length;
    const medicinesAvailable = cases.filter(
      (c) => c.medicineStatus === 'Available at PHC' || c.medicineStatus === 'Collected at PHC'
    ).length;
    const activeCases = totalCases - closedCases;

    const diseaseFrequency = {};
    cases.forEach((c) => {
      diseaseFrequency[c.disease] = (diseaseFrequency[c.disease] || 0) + 1;
    });
    const topDiseases = Object.entries(diseaseFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([disease, count]) => ({ disease, count }));

    const recentCases = cases.slice(0, 6).map((c) => ({
      id: c.id,
      citizenName: c.citizenName,
      disease: c.disease,
      ward: c.ward,
      riskLevel: c.riskLevel,
      status: c.status,
    }));

    return {
      totalCases,
      totalCitizens,
      activeCases,
      closedCases,
      criticalCases,
      hospitalReferrals,
      pendingOfficerReview,
      referralNotesIssued,
      medicinesAvailable,
      topDiseases,
      recentCases,
    };
  }, [cases]);

  if (isLoading) return <SkeletonGrid count={6} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" />;

  return (
    <div className="surface-card p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400">
            <Activity className="h-4 w-4" />
          </span>
          <p className="text-sm font-semibold text-slate-900 dark:text-white">Live Case Pipeline</p>
        </div>
        {outbreakWards.length > 0 && (
          <Badge tone="rose">
            <TriangleAlert className="mr-1 h-3 w-3" /> {outbreakWards.length} ward outbreak alert
          </Badge>
        )}
      </div>
      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
        Aggregated live from the shared Case Management Context — Citizen, ASHA, Health Officer, and Pharmacist activity this session.
      </p>

      {snapshot.totalCases === 0 ? (
        <p className="mt-4 text-sm text-slate-400">
          No cases yet — this fills in as citizens submit symptom reports.
        </p>
      ) : (
        <>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {TILES.map((tile) => (
              <div key={tile.key} className="flex items-center gap-3 rounded-xl border border-slate-200/70 p-3 dark:border-white/10">
                <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${tile.tone}`}>
                  <tile.icon className="h-4 w-4" />
                </span>
                <div>
                  <p className="font-display text-lg font-semibold text-slate-900 dark:text-white">
                    {snapshot[tile.key]}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{tile.label}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 grid gap-5 lg:grid-cols-2">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Disease Trends</p>
              <div className="space-y-1.5">
                {snapshot.topDiseases.map((d) => (
                  <div key={d.disease} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-1.5 text-xs dark:bg-white/5">
                    <span className="text-slate-600 dark:text-slate-300">{d.disease}</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-100">{d.count}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Recent Case Activity</p>
              <div className="space-y-1.5">
                {snapshot.recentCases.map((c) => (
                  <div key={c.id} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-1.5 text-xs dark:bg-white/5">
                    <span className="text-slate-600 dark:text-slate-300">{c.citizenName} · {c.disease}</span>
                    <div className="flex items-center gap-1.5">
                      <Badge tone={RISK_TONE[c.riskLevel] || 'neutral'}>{c.riskLevel}</Badge>
                      <span className="text-slate-400">{c.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
