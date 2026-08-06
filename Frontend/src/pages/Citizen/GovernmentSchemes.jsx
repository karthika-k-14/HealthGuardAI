import React, { useEffect, useState } from 'react';
import { Landmark, ExternalLink, CheckCircle2, Clock, XCircle, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { fetchSchemes, applyForScheme, fetchMySchemeApplications } from '../../api/schemeApi';
import Badge from '../../components/common/Badge';
import { SkeletonGrid } from '../../components/common/Skeleton';

// Status -> badge tone/label/icon for a citizen's own application.
const STATUS_META = {
  PENDING: { label: 'Application pending', tone: 'amber', Icon: Clock },
  ELIGIBLE: { label: 'Marked eligible', tone: 'sky', Icon: ShieldCheck },
  APPROVED: { label: 'Approved beneficiary', tone: 'brand', Icon: CheckCircle2 },
  REJECTED: { label: 'Application rejected', tone: 'rose', Icon: XCircle },
};

export default function GovernmentSchemes() {
  const [schemes, setSchemes] = useState([]);
  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [applyingId, setApplyingId] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setIsLoading(true);
    try {
      const [schemeList, myApplications] = await Promise.all([
        fetchSchemes(),
        fetchMySchemeApplications(),
      ]);
      setSchemes(schemeList);
      setApplications(myApplications);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Unable to load schemes.');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleApply(schemeId) {
    setApplyingId(schemeId);
    try {
      const application = await applyForScheme(schemeId);
      setApplications((prev) => [application, ...prev.filter((a) => a.schemeId !== schemeId)]);
      toast.success('Application submitted.');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Unable to submit your application.');
    } finally {
      setApplyingId(null);
    }
  }

  // Most recent application for a given scheme, if any.
  function applicationFor(schemeId) {
    return applications.find((a) => a.schemeId === schemeId);
  }

  return (
    <div className="mx-auto max-w-5xl">
      <span className="section-eyebrow">
        <Landmark className="h-3.5 w-3.5" /> Government Schemes
      </span>
      <h1 className="mt-2 font-display text-2xl font-semibold text-slate-900 dark:text-white">
        Health schemes you may be eligible for
      </h1>

      {isLoading ? (
        <SkeletonGrid count={4} className="mt-6 grid gap-5 sm:grid-cols-2" cardClassName="p-6" />
      ) : (
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          {schemes.map((s) => {
            const application = applicationFor(s.id);
            const meta = application ? STATUS_META[application.status] : null;
            const isActiveApplication = Boolean(application) && application.status !== 'REJECTED';

            return (
              <div key={s.id} className="surface-card p-6">
                <div className="flex items-start justify-between gap-3">
                  <p className="font-display text-base font-semibold text-slate-900 dark:text-white">{s.name}</p>
                  {meta && (
                    <Badge tone={meta.tone} className="inline-flex shrink-0 items-center gap-1">
                      <meta.Icon className="h-3.5 w-3.5" /> {meta.label}
                    </Badge>
                  )}
                </div>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{s.description}</p>

                <div className="mt-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Eligibility</p>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{s.eligibility}</p>
                </div>

                <div className="mt-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Benefits</p>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {s.benefits.map((b) => (
                      <Badge key={b} tone="brand">{b}</Badge>
                    ))}
                  </div>
                </div>

                {application?.remarks && (
                  <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                    Reviewer note: {application.remarks}
                  </p>
                )}

                <div className="mt-5 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => handleApply(s.id)}
                    disabled={isActiveApplication || applyingId === s.id}
                    className="btn-primary text-sm disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {applyingId === s.id
                      ? 'Submitting…'
                      : isActiveApplication
                        ? 'Application submitted'
                        : application?.status === 'REJECTED'
                          ? 'Re-apply'
                          : 'Apply for this scheme'}
                  </button>

                  {s.applyUrl && (
                    <a
                      href={s.applyUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:underline dark:text-brand-400"
                    >
                      Official portal <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
