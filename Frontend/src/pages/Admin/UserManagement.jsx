import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Search, Plus, Pencil, Trash2, Eye, Power, Users, Copy } from 'lucide-react';
import { fetchUsers, addUser, updateUser, deleteUser, toggleUserStatus } from '../../api/adminApi';
import { ROLE_LABELS, ROLES } from '../../constants/roles';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import { SkeletonGrid } from '../../components/common/Skeleton';

const ROLE_FILTERS = ['All', 'citizen', 'asha', 'pharmacist', 'officer', 'admin'];
// Admin cannot be created from User Management — one seeded/default
// admin account only, per the spec.
const CREATABLE_ROLES = ['citizen', 'asha', 'pharmacist', 'officer'];
const STATUS_FILTERS = ['All', 'active', 'disabled'];
const STATUS_TONE = { active: 'brand', disabled: 'rose' };

// Add/Edit form — staff roles (ASHA/Officer/Pharmacist) collect
// Employee ID + Assigned PHC; Citizens collect Village/District
// instead. Admin generates the account; there is no password field
// here at all (see spec: "System generates the account").
function UserFormModal({ open, onClose, onSubmit, defaultValues, title, isEdit }) {
  const { register, handleSubmit, reset, watch, formState: { isSubmitting } } = useForm({ defaultValues });
  const selectedRole = watch('role');
  const isStaffRole = selectedRole && selectedRole !== ROLES.CITIZEN;

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  return (
    <Modal open={open} onClose={onClose} title={title}>
      <form
        onSubmit={handleSubmit(async (values) => {
          await onSubmit(values);
          onClose();
        })}
        className="space-y-3"
      >
        <input {...register('name', { required: true })} placeholder="Full name" className="input-field text-sm" />
        <input {...register('email', { required: true })} type="email" placeholder="Email address" className="input-field text-sm" disabled={isEdit} />
        <input {...register('phone')} type="tel" placeholder="Phone number" className="input-field text-sm" />
        <select {...register('role', { required: true })} className="input-field text-sm" disabled={isEdit}>
          {(isEdit ? ROLE_FILTERS.filter((r) => r !== 'All') : CREATABLE_ROLES).map((r) => (
            <option key={r} value={r}>{ROLE_LABELS[r]}</option>
          ))}
        </select>

        {isStaffRole && (
          <>
            <input {...register('employeeId')} placeholder="Employee ID" className="input-field text-sm" />
            <input {...register('assignedPHC')} placeholder="Assigned PHC" className="input-field text-sm" />
            <input {...register('assignedVillage')} placeholder="Assigned Village/District" className="input-field text-sm" />
          </>
        )}
        {!isStaffRole && (
          <>
            <input {...register('assignedVillage')} placeholder="Village" className="input-field text-sm" />
            <input {...register('district')} placeholder="District" className="input-field text-sm" />
          </>
        )}

        <Button type="submit" variant="primary" isLoading={isSubmitting} className="w-full text-sm">
          Save
        </Button>
      </form>
    </Modal>
  );
}

// Shown once immediately after an account is created — the mock
// equivalent of "staff receive credentials" (a real backend would
// email/SMS this instead of displaying it).
function CredentialsModal({ credentials, onClose }) {
  const copyCredentials = () => {
    navigator.clipboard?.writeText(`Email: ${credentials.email}\nTemporary password: ${credentials.password}`);
    toast.success('Credentials copied');
  };
  return (
    <Modal open={!!credentials} onClose={onClose} title="Account created">
      {credentials && (
        <div className="space-y-4">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Share these credentials with {credentials.name} so they can sign in. This is shown once.
          </p>
          <div className="space-y-2 rounded-xl bg-slate-50 p-4 text-sm dark:bg-white/5">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Email</span>
              <span className="font-medium text-slate-800 dark:text-slate-100">{credentials.email}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Temporary password</span>
              <span className="font-mono font-semibold text-brand-600 dark:text-brand-400">{credentials.password}</span>
            </div>
          </div>
          <Button variant="secondary" className="w-full text-sm" onClick={copyCredentials}>
            <Copy className="h-4 w-4" /> Copy credentials
          </Button>
        </div>
      )}
    </Modal>
  );
}

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('All');
  const [status, setStatus] = useState('All');
  const [editing, setEditing] = useState(null);
  const [viewing, setViewing] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCredentials, setNewCredentials] = useState(null);

  const load = () => {
    setIsLoading(true);
    fetchUsers({ search, role, status }).then((data) => {
      setUsers(data);
      setIsLoading(false);
    });
  };

  useEffect(() => {
    const handle = setTimeout(load, 200);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, role, status]);

  const handleAdd = async (values) => {
    try {
      const { user, generatedPassword } = await addUser(values);
      toast.success('Account created');
      setNewCredentials({ name: user.name, email: user.email, password: generatedPassword });
      load();
    } catch (err) {
      toast.error(err.message || 'Unable to create account');
    }
  };

  const handleEdit = async (values) => {
    const { employeeId, assignedPHC, assignedVillage, district, ...topLevel } = values;
    const changes = { ...topLevel };
    if (editing.staffProfile) {
      changes.staffProfile = { ...editing.staffProfile, employeeId, assignedPHC, assignedVillage };
    } else if (editing.citizenProfile) {
      changes.citizenProfile = { ...editing.citizenProfile, village: assignedVillage, district };
    }
    await updateUser(editing.id, changes);
    toast.success('User updated');
    load();
  };

  const handleDelete = async (id) => {
    await deleteUser(id);
    toast.success('User removed');
    load();
  };

  const handleToggle = async (id) => {
    await toggleUserStatus(id);
    toast.success('Account status updated');
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-2xl font-semibold text-slate-900 dark:text-white">User Management</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Create Citizen, ASHA Worker, Health Officer, and Pharmacist accounts. Staff receive generated credentials — there is no public sign-up for these roles.
          </p>
        </div>
        <Button variant="primary" onClick={() => setShowAddModal(true)} className="text-sm">
          <Plus className="h-4 w-4" /> Add User
        </Button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email…"
            className="input-field pl-10"
          />
        </div>
        <select value={role} onChange={(e) => setRole(e.target.value)} className="input-field w-full text-sm sm:w-44">
          {ROLE_FILTERS.map((r) => (
            <option key={r} value={r}>{r === 'All' ? 'All roles' : ROLE_LABELS[r]}</option>
          ))}
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="input-field w-full text-sm sm:w-40">
          {STATUS_FILTERS.map((s) => (
            <option key={s} value={s}>{s === 'All' ? 'All statuses' : s}</option>
          ))}
        </select>
      </div>

      {isLoading && <SkeletonGrid count={6} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" />}

      {!isLoading && users.length === 0 && (
        <div className="surface-card flex flex-col items-center gap-2 p-10 text-center text-sm text-slate-500">
          <Users className="h-6 w-6 text-slate-400" />
          No users match your search.
        </div>
      )}

      {!isLoading && users.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {users.map((u) => (
            <div key={u.id} className="surface-card space-y-2.5 p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-brand-600 text-xs font-semibold text-white">
                    {u.name.charAt(0)}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{u.name}</p>
                    <p className="truncate text-xs text-slate-400">{u.email}</p>
                  </div>
                </div>
                <Badge tone={STATUS_TONE[u.status]}>{u.status}</Badge>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>{ROLE_LABELS[u.role]}</span>
                <span>Joined {new Date(u.joinedOn).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center justify-end gap-1 pt-1">
                <button type="button" onClick={() => setViewing(u)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-white/5" aria-label="View">
                  <Eye className="h-4 w-4" />
                </button>
                <button type="button" onClick={() => setEditing(u)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-white/5" aria-label="Edit">
                  <Pencil className="h-4 w-4" />
                </button>
                <button type="button" onClick={() => handleToggle(u.id)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-white/5" aria-label="Toggle status">
                  <Power className="h-4 w-4" />
                </button>
                <button type="button" onClick={() => handleDelete(u.id)} className="rounded-lg p-1.5 text-slate-400 hover:bg-signal-rose/10 hover:text-signal-rose" aria-label="Delete">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <UserFormModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAdd}
        defaultValues={{ name: '', email: '', phone: '', role: 'citizen', employeeId: '', assignedPHC: '', assignedVillage: '', district: '' }}
        title="Add User"
      />

      <UserFormModal
        open={!!editing}
        onClose={() => setEditing(null)}
        onSubmit={handleEdit}
        defaultValues={
          editing
            ? {
                ...editing,
                employeeId: editing.staffProfile?.employeeId || '',
                assignedPHC: editing.staffProfile?.assignedPHC || '',
                assignedVillage: editing.staffProfile?.assignedVillage || editing.citizenProfile?.village || '',
                district: editing.citizenProfile?.district || '',
              }
            : {}
        }
        title="Edit User"
        isEdit
      />

      <CredentialsModal credentials={newCredentials} onClose={() => setNewCredentials(null)} />

      <Modal open={!!viewing} onClose={() => setViewing(null)} title={viewing?.name}>
        {viewing && (
          <dl className="grid grid-cols-2 gap-3 text-sm">
            {[
              ['Email', viewing.email],
              ['Phone', viewing.phone || '—'],
              ['Role', ROLE_LABELS[viewing.role]],
              ['Status', viewing.status],
              ['Joined On', new Date(viewing.joinedOn).toLocaleDateString()],
              ['Last Login', viewing.lastLogin ? new Date(viewing.lastLogin).toLocaleString() : '—'],
              ...(viewing.staffProfile
                ? [
                    ['Employee ID', viewing.staffProfile.employeeId || '—'],
                    ['Assigned PHC', viewing.staffProfile.assignedPHC || '—'],
                    ['Assigned Village', viewing.staffProfile.assignedVillage || '—'],
                  ]
                : []),
              ...(viewing.citizenProfile
                ? [
                    ['Village', viewing.citizenProfile.village || '—'],
                    ['District', viewing.citizenProfile.district || '—'],
                  ]
                : []),
            ].map(([label, value]) => (
              <div key={label}>
                <dt className="text-xs text-slate-400">{label}</dt>
                <dd className="text-slate-800 dark:text-slate-100">{value}</dd>
              </div>
            ))}
          </dl>
        )}
      </Modal>
    </div>
  );
}
