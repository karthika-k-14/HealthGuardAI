import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { ShieldCheck } from 'lucide-react';
import { fetchRoles, updateRolePermissions } from '../../api/adminApi';
import { SkeletonGrid } from '../../components/common/Skeleton';
import { cn } from '../../utils/cn';

const PERMISSION_KEYS = [
  { key: 'read', label: 'Read' },
  { key: 'write', label: 'Write' },
  { key: 'update', label: 'Update' },
  { key: 'delete', label: 'Delete' },
  { key: 'dashboardAccess', label: 'Dashboard Access' },
  { key: 'reportAccess', label: 'Report Access' },
];

export default function RoleManagement() {
  const [roles, setRoles] = useState(null);

  const load = () => {
    fetchRoles().then(setRoles);
  };

  useEffect(load, []);

  const handleToggle = async (roleKey, permKey, current) => {
    await updateRolePermissions(roleKey, { [permKey]: !current });
    toast.success('Permissions updated');
    load();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-slate-900 dark:text-white">Role Management</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Control what each role can access and do across the platform.</p>
      </div>

      {!roles && <SkeletonGrid count={5} className="grid gap-4" />}

      {roles && (
        <div className="surface-card overflow-x-auto p-0">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200/70 text-xs uppercase tracking-wide text-slate-400 dark:border-white/10">
                <th className="px-5 py-3 font-medium">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5" /> Role
                  </span>
                </th>
                {PERMISSION_KEYS.map((p) => (
                  <th key={p.key} className="px-3 py-3 text-center font-medium">{p.label}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/70 dark:divide-white/10">
              {roles.map((r) => (
                <tr key={r.role}>
                  <td className="px-5 py-3 font-medium text-slate-800 dark:text-slate-100">{r.label}</td>
                  {PERMISSION_KEYS.map((p) => (
                    <td key={p.key} className="px-3 py-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggle(r.role, p.key, r.permissions[p.key])}
                        className={cn(
                          'relative mx-auto inline-flex h-5 w-9 items-center rounded-full transition-colors',
                          r.permissions[p.key] ? 'bg-brand-500' : 'bg-slate-200 dark:bg-white/10'
                        )}
                        aria-label={`Toggle ${p.label} for ${r.label}`}
                      >
                        <span
                          className={cn(
                            'inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform',
                            r.permissions[p.key] ? 'translate-x-4' : 'translate-x-1'
                          )}
                        />
                      </button>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
