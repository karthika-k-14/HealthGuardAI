import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  Droplet,
  MapPin,
  PhoneCall,
  ClipboardList,
  Users,
  FileText,
  Plus,
  Pencil,
  Trash2,
  Save,
} from 'lucide-react';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import FormField from '../../components/forms/FormField';
import EmptyState from '../../components/common/EmptyState';
import { SkeletonGrid } from '../../components/common/Skeleton';
import {
  fetchCitizenProfile,
  updateCitizenProfile,
  fetchFamilyMembers,
  addFamilyMember,
  updateFamilyMember,
  deleteFamilyMember,
  fetchHealthRecords,
  addHealthRecord,
  updateHealthRecord,
  deleteHealthRecord,
} from '../../api/citizenProfileApi';
import { useLanguage } from '../../contexts/LanguageContext';
import { BLOOD_GROUP_OPTIONS, toDisplayBloodGroup } from '../../utils/bloodGroupMapper';
import { STORAGE_KEYS } from '../../constants/storageKeys';
import { getJSON } from '../../utils/storage';

const FAMILY_RELATIONS = ['SPOUSE', 'CHILD', 'PARENT', 'SIBLING', 'GRANDPARENT', 'GRANDCHILD', 'OTHER'];
const RECORD_TYPES = ['CONSULTATION', 'LAB_REPORT', 'PRESCRIPTION', 'VACCINATION', 'SURGERY', 'OTHER'];

function titleCase(value) {
  if (!value) return '—';
  return value
    .toString()
    .toLowerCase()
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

// ---- Profile details section ---------------------------------------

function ProfileDetailsSection({ profile, onSaved }) {
  const { t } = useLanguage();
  const [isSaving, setIsSaving] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ defaultValues: {} });

  useEffect(() => {
    if (profile) {
      reset({
        gender: profile.gender || '',
        dateOfBirth: profile.dateOfBirth ? (String(profile.dateOfBirth).includes('T') ? String(profile.dateOfBirth).split('T')[0] : String(profile.dateOfBirth)) : '',
        bloodGroup: profile.bloodGroup || '',
        address: profile.address || '',
        district: profile.district || '',
        state: profile.state || '',
        pincode: profile.pincode || '',
        height: profile.height ?? '',
        weight: profile.weight ?? '',
        emergencyContactName: profile.emergencyContactName || '',
        emergencyContactPhone: profile.emergencyContactPhone || '',
        chronicDiseases: profile.chronicDiseases || '',
        allergies: profile.allergies || '',
        medicalHistory: profile.medicalHistory || '',
      });
    }
  }, [profile, reset]);

  const onSubmit = async (values) => {
    setIsSaving(true);
    try {
      
      const updated = await updateCitizenProfile(
        profile.userId || profile.id,
        {
          gender: values.gender || null,
          dateOfBirth: values.dateOfBirth || null,
          bloodGroup: values.bloodGroup || null,
          address: values.address,
          district: values.district,
          state: values.state,
          pincode: values.pincode,
          height: values.height ? Number(values.height) : null,
          weight: values.weight ? Number(values.weight) : null,
          emergencyContactName: values.emergencyContactName,
          emergencyContactPhone: values.emergencyContactPhone,
          allergies: values.allergies || null,
          chronicDiseases: values.chronicDiseases || null,
          medicalHistory: values.medicalHistory || null,
        }
      );
    
      onSaved(updated);
      toast.success('Profile updated.');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Unable to save your profile.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="surface-card mt-4 space-y-4 p-6" noValidate>
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400">
          <ClipboardList className="h-4 w-4" />
        </span>
        <p className="text-sm font-semibold text-slate-900 dark:text-white">{t('Health Profile')}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Gender" htmlFor="gender">
          <select id="gender" className="input-field" {...register('gender')}>
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </FormField>

        <FormField label="Date of Birth" htmlFor="dateOfBirth">
          <input id="dateOfBirth" type="date" className="input-field" {...register('dateOfBirth')} />
        </FormField>

        <FormField label="Blood Group" htmlFor="bloodGroup">
          <div className="relative">
            <Droplet className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <select id="bloodGroup" className="input-field pl-10" {...register('bloodGroup')}>
              <option value="">Prefer not to say</option>
              {BLOOD_GROUP_OPTIONS.map((bg) => (
                <option key={bg} value={bg}>{bg}</option>
              ))}
            </select>
          </div>
        </FormField>

        <FormField label="Pincode" htmlFor="pincode" error={errors.pincode?.message}>
          <input
            id="pincode"
            type="text"
            inputMode="numeric"
            className="input-field"
            {...register('pincode', {
              pattern: { value: /^[0-9]{6}$/, message: 'Enter a valid 6-digit pincode' },
            })}
          />
        </FormField>

        <FormField label="Address" htmlFor="address" className="sm:col-span-2">
          <div className="relative">
            <MapPin className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input id="address" type="text" className="input-field pl-10" {...register('address')} />
          </div>
        </FormField>

        <FormField label="District" htmlFor="district">
          <input id="district" type="text" className="input-field" {...register('district')} />
        </FormField>

        <FormField label="State" htmlFor="state">
          <input id="state" type="text" className="input-field" {...register('state')} />
        </FormField>

        <FormField label="Height (cm)" htmlFor="height">
          <input id="height" type="number" step="0.1" className="input-field" {...register('height')} />
        </FormField>

        <FormField label="Weight (kg)" htmlFor="weight">
          <input id="weight" type="number" step="0.1" className="input-field" {...register('weight')} />
        </FormField>

        <FormField label="Emergency Contact Name" htmlFor="emergencyContactName">
          <input id="emergencyContactName" type="text" className="input-field" {...register('emergencyContactName')} />
        </FormField>

        <FormField label="Emergency Contact Phone" htmlFor="emergencyContactPhone" error={errors.emergencyContactPhone?.message}>
          <div className="relative">
            <PhoneCall className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              id="emergencyContactPhone"
              type="tel"
              className="input-field pl-10"
              {...register('emergencyContactPhone', {
                pattern: { value: /^[0-9]{10}$/, message: 'Enter a valid 10-digit phone number' },
              })}
            />
          </div>
        </FormField>

        <FormField label="Pregnancy Status" htmlFor="pregnancyStatus">
          <select id="pregnancyStatus" className="input-field" {...register('pregnancyStatus')}>
            <option value="Not Applicable">Not Applicable</option>
            <option value="Not Pregnant">Not Pregnant</option>
            <option value="Pregnant - 1st Trimester">Pregnant - 1st Trimester</option>
            <option value="Pregnant - 2nd Trimester">Pregnant - 2nd Trimester</option>
            <option value="Pregnant - 3rd Trimester">Pregnant - 3rd Trimester</option>
          </select>
        </FormField>

        <FormField label="Disability Status" htmlFor="disabilityStatus">
          <select id="disabilityStatus" className="input-field" {...register('disabilityStatus')}>
            <option value="None">None</option>
            <option value="Physical Disability">Physical Disability</option>
            <option value="Visual Impairment">Visual Impairment</option>
            <option value="Hearing Impairment">Hearing Impairment</option>
            <option value="Multiple Disabilities">Multiple Disabilities</option>
          </select>
        </FormField>

        <FormField label="Chronic Diseases" htmlFor="chronicDiseases" className="sm:col-span-2">
          <textarea id="chronicDiseases" rows={2} className="input-field resize-none pt-3" {...register('chronicDiseases')} />
        </FormField>

        <FormField label="Allergies" htmlFor="allergies" className="sm:col-span-2">
          <textarea id="allergies" rows={2} className="input-field resize-none pt-3" {...register('allergies')} />
        </FormField>

        <FormField label="Medical History" htmlFor="medicalHistory" className="sm:col-span-2">
          <textarea id="medicalHistory" rows={3} className="input-field resize-none pt-3" {...register('medicalHistory')} />
        </FormField>
      </div>

      <div className="flex justify-end">
        <Button type="submit" variant="primary" isLoading={isSaving}>
          {!isSaving && (<><Save className="h-4 w-4" /> Update Profile</>)}
          {isSaving && 'Saving…'}
        </Button>
      </div>
    </form>
  );
}

// ---- Family members section -----------------------------------------

const FAMILY_MEMBER_DEFAULTS = {
  name: '',
  relation: 'CHILD',
  age: '',
  gender: '',
  bloodGroup: '',
  phone: '',
  medicalConditions: '',
};

function FamilyMemberForm({ initialValues, onCancel, onSubmit, isSaving }) {
  const { register, handleSubmit, formState: { errors } } = useForm({ defaultValues: initialValues });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Name" htmlFor="fm-name" error={errors.name?.message}>
          <input id="fm-name" type="text" className="input-field" {...register('name', { required: 'Name is required' })} />
        </FormField>
        <FormField label="Relation" htmlFor="fm-relation">
          <select id="fm-relation" className="input-field" {...register('relation', { required: true })}>
            {FAMILY_RELATIONS.map((r) => <option key={r} value={r}>{titleCase(r)}</option>)}
          </select>
        </FormField>
        <FormField label="Age" htmlFor="fm-age">
          <input id="fm-age" type="number" min="0" max="130" className="input-field" {...register('age')} />
        </FormField>
        <FormField label="Gender" htmlFor="fm-gender">
          <select id="fm-gender" className="input-field" {...register('gender')}>
            <option value="">Prefer not to say</option>
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
            <option value="OTHER">Other</option>
          </select>
        </FormField>
        <FormField label="Blood Group" htmlFor="fm-bloodGroup">
          <select id="fm-bloodGroup" className="input-field" {...register('bloodGroup')}>
            <option value="">Prefer not to say</option>
            {BLOOD_GROUP_OPTIONS.map((bg) => <option key={bg} value={bg}>{bg}</option>)}
          </select>
        </FormField>
        <FormField label="Phone" htmlFor="fm-phone" error={errors.phone?.message}>
          <input
            id="fm-phone"
            type="tel"
            className="input-field"
            {...register('phone', { pattern: { value: /^[0-9]{10}$/, message: 'Enter a valid 10-digit phone number' } })}
          />
        </FormField>
        <FormField label="Medical Conditions" htmlFor="fm-medicalConditions" className="sm:col-span-2">
          <textarea id="fm-medicalConditions" rows={2} className="input-field resize-none pt-3" {...register('medicalConditions')} />
        </FormField>
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button type="submit" variant="primary" isLoading={isSaving}>{isSaving ? 'Saving…' : 'Save'}</Button>
      </div>
    </form>
  );
}

function FamilyMembersSection() {
  const { t } = useLanguage();
  const [members, setMembers] = useState(null);
  const [modalMode, setModalMode] = useState(null); // 'add' | 'edit' | null
  const [editingMember, setEditingMember] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const load = () => {
    fetchFamilyMembers().then(setMembers).catch(() => setMembers([]));
  };

  useEffect(() => {
    load();
  }, []);

  const handleSubmit = async (values) => {
    setIsSaving(true);
    try {
      if (modalMode === 'edit' && editingMember) {
        await updateFamilyMember(editingMember.id, values);
        toast.success('Family member updated.');
      } else {
        await addFamilyMember(values);
        toast.success('Family member added.');
      }
      setModalMode(null);
      setEditingMember(null);
      load();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Unable to save family member.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (member) => {
    if (!window.confirm(`Remove ${member.name} from your family members?`)) return;
    try {
      await deleteFamilyMember(member.id);
      toast.success('Family member removed.');
      load();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Unable to remove family member.');
    }
  };

  return (
    <div className="surface-card mt-4 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400">
            <Users className="h-4 w-4" />
          </span>
          <p className="text-sm font-semibold text-slate-900 dark:text-white">{t('Family Members')}</p>
        </div>
        <Button
          type="button"
          variant="secondary"
          onClick={() => { setEditingMember(null); setModalMode('add'); }}
        >
          <Plus className="h-4 w-4" /> Add
        </Button>
      </div>

      {members === null && <SkeletonGrid count={2} className="mt-4 grid gap-3 sm:grid-cols-2" />}

      {members !== null && members.length === 0 && (
        <EmptyState
          className="mt-4"
          icon={Users}
          title="No family members yet"
          description="Add household members to keep track of their health details."
        />
      )}

      {members !== null && members.length > 0 && (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {members.map((m) => (
            <div key={m.id} className="rounded-xl border border-slate-200/70 p-4 dark:border-white/10">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{m.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {titleCase(m.relation)}{m.age ? ` • ${m.age} yrs` : ''}
                  </p>
                </div>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => { setEditingMember(m); setModalMode('edit'); }}
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10"
                    aria-label={`Edit ${m.name}`}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(m)}
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-signal-rose dark:hover:bg-rose-500/10"
                    aria-label={`Remove ${m.name}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                {m.bloodGroup && <span>{toDisplayBloodGroup(m.bloodGroup)}</span>}
                {m.phone && <span>{m.phone}</span>}
              </div>
              {m.medicalConditions && (
                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{m.medicalConditions}</p>
              )}
            </div>
          ))}
        </div>
      )}

      <Modal
        open={!!modalMode}
        onClose={() => { setModalMode(null); setEditingMember(null); }}
        title={modalMode === 'edit' ? 'Edit Family Member' : 'Add Family Member'}
      >
        <FamilyMemberForm
          initialValues={editingMember ? {
            name: editingMember.name,
            relation: editingMember.relation,
            age: editingMember.age ?? '',
            gender: editingMember.gender || '',
            bloodGroup: editingMember.bloodGroup || '',
            phone: editingMember.phone || '',
            medicalConditions: editingMember.medicalConditions || '',
          } : FAMILY_MEMBER_DEFAULTS}
          onCancel={() => { setModalMode(null); setEditingMember(null); }}
          onSubmit={handleSubmit}
          isSaving={isSaving}
        />
      </Modal>
    </div>
  );
}

// ---- Health records section ------------------------------------------

const HEALTH_RECORD_DEFAULTS = {
  recordType: 'CONSULTATION',
  title: '',
  description: '',
  doctorName: '',
  hospitalName: '',
  recordDate: new Date().toISOString().slice(0, 10),
  attachmentUrl: '',
};

function HealthRecordForm({ initialValues, onCancel, onSubmit, isSaving }) {
  const { register, handleSubmit, formState: { errors } } = useForm({ defaultValues: initialValues });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Record Type" htmlFor="hr-recordType">
          <select id="hr-recordType" className="input-field" {...register('recordType', { required: true })}>
            {RECORD_TYPES.map((r) => <option key={r} value={r}>{titleCase(r)}</option>)}
          </select>
        </FormField>
        <FormField label="Date" htmlFor="hr-recordDate" error={errors.recordDate?.message}>
          <input
            id="hr-recordDate"
            type="date"
            max={new Date().toISOString().slice(0, 10)}
            className="input-field"
            {...register('recordDate', { required: 'Date is required' })}
          />
        </FormField>
        <FormField label="Title" htmlFor="hr-title" className="sm:col-span-2" error={errors.title?.message}>
          <input id="hr-title" type="text" className="input-field" {...register('title', { required: 'Title is required' })} />
        </FormField>
        <FormField label="Doctor Name" htmlFor="hr-doctorName">
          <input id="hr-doctorName" type="text" className="input-field" {...register('doctorName')} />
        </FormField>
        <FormField label="Hospital / Clinic" htmlFor="hr-hospitalName">
          <input id="hr-hospitalName" type="text" className="input-field" {...register('hospitalName')} />
        </FormField>
        <FormField label="Attachment URL" htmlFor="hr-attachmentUrl" className="sm:col-span-2">
          <input id="hr-attachmentUrl" type="url" placeholder="https://…" className="input-field" {...register('attachmentUrl')} />
        </FormField>
        <FormField label="Description" htmlFor="hr-description" className="sm:col-span-2">
          <textarea id="hr-description" rows={3} className="input-field resize-none pt-3" {...register('description')} />
        </FormField>
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button type="submit" variant="primary" isLoading={isSaving}>{isSaving ? 'Saving…' : 'Save'}</Button>
      </div>
    </form>
  );
}

function HealthRecordsSection() {
  const { t } = useLanguage();
  const [records, setRecords] = useState(null);
  const [modalMode, setModalMode] = useState(null);
  const [editingRecord, setEditingRecord] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const load = () => {
    fetchHealthRecords().then(setRecords).catch(() => setRecords([]));
  };

  useEffect(() => {
    load();
  }, []);

  const handleSubmit = async (values) => {
    setIsSaving(true);
    try {
      if (modalMode === 'edit' && editingRecord) {
        await updateHealthRecord(editingRecord.id, values);
        toast.success('Health record updated.');
      } else {
        await addHealthRecord(values);
        toast.success('Health record added.');
      }
      setModalMode(null);
      setEditingRecord(null);
      load();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Unable to save health record.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (record) => {
    if (!window.confirm(`Remove "${record.title}" from your health records?`)) return;
    try {
      await deleteHealthRecord(record.id);
      toast.success('Health record removed.');
      load();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Unable to remove health record.');
    }
  };

  return (
    <div className="surface-card mt-4 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400">
            <FileText className="h-4 w-4" />
          </span>
          <p className="text-sm font-semibold text-slate-900 dark:text-white">{t('Health Records')}</p>
        </div>
        <Button
          type="button"
          variant="secondary"
          onClick={() => { setEditingRecord(null); setModalMode('add'); }}
        >
          <Plus className="h-4 w-4" /> Add
        </Button>
      </div>

      {records === null && <SkeletonGrid count={2} className="mt-4 grid gap-3" />}

      {records !== null && records.length === 0 && (
        <EmptyState
          className="mt-4"
          icon={FileText}
          title="No health records yet"
          description="Add consultations, lab reports, prescriptions, and more to build your history."
        />
      )}

      {records !== null && records.length > 0 && (
        <div className="mt-4 space-y-3">
          {records.map((r) => (
            <div key={r.id} className="rounded-xl border border-slate-200/70 p-4 dark:border-white/10">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{r.title}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {titleCase(r.recordType)} • {new Date(r.recordDate).toLocaleDateString()}
                    {r.doctorName ? ` • ${r.doctorName}` : ''}
                    {r.hospitalName ? ` • ${r.hospitalName}` : ''}
                  </p>
                </div>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => { setEditingRecord(r); setModalMode('edit'); }}
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10"
                    aria-label={`Edit ${r.title}`}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(r)}
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-signal-rose dark:hover:bg-rose-500/10"
                    aria-label={`Remove ${r.title}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              {r.description && (
                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{r.description}</p>
              )}
              {r.attachmentUrl && (
                <a
                  href={r.attachmentUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-block text-xs font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400"
                >
                  View attachment
                </a>
              )}
            </div>
          ))}
        </div>
      )}

      <Modal
        open={!!modalMode}
        onClose={() => { setModalMode(null); setEditingRecord(null); }}
        title={modalMode === 'edit' ? 'Edit Health Record' : 'Add Health Record'}
      >
        <HealthRecordForm
          initialValues={editingRecord ? {
            recordType: editingRecord.recordType,
            title: editingRecord.title,
            description: editingRecord.description || '',
            doctorName: editingRecord.doctorName || '',
            hospitalName: editingRecord.hospitalName || '',
            recordDate: editingRecord.recordDate,
            attachmentUrl: editingRecord.attachmentUrl || '',
          } : HEALTH_RECORD_DEFAULTS}
          onCancel={() => { setModalMode(null); setEditingRecord(null); }}
          onSubmit={handleSubmit}
          isSaving={isSaving}
        />
      </Modal>
    </div>
  );
}

// ---- Page ----------------------------------------------------------

export default function MyProfile() {
  const { t } = useLanguage();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const user = getJSON(STORAGE_KEYS.USER);
    if (user?.id) {
      fetchCitizenProfile(user.id)
        .then((data) => {
          if (mounted) {
            setProfile(data);
            setLoading(false);
          }
        })
        .catch(() => {
          if (mounted) {
            setProfile(null);
            setLoading(false);
          }
        });
    } else {
      setLoading(false);
    }
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="mx-auto max-w-3xl"
    >
      <h1 className="font-display text-2xl font-semibold text-slate-900 dark:text-white">{t('My Health Profile')}</h1>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        {t('Manage your medical history, emergency contact, family members, and health records.')}
      </p>

      {loading && <SkeletonGrid count={2} className="mt-6 grid gap-4" />}

      {!loading && !profile && (
        <div className="surface-card mt-6 p-8 text-center space-y-6 border border-slate-200/80 dark:border-white/10 shadow-xl rounded-3xl">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-brand-500/15 text-brand-600 dark:text-brand-400 ring-8 ring-brand-500/10">
            <ClipboardList className="h-10 w-10" />
          </div>
          <div className="space-y-2 max-w-lg mx-auto">
            <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white">
              {t('Profile Not Completed')}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              {t('You have not completed your medical profile yet. Please complete your profile details to unlock all features.')}
            </p>
          </div>
          <div className="pt-2">
            <Link
              to="/complete-profile"
              className="btn-primary inline-flex items-center gap-2 px-6 py-3 text-sm font-bold shadow-lg shadow-brand-500/20"
            >
              <span>{t('Complete Profile')}</span>
            </Link>
          </div>
        </div>
      )}

      {!loading && profile && (
        <>
          <div className="surface-card mt-6 flex items-center gap-4 p-6">
            <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 text-xl font-semibold text-white">
              {profile.name?.charAt(0) || '?'}
            </span>
            <div>
              <p className="text-lg font-semibold text-slate-900 dark:text-white">{profile.name}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">{profile.email} • {profile.phone}</p>
            </div>
          </div>

          <ProfileDetailsSection profile={profile} onSaved={setProfile} />
          <FamilyMembersSection />
          <HealthRecordsSection />
        </>
      )}
    </motion.div>
  );
}
