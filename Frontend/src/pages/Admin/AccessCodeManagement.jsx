import React, { useEffect, useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { KeyRound, Plus, Copy, Check, X, ShieldCheck, Ban, ClipboardList } from 'lucide-react';
import {
  fetchPendingApprovals,
  adminApproveUser,
  adminRejectUser,
  adminGenerateCode,
  adminListAccessCodes,
} from '../../api/adminApi';
import { ROLE_LABELS, ROLES } from '../../constants/roles';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import { SkeletonGrid } from '../../components/common/Skeleton';

const CODE_ROLES = [ROLES.ASHA, ROLES.HEALTH_OFFICER, ROLES.PHARMACIST];
const CODE_STATUS_FILTERS = ['All', 'unused', 'used', 'expired'];
const CODE_STATUS_TONE = { unused: 'brand', used: 'neutral', expired: 'rose' };

// Generate Code dialog — Role + Expiry, per the spec.
function GenerateCodeModal({ open, onClose, onGenerated }) {
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm({
    defaultValues: { role: ROLES.ASHA, expiresInDays: 14 },
  });

  return (
    <Modal open={open} onClose={onClose} title="Generate Staff Access Code">
      <form
        onSubmit={handleSubmit(async (values) => {
          const entry = await adminGenerateCode({ role: values.role, expiresInDays: Number(values.expiresInDays) });
          toast.success(`Code ${entry.code} generated`);
          reset();
          onGenerated();
          onClose();
        })}
        className="space-y-3"
      >
        <div>
          <label className="label-text">Role</label>
          <select {...register('role', { required: true })} className="input-field text-sm">
            {CODE_ROLES.map((r) => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
          </select>
        </div>
        <div>
          <label className="label-text">Expires in (days)</label>
          <input
            type="number"
            min={1}
            max={90}
            className="input-field text-sm"
            {...register('expiresInDays', { required: true, min: 1, max: 90 })}
          />
        </div>
        <Button type="submit" variant="primary" isLoading={isSubmitting} className="w-full text-sm">
          <Plus className="h-4 w-4" /> Generate Code
        </Button>
      </form>
    </Modal>
  );
}

export default function AccessCodeManagement() {
  const [pending, setPending] = useState([]);
  const [codes, setCodes] = useState([]);
  const [codeStatus, setCodeStatus] = useState('All');
  const [isLoading, setIsLoading] = useState(true);
  const [showGenerate, setShowGenerate] = useState(false);
  const [copiedCode, setCopiedCode] = useState(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    const [pendingList, codeList] = await Promise.all([
      fetchPendingApprovals(),
      adminListAccessCodes({ status: codeStatus }),
    ]);
    setPending(pendingList);
    setCodes(codeList);
    setIsLoading(false);
  }, [codeStatus]);

  useEffect(() => {
    load();
  }, [load]);

  const handleApprove = async (id) => {
    await adminApproveUser(id);
    toast.success('Registration approved');
    load();
  };

  const handleReject = async (id) => {
    await adminRejectUser(id, 'Rejected by administrator');
    toast.success('Registration rejected');
    load();
  };

  const copyCode = (code) => {
    navigator.clipboard?.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 1500);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-2xl font-semibold text-slate-900 dark:text-white">
            Staff Access Codes
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Generate codes for ASHA Workers, Health Officers, and Pharmacists to self-register with,
            and review registrations awaiting approval.
          </p>
        </div>
        <Button variant="primary" onClick={() => setShowGenerate(true)} className="text-sm">
          <Plus className="h-4 w-4" /> Generate Code
        </Button>
      </div>

      {/* ---- Pending staff approvals ---- */}
      <section className="space-y-3">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
          <ClipboardList className="h-4 w-4" /> Pending Registrations
          {pending.length > 0 && <Badge tone="amber">{pending.length}</Badge>}
        </h2>

        {isLoading && <SkeletonGrid count={3} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" />}

        {!isLoading && pending.length === 0 && (
          <div className="surface-card flex flex-col items-center gap-2 p-8 text-center text-sm text-slate-500">
            <ShieldCheck className="h-6 w-6 text-slate-400" />
            No registrations awaiting approval.
          </div>
        )}

        {!isLoading && pending.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {pending.map((u) => (
              <div key={u.id} className="surface-card space-y-3 p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{u.name}</p>
                    <p className="truncate text-xs text-slate-400">{u.email}</p>
                  </div>
                  <Badge tone="amber">{ROLE_LABELS[u.role]}</Badge>
                </div>
                {u.staffProfile?.employeeId && (
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Employee ID: <span className="font-medium">{u.staffProfile.employeeId}</span>
                  </p>
                )}
                {u.staffProfile?.licenseNumber && (
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    License #: <span className="font-medium">{u.staffProfile.licenseNumber}</span>
                  </p>
                )}
                <div className="flex gap-2 pt-1">
                  <Button variant="primary" className="flex-1 text-xs" onClick={() => handleApprove(u.id)}>
                    <Check className="h-3.5 w-3.5" /> Approve
                  </Button>
                  <Button variant="secondary" className="flex-1 text-xs" onClick={() => handleReject(u.id)}>
                    <X className="h-3.5 w-3.5" /> Reject
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ---- Staff access codes ---- */}
      <section className="space-y-3">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
            <KeyRound className="h-4 w-4" /> Access Codes
          </h2>
          <select value={codeStatus} onChange={(e) => setCodeStatus(e.target.value)} className="input-field w-full text-sm sm:w-44">
            {CODE_STATUS_FILTERS.map((s) => (
              <option key={s} value={s}>{s === 'All' ? 'All codes' : s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
        </div>

        {!isLoading && codes.length === 0 && (
          <div className="surface-card flex flex-col items-center gap-2 p-8 text-center text-sm text-slate-500">
            <Ban className="h-6 w-6 text-slate-400" />
            No access codes match this filter.
          </div>
        )}

        {!isLoading && codes.length > 0 && (
          <div className="surface-card overflow-x-auto p-0">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200/70 text-xs uppercase tracking-wide text-slate-400 dark:border-white/10">
                <tr>
                  <th className="px-4 py-3">Code</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Expires</th>
                  <th className="px-4 py-3">Used by</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/70 dark:divide-white/10">
                {codes.map((c) => (
                  <tr key={c.code}>
                    <td className="px-4 py-3 font-mono text-xs font-semibold tracking-widest text-slate-700 dark:text-slate-200">{c.code}</td>
                    <td className="px-4 py-3">{ROLE_LABELS[c.role] || c.role}</td>
                    <td className="px-4 py-3"><Badge tone={CODE_STATUS_TONE[c.status]}>{c.status}</Badge></td>
                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{new Date(c.expiresAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{c.usedBy || '—'}</td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => copyCode(c.code)}
                        className="inline-flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400"
                      >
                        {copiedCode === c.code ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                        {copiedCode === c.code ? 'Copied' : 'Copy'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <GenerateCodeModal open={showGenerate} onClose={() => setShowGenerate(false)} onGenerated={load} />
    </div>
  );
}
