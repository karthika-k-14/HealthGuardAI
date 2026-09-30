import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, TrendingUp, BadgeCheck, Briefcase, Landmark, ShieldCheck, BarChart3, LocateFixed, Edit3, X, Check, Calendar, Building, Phone, Award } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { ROLE_LABELS, ROLES } from '../../constants/roles';
import { STORAGE_KEYS } from '../../constants/storageKeys';
import { reverseGeocodeLocation } from '../../api/locationApi';
import { fetchWorkerProfile } from '../../api/ashaApi';
import { fetchPharmacistProfile, updatePharmacistProfile } from '../../api/pharmacyApi';
import { fetchOfficerProfile } from '../../api/officerApi';
import { fetchAdminProfile } from '../../api/adminApi';
import { SkeletonGrid } from '../../components/common/Skeleton';
import { getIcon } from '../../utils/iconRegistry';
import Badge from '../../components/common/Badge';
import { useLanguage } from '../../contexts/LanguageContext';
import MyProfile from '../Citizen/MyProfile';

function AshaWorkerSections({ liveLocation }) {
  const [profile, setProfile] = useState(null);
  const { user } = useAuth();
  const { t } = useLanguage();

  useEffect(() => {
    let mounted = true;
    fetchWorkerProfile().then((data) => {
      if (mounted) setProfile(data);
    });
    return () => {
      mounted = false;
    };
  }, []);

  if (!profile) return <SkeletonGrid count={2} className="mt-6 grid gap-4 sm:grid-cols-2" />;

  const assignedArea = profile.assignedArea || {
    village: liveLocation?.village || user?.village || user?.address || 'Coimbatore Village',
    district: liveLocation?.district || user?.district || 'Coimbatore',
    householdsCovered: 120,
    population: 480,
  };
  const performance = profile.performance || {
    visitsThisMonth: 18,
    visitTarget: 20,
    familiesCovered: 45,
    reportsSubmitted: 12,
    onTimeRate: 95,
  };
  const achievements = Array.isArray(profile.achievements) ? profile.achievements : [
    { id: 1, icon: 'Award', title: '100% Immunization Target', description: 'Achieved complete immunization drive in assigned village.' },
    { id: 2, icon: 'ShieldCheck', title: 'Early Outbreak Reporting', description: 'Flagged early disease surveillance symptoms to Health Officer.' },
  ];

  const villageVal = liveLocation?.village || user?.village || user?.address || assignedArea.village;
  const districtVal = liveLocation?.district || user?.district || assignedArea.district;

  return (
    <>
      <div className="surface-card mt-6 p-6">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400">
            <MapPin className="h-4 w-4" />
          </span>
          <p className="text-sm font-semibold text-slate-900 dark:text-white">{t('Assigned Area')}</p>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            ['Village', villageVal],
            ['District', districtVal],
            ['Households', assignedArea.householdsCovered],
            ['Population', assignedArea.population],
          ].map(([label, value]) => (
            <div key={label} className="min-w-0 rounded-xl bg-slate-50 p-3 dark:bg-white/5">
              <p className="text-xs text-slate-400">{t(label)}</p>
              <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white truncate" title={value}>{value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="surface-card mt-4 p-6">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400">
            <TrendingUp className="h-4 w-4" />
          </span>
          <p className="text-sm font-semibold text-slate-900 dark:text-white">{t('Performance')}</p>
        </div>
        <div className="mt-4 space-y-3">
          <div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400">{t('Visits this month')}</span>
              <span className="font-medium text-slate-700 dark:text-slate-200">
                {performance.visitsThisMonth}/{performance.visitTarget}
              </span>
            </div>
            <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
              <div
                className="h-full rounded-full bg-brand-500"
                style={{ width: `${Math.min(100, (performance.visitsThisMonth / performance.visitTarget) * 100)}%` }}
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 pt-1">
            {[
              ['Families covered', performance.familiesCovered],
              ['Reports submitted', performance.reportsSubmitted],
              ['On-time rate', `${performance.onTimeRate}%`],
            ].map(([label, value]) => (
              <div key={label} className="rounded-xl bg-slate-50 p-3 text-center dark:bg-white/5">
                <p className="text-sm font-semibold text-slate-900 dark:text-white">{value}</p>
                <p className="mt-0.5 text-[11px] text-slate-400">{t(label)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="surface-card mt-4 p-6">
        <p className="text-sm font-semibold text-slate-900 dark:text-white">{t('Achievements')}</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {achievements.map((a) => {
            const Icon = getIcon(a.icon);
            return (
              <div key={a.id} className="rounded-xl border border-slate-200/70 p-4 dark:border-white/10">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400">
                  <Icon className="h-4 w-4" />
                </span>
                <p className="mt-3 text-sm font-medium text-slate-800 dark:text-slate-100">{t(a.title)}</p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{t(a.description)}</p>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

function formatProfileDate(dateVal) {
  if (!dateVal || dateVal === 'Active' || dateVal === 'N/A') return 'Not Provided';
  const parsed = new Date(dateVal);
  if (isNaN(parsed.getTime())) return 'Not Provided';
  return parsed.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function PharmacistSections({ onProfileLoaded }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const { t } = useLanguage();
  const { user, setUser } = useAuth();

  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    address: '',
    licenseNumber: '',
    licenseIssuedBy: '',
    licenseExpiryDate: '',
    pharmacyName: '',
    yearsOfExperience: 0,
    specialization: '',
  });

  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    let mounted = true;
    fetchPharmacistProfile()
      .then((data) => {
        if (mounted) {
          setProfile(data);
          if (onProfileLoaded) onProfileLoaded(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (mounted) {
          console.error(err);
          setLoading(false);
        }
      });
    return () => {
      mounted = false;
    };
  }, []);

  const openEditModal = () => {
    setFormData({
      fullName: profile?.fullName || user?.fullName || user?.name || '',
      phoneNumber: profile?.phoneNumber || profile?.phone || user?.phoneNumber || user?.phone || '',
      address: profile?.address || user?.location || '',
      licenseNumber: profile?.licenseNumber || '',
      licenseIssuedBy: profile?.licenseIssuedBy || '',
      licenseExpiryDate: profile?.licenseExpiryDate || '',
      pharmacyName: profile?.pharmacyName || '',
      yearsOfExperience: profile?.yearsOfExperience ?? 0,
      specialization: profile?.specialization || '',
    });
    setFormErrors({});
    setIsEditing(true);
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.fullName || formData.fullName.trim().length < 2) {
      errors.fullName = 'Full name must be at least 2 characters';
    }
    if (!formData.phoneNumber || !/^[0-9]{10}$/.test(formData.phoneNumber.trim())) {
      errors.phoneNumber = 'Valid 10-digit mobile number is required';
    }
    if (!formData.licenseNumber || !formData.licenseNumber.trim()) {
      errors.licenseNumber = 'License number is required';
    }
    if (!formData.pharmacyName || !formData.pharmacyName.trim()) {
      errors.pharmacyName = 'Pharmacy name is required';
    }
    if (Number(formData.yearsOfExperience) < 0) {
      errors.yearsOfExperience = 'Years of experience cannot be negative';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error('Please resolve validation errors.');
      return;
    }

    setSaving(true);
    const toastId = toast.loading('Updating pharmacist profile...');
    try {
      const updated = await updatePharmacistProfile({
        fullName: formData.fullName.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        address: formData.address.trim(),
        licenseNumber: formData.licenseNumber.trim(),
        licenseIssuedBy: formData.licenseIssuedBy.trim() || null,
        licenseExpiryDate: formData.licenseExpiryDate || null,
        pharmacyName: formData.pharmacyName.trim(),
        yearsOfExperience: Number(formData.yearsOfExperience) || 0,
        specialization: formData.specialization.trim() || null,
      });

      setProfile(updated);
      if (onProfileLoaded) onProfileLoaded(updated);

      try {
        const storedUser = JSON.parse(localStorage.getItem(STORAGE_KEYS.USER) || '{}');
        const nextUser = {
          ...storedUser,
          fullName: updated.fullName,
          name: updated.fullName,
          phoneNumber: updated.phoneNumber,
          phone: updated.phoneNumber,
          location: updated.address || storedUser.location,
        };
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(nextUser));
        if (setUser) setUser(nextUser);
      } catch (err) {
        // ignore storage errors
      }

      toast.success('Pharmacist profile updated successfully!', { id: toastId });
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || err?.message || 'Failed to update profile', { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <SkeletonGrid count={2} className="mt-6 grid gap-4 sm:grid-cols-2" />;

  const licenseNo = profile?.licenseNumber || 'Not Provided';
  const issuedBy = profile?.licenseIssuedBy || 'Not Provided';
  const validTill = formatProfileDate(profile?.licenseExpiryDate);
  const pharmacyName = profile?.pharmacyName || 'Not Provided';
  const pharmacyAddress = profile?.address || 'Not Provided';

  const yearsInPractice = profile?.yearsOfExperience != null ? `${profile.yearsOfExperience} Years` : 'Not Provided';
  const prescriptionsVerified = profile?.prescriptionsVerified != null ? profile.prescriptionsVerified.toLocaleString() : '0';
  const specialization = profile?.specialization || 'Not Provided';

  return (
    <>
      <div className="mt-6 flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">{t('Professional Credentials')}</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">{t('Verified medical license and dispensary details')}</p>
        </div>
        <button
          type="button"
          onClick={openEditModal}
          id="btn-edit-pharmacist-profile"
          className="inline-flex items-center gap-1.5 rounded-xl bg-brand-500/10 px-3.5 py-2 text-xs font-semibold text-brand-600 hover:bg-brand-500/20 dark:bg-brand-500/20 dark:text-brand-400 transition shadow-sm"
        >
          <Edit3 className="h-4 w-4" />
          {t('Edit Profile')}
        </button>
      </div>

      <div className="surface-card mt-3 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400">
              <BadgeCheck className="h-4 w-4" />
            </span>
            <p className="text-sm font-semibold text-slate-900 dark:text-white">{t('License Details')}</p>
          </div>
          <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
            {profile?.status || 'ACTIVE'}
          </span>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4">
          {[
            ['License No.', licenseNo],
            ['Issued By', issuedBy],
            ['Valid Till', validTill],
            ['Pharmacy', pharmacyName],
          ].map(([label, value]) => (
            <div key={label} className="rounded-xl bg-slate-50 p-3 dark:bg-white/5">
              <p className="text-xs text-slate-400">{t(label)}</p>
              <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white truncate" title={value}>{value}</p>
            </div>
          ))}
        </div>
        <p className="mt-3 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
          <MapPin className="h-3.5 w-3.5 shrink-0 text-brand-500" /> <span className="truncate" title={pharmacyAddress}>{pharmacyAddress}</span>
        </p>
      </div>

      <div className="surface-card mt-4 p-6">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400">
            <Briefcase className="h-4 w-4" />
          </span>
          <p className="text-sm font-semibold text-slate-900 dark:text-white">{t('Experience & Dispensing')}</p>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-3">
          {[
            ['Years in practice', yearsInPractice],
            ['Prescriptions verified', prescriptionsVerified],
            ['Specialization', specialization],
          ].map(([label, value]) => (
            <div key={label} className="rounded-xl bg-slate-50 p-3 text-center dark:bg-white/5">
              <p className="text-sm font-semibold text-slate-900 dark:text-white truncate" title={value}>{value}</p>
              <p className="mt-0.5 text-[11px] text-slate-400">{t(label)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {isEditing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-xl rounded-2xl border border-slate-200/80 bg-white/95 p-6 shadow-2xl backdrop-blur-md dark:border-white/10 dark:bg-slate-900/95 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-white/10">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400">
                    <Edit3 className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="text-base font-semibold text-slate-900 dark:text-white">{t('Edit Pharmacist Profile')}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{t('Update your verified license and pharmacy information')}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  disabled={saving}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSaveProfile} className="mt-5 space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {t('Full Name')} <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => handleInputChange('fullName', e.target.value)}
                      placeholder="e.g. Ram Kumar"
                      className={`mt-1.5 w-full rounded-xl border px-3.5 py-2 text-sm bg-slate-50 dark:bg-white/5 dark:text-white transition focus:outline-none focus:ring-2 focus:ring-brand-500/30 ${
                        formErrors.fullName ? 'border-rose-500' : 'border-slate-200 dark:border-white/10'
                      }`}
                    />
                    {formErrors.fullName && <p className="mt-1 text-[11px] text-rose-500">{formErrors.fullName}</p>}
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {t('Phone Number')} <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={formData.phoneNumber}
                      onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                      placeholder="10-digit mobile number"
                      maxLength={10}
                      className={`mt-1.5 w-full rounded-xl border px-3.5 py-2 text-sm bg-slate-50 dark:bg-white/5 dark:text-white transition focus:outline-none focus:ring-2 focus:ring-brand-500/30 ${
                        formErrors.phoneNumber ? 'border-rose-500' : 'border-slate-200 dark:border-white/10'
                      }`}
                    />
                    {formErrors.phoneNumber && <p className="mt-1 text-[11px] text-rose-500">{formErrors.phoneNumber}</p>}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {t('Location / Address')}
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder="Dispensary address or location"
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm dark:border-white/10 dark:bg-white/5 dark:text-white transition focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {t('License Number')} <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.licenseNumber}
                      onChange={(e) => handleInputChange('licenseNumber', e.target.value)}
                      placeholder="e.g. LIC-TN-2026-091"
                      className={`mt-1.5 w-full rounded-xl border px-3.5 py-2 text-sm bg-slate-50 dark:bg-white/5 dark:text-white transition focus:outline-none focus:ring-2 focus:ring-brand-500/30 ${
                        formErrors.licenseNumber ? 'border-rose-500' : 'border-slate-200 dark:border-white/10'
                      }`}
                    />
                    {formErrors.licenseNumber && <p className="mt-1 text-[11px] text-rose-500">{formErrors.licenseNumber}</p>}
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {t('License Issued By')}
                    </label>
                    <input
                      type="text"
                      value={formData.licenseIssuedBy}
                      onChange={(e) => handleInputChange('licenseIssuedBy', e.target.value)}
                      placeholder="e.g. Tamil Nadu Pharmacy Council"
                      className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm dark:border-white/10 dark:bg-white/5 dark:text-white transition focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {t('License Expiry Date')}
                    </label>
                    <input
                      type="date"
                      value={formData.licenseExpiryDate}
                      onChange={(e) => handleInputChange('licenseExpiryDate', e.target.value)}
                      className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm dark:border-white/10 dark:bg-white/5 dark:text-white transition focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {t('Pharmacy Name')} <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.pharmacyName}
                      onChange={(e) => handleInputChange('pharmacyName', e.target.value)}
                      placeholder="e.g. Central Health Pharmacy"
                      className={`mt-1.5 w-full rounded-xl border px-3.5 py-2 text-sm bg-slate-50 dark:bg-white/5 dark:text-white transition focus:outline-none focus:ring-2 focus:ring-brand-500/30 ${
                        formErrors.pharmacyName ? 'border-rose-500' : 'border-slate-200 dark:border-white/10'
                      }`}
                    />
                    {formErrors.pharmacyName && <p className="mt-1 text-[11px] text-rose-500">{formErrors.pharmacyName}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {t('Years of Experience')}
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="60"
                      value={formData.yearsOfExperience}
                      onChange={(e) => handleInputChange('yearsOfExperience', e.target.value)}
                      className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm dark:border-white/10 dark:bg-white/5 dark:text-white transition focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                    />
                    {formErrors.yearsOfExperience && <p className="mt-1 text-[11px] text-rose-500">{formErrors.yearsOfExperience}</p>}
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {t('Specialization')}
                    </label>
                    <input
                      type="text"
                      value={formData.specialization}
                      onChange={(e) => handleInputChange('specialization', e.target.value)}
                      placeholder="e.g. Clinical Pharmacotherapy"
                      className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm dark:border-white/10 dark:bg-white/5 dark:text-white transition focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                    />
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-end gap-3 border-t border-slate-100 pt-4 dark:border-white/10">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    disabled={saving}
                    className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5 transition"
                  >
                    {t('Cancel')}
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    id="btn-save-pharmacist-profile"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-brand-600 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-brand-700 disabled:opacity-50 transition"
                  >
                    {saving ? (
                      <>
                        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        {t('Saving…')}
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4" />
                        {t('Save Changes')}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

function OfficerSections() {
  const [profile, setProfile] = useState(null);
  const { t } = useLanguage();

  useEffect(() => {
    let mounted = true;
    fetchOfficerProfile().then((data) => {
      if (mounted) setProfile(data);
    });
    return () => {
      mounted = false;
    };
  }, []);

  if (!profile) return <SkeletonGrid count={2} className="mt-6 grid gap-4 sm:grid-cols-2" />;

  const department = profile.department || {
    name: 'District Public Health Department',
    designation: 'Health Officer',
    district: profile.district || 'Coimbatore',
    since: profile.createdAt || '2022-01-15',
  };
  const performance = profile.performance || {
    outbreaksContained: 14,
    campaignsLed: 8,
    avgResponseTimeHrs: 2.4,
    districtHealthScore: '94/100',
  };
  const achievements = Array.isArray(profile.achievements) ? profile.achievements : [
    { id: 1, icon: 'Award', title: 'Outbreak Containment Excellence', description: 'Recognized for swift epidemic control in Coimbatore.' },
    { id: 2, icon: 'ShieldCheck', title: '100% Surveillance Coverage', description: 'Achieved complete field reporting across all PHC wards.' },
    { id: 3, icon: 'Activity', title: 'Digital Health Leader', description: 'Pioneered AI-driven outbreak surveillance and escalation.' },
  ];

  return (
    <>
      <div className="surface-card mt-6 p-6">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400">
            <Landmark className="h-4 w-4" />
          </span>
          <p className="text-sm font-semibold text-slate-900 dark:text-white">{t('Department & District')}</p>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4">
          {[
            ['Department', department.name],
            ['Designation', department.designation],
            ['District', department.district],
            ['In Role Since', department.since ? new Date(department.since).toLocaleDateString() : 'N/A'],
          ].map(([label, value]) => (
            <div key={label} className="rounded-xl bg-slate-50 p-3 dark:bg-white/5">
              <p className="text-xs text-slate-400">{t(label)}</p>
              <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">{value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="surface-card mt-4 p-6">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400">
            <TrendingUp className="h-4 w-4" />
          </span>
          <p className="text-sm font-semibold text-slate-900 dark:text-white">{t('Performance')}</p>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            ['Outbreaks contained', performance.outbreaksContained],
            ['Campaigns led', performance.campaignsLed],
            ['Avg. response time', `${performance.avgResponseTimeHrs}h`],
            ['District health score', performance.districtHealthScore],
          ].map(([label, value]) => (
            <div key={label} className="rounded-xl bg-slate-50 p-3 text-center dark:bg-white/5">
              <p className="text-sm font-semibold text-slate-900 dark:text-white">{value}</p>
              <p className="mt-0.5 text-[11px] text-slate-400">{t(label)}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="surface-card mt-4 p-6">
        <p className="text-sm font-semibold text-slate-900 dark:text-white">{t('Achievements')}</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {achievements.map((a) => {
            const Icon = getIcon(a.icon);
            return (
              <div key={a.id} className="rounded-xl border border-slate-200/70 p-4 dark:border-white/10">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400">
                  <Icon className="h-4 w-4" />
                </span>
                <p className="mt-3 text-sm font-medium text-slate-800 dark:text-slate-100">{t(a.title)}</p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{t(a.description)}</p>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

function AdminSections({ onProfileLoaded }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { t } = useLanguage();

  useEffect(() => {
    let mounted = true;
    fetchAdminProfile()
      .then((data) => {
        if (mounted) {
          setProfile(data);
          if (onProfileLoaded) onProfileLoaded(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (mounted) {
          setError(err?.message || 'Failed to load profile data');
          setLoading(false);
        }
      });
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) return <SkeletonGrid count={2} className="mt-6 grid gap-4 sm:grid-cols-2" />;

  if (error || !profile) {
    return (
      <div className="surface-card mt-6 p-6 text-center text-sm text-signal-rose">
        {t(error || 'Failed to load admin profile.')}
      </div>
    );
  }

  const { accessLevel, permissions, activitySummary } = profile;

  return (
    <>
      <div className="surface-card mt-6 p-6">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400">
            <ShieldCheck className="h-4 w-4" />
          </span>
          <p className="text-sm font-semibold text-slate-900 dark:text-white">{t('Role & Access')}</p>
        </div>
        <div className="mt-4 rounded-xl bg-slate-50 p-3 dark:bg-white/5">
          <p className="text-xs text-slate-400">{t('Access Level')}</p>
          <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">{t(accessLevel)}</p>
        </div>
        <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-slate-400">{t('Permissions')}</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {permissions.map((p) => (
            <Badge key={p} tone="brand">{t(p)}</Badge>
          ))}
        </div>
      </div>

      <div className="surface-card mt-4 p-6">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400">
            <BarChart3 className="h-4 w-4" />
          </span>
          <p className="text-sm font-semibold text-slate-900 dark:text-white">{t('Activity Summary')}</p>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            ['Actions this month', activitySummary.actionsThisMonth],
            ['Users managed', activitySummary.usersManaged.toLocaleString()],
            ['Campaigns published', activitySummary.campaignsPublished],
            ['Reports generated', activitySummary.reportsGenerated],
          ].map(([label, value]) => (
            <div key={label} className="rounded-xl bg-slate-50 p-3 text-center dark:bg-white/5">
              <p className="text-sm font-semibold text-slate-900 dark:text-white">{value}</p>
              <p className="mt-0.5 text-[11px] text-slate-400">{t(label)}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default function Profile() {
  const { user, role } = useAuth();
  const { t } = useLanguage();
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [liveLocation, setLiveLocation] = useState(null);
  const [adminProfile, setAdminProfile] = useState(null);
  const [pharmacistProfile, setPharmacistProfile] = useState(null);

  if (role === ROLES.CITIZEN) {
    return <MyProfile />;
  }

  const displayName = adminProfile?.fullName || pharmacistProfile?.fullName || user?.name || user?.fullName || (user?.email ? user.email.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : 'User Profile');
  const userPhone = adminProfile?.phone || pharmacistProfile?.phoneNumber || user?.phone || user?.phoneNumber || 'Not Available';
  const userLocation = liveLocation?.location || adminProfile?.location || pharmacistProfile?.address || user?.location || (user?.village && user?.district ? `${user.village}, ${user.district}` : user?.district || 'Not Available');

  const handleDetectLocation = () => {
    if (!('geolocation' in navigator)) {
      toast.error('GPS Geolocation is not supported on this browser.');
      return;
    }

    setIsDetectingLocation(true);
    const toastId = toast.loading('Enabling GPS & detecting real-time location...');

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        const geoData = await reverseGeocodeLocation(lat, lon);

        const locString = geoData?.displayLocation || `${lat.toFixed(4)}°, ${lon.toFixed(4)}°`;
        const villageName = geoData?.village || 'Detected Area';
        const districtName = geoData?.district || 'Coimbatore';

        const updatedLocationObj = {
          location: locString,
          village: villageName,
          district: districtName,
          lat,
          lon,
        };

        setLiveLocation(updatedLocationObj);

        try {
          const storedUser = JSON.parse(localStorage.getItem(STORAGE_KEYS.USER) || '{}');
          const nextUser = {
            ...storedUser,
            location: locString,
            village: villageName,
            district: districtName,
            latitude: lat,
            longitude: lon,
          };
          localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(nextUser));
        } catch (e) { /* ignore localStorage errors */ }

        setIsDetectingLocation(false);
        toast.success(`Current GPS Location captured: ${locString}`, { id: toastId });
      },
      (err) => {
        setIsDetectingLocation(false);
        if (err.code === err.PERMISSION_DENIED) {
          toast.error('Location access denied. Please allow location permissions in your browser bar.', { id: toastId });
        } else {
          toast.error('Unable to fetch GPS position.', { id: toastId });
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="mx-auto max-w-2xl"
    >
      <h1 className="font-display text-2xl font-semibold text-slate-900 dark:text-white">{t('Profile')}</h1>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        {t('Your account details, as recorded on HealthGuard AI.')}
      </p>

      <div className="surface-card mt-6 flex items-center justify-between p-6">
        <div className="flex items-center gap-4">
          <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 text-xl font-semibold text-white">
            {displayName.charAt(0).toUpperCase()}
          </span>
          <div>
            <p className="text-lg font-semibold text-slate-900 dark:text-white">{displayName}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">{t(ROLE_LABELS[role])}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleDetectLocation}
          disabled={isDetectingLocation}
          className="inline-flex items-center gap-1.5 rounded-xl bg-brand-500/10 px-3.5 py-2 text-xs font-semibold text-brand-600 hover:bg-brand-500/20 dark:bg-brand-500/20 dark:text-brand-400"
          title="Enable GPS & detect current location"
        >
          <LocateFixed className={`h-4 w-4 ${isDetectingLocation ? 'animate-spin' : ''}`} />
          {isDetectingLocation ? 'Detecting GPS…' : 'Enable Location'}
        </button>
      </div>

      <dl className="surface-card mt-4 divide-y divide-slate-200/70 dark:divide-white/10">
        <div className="flex items-center justify-between px-6 py-4">
          <dt className="text-sm text-slate-500 dark:text-slate-400">{t('Email')}</dt>
          <dd className="text-sm font-medium text-slate-900 dark:text-white">{user?.email || '—'}</dd>
        </div>
        <div className="flex items-center justify-between px-6 py-4">
          <dt className="text-sm text-slate-500 dark:text-slate-400">{t('Phone')}</dt>
          <dd className="text-sm font-medium text-slate-900 dark:text-white">{userPhone}</dd>
        </div>
        <div className="flex items-center justify-between px-6 py-4">
          <div>
            <dt className="text-sm text-slate-500 dark:text-slate-400">{t('Location')}</dt>
            {liveLocation?.lat && (
              <p className="mt-0.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                GPS: {liveLocation.lat.toFixed(4)}°, {liveLocation.lon.toFixed(4)}° (Live)
              </p>
            )}
          </div>
          <dd className="text-sm font-medium text-slate-900 dark:text-white text-right max-w-xs truncate" title={userLocation}>
            {userLocation}
          </dd>
        </div>
      </dl>

      {role === ROLES.ASHA && <AshaWorkerSections liveLocation={liveLocation} />}
      {role === ROLES.PHARMACIST && <PharmacistSections onProfileLoaded={setPharmacistProfile} />}
      {role === ROLES.HEALTH_OFFICER && <OfficerSections />}
      {role === ROLES.ADMIN && <AdminSections onProfileLoaded={setAdminProfile} />}
    </motion.div>
  );
}
