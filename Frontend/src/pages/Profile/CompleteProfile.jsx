import React, { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  Droplet,
  CalendarDays,
  MapPin,
  Landmark,
  Hash,
  Languages,
  LocateFixed,
  Image as ImageIcon,
  PhoneCall,
  ClipboardList,
  ArrowRight,
} from 'lucide-react';
import Button from '../../components/common/Button';
import Logo from '../../components/common/Logo';
import { LANGUAGES } from '../../constants/languages';
import { useAuth } from '../../contexts/AuthContext';
import { BLOOD_GROUP_OPTIONS } from '../../utils/bloodGroupMapper';
import { reverseGeocodeLocation } from '../../api/locationApi';
import apiClient from '../../api/axios';
import { getRegisteredUser } from '../../api/authApi';
import { ROLE_HOME_ROUTE } from '../../constants/roles';

// Shown once, right after a user's first successful login, if their
// profile isn't complete yet (Citizens only).
export default function CompleteProfile() {
  const navigate = useNavigate();
  const { user, completeProfile, isLoading } = useAuth();

  const regUser = useMemo(() => {
    return user?.email ? getRegisteredUser(user.email) : null;
  }, [user]);

  // Non-citizen accounts never belong in the citizen complete profile flow
  // Prevent already-completed citizens from opening /complete-profile manually
  useEffect(() => {
    let currentUser = user;
    if (!currentUser) {
      try {
        const raw = localStorage.getItem('user');
        currentUser = raw ? JSON.parse(raw) : null;
      } catch {}
    }

    if (currentUser) {
      if (currentUser.role && currentUser.role !== 'citizen') {
        navigate(ROLE_HOME_ROUTE[currentUser.role] || '/pharmacist', { replace: true });
        return;
      }
      if (currentUser.profileCompleted === true) {
        navigate('/citizen', { replace: true });
        return;
      }
    }

    const uid = currentUser?.id || currentUser?.userId;
    if (uid) {
      apiClient.get(`/api/citizens/${uid}/profile`)
        .then(({ data }) => {
          const profile = data?.data || data;
          if (profile && (profile.profileCompleted === true || (profile.dateOfBirth && profile.height && profile.weight))) {
            navigate('/citizen', { replace: true });
          }
        })
        .catch(() => {});
    }
  }, [user, navigate]);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      gender: user?.gender || regUser?.gender || '',
      height: user?.height || regUser?.height || '',
      weight: user?.weight || regUser?.weight || '',
      bloodGroup: user?.bloodGroup || regUser?.bloodGroup || '',
      dateOfBirth: user?.dateOfBirth || regUser?.dateOfBirth || '',
      address: user?.address || regUser?.address || user?.location || '',
      district: user?.district || regUser?.district || 'Coimbatore',
      state: user?.state || regUser?.state || 'Tamil Nadu',
      pincode: user?.pincode || regUser?.pincode || '',
      preferredLanguage: user?.preferredLanguage || regUser?.preferredLanguage || 'en',
      latitude: user?.latitude || '',
      longitude: user?.longitude || '',
      profilePhoto: user?.profilePhoto || '',
      emergencyContact: user?.emergencyContact || user?.emergencyContactNumber || regUser?.emergencyContact || '',
      medicalHistory: user?.medicalHistory || regUser?.medicalHistory || '',
    },
  });

  useEffect(() => {
    if (user || regUser) {
      reset({
        gender: user?.gender || regUser?.gender || '',
        height: user?.height || regUser?.height || '',
        weight: user?.weight || regUser?.weight || '',
        bloodGroup: user?.bloodGroup || regUser?.bloodGroup || '',
        dateOfBirth: user?.dateOfBirth || regUser?.dateOfBirth || '',
        address: user?.address || regUser?.address || user?.location || '',
        district: user?.district || regUser?.district || 'Coimbatore',
        state: user?.state || regUser?.state || 'Tamil Nadu',
        pincode: user?.pincode || regUser?.pincode || '',
        preferredLanguage: user?.preferredLanguage || regUser?.preferredLanguage || 'en',
        latitude: user?.latitude || '',
        longitude: user?.longitude || '',
        profilePhoto: user?.profilePhoto || '',
        emergencyContact: user?.emergencyContact || user?.emergencyContactNumber || regUser?.emergencyContact || '',
        medicalHistory: user?.medicalHistory || regUser?.medicalHistory || '',
      });
    }
  }, [user, regUser, reset]);

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not available on this device.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        setValue('latitude', lat.toFixed(6));
        setValue('longitude', lon.toFixed(6));
        toast.success('Location coordinates captured.');
        
        try {
          const geoData = await reverseGeocodeLocation(lat, lon);
          if (geoData) {
            if (geoData.address) setValue('address', geoData.address);
            if (geoData.district) setValue('district', geoData.district);
            if (geoData.state) setValue('state', geoData.state);
          } else {
            toast('Location coordinates obtained, but address details could not be determined.', { icon: 'ℹ️' });
          }
        } catch (err) {
          toast('Location coordinates obtained, but address details could not be determined.', { icon: 'ℹ️' });
        }
      },
      () => toast.error('Unable to fetch your location.')
    );
  };

  const onSubmit = async (values) => {
    const result = await completeProfile({
      ...values,
      fullName: user?.name || user?.fullName || '',
      email: user?.email || '',
      phone: user?.phone || user?.phoneNumber || user?.mobileNumber || '',
      gender: values.gender || null,
      height: values.height ? Number(values.height) : null,
      weight: values.weight ? Number(values.weight) : null,
      bloodGroup: values.bloodGroup || null,
      latitude: values.latitude ? Number(values.latitude) : null,
      longitude: values.longitude ? Number(values.longitude) : null,
      profilePhoto: values.profilePhoto || null,
      emergencyContact: values.emergencyContact || null,
      medicalHistory: values.medicalHistory || null,
    });
    if (result.success) {
      toast.success('Profile completed!');
      navigate(result.redirectTo, { replace: true });
    } else {
      toast.error(result.error || 'Unable to save your profile.');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-aurora bg-dot-grid px-4 py-12 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="glass-panel w-full max-w-2xl p-8 sm:p-10"
      >
        <div className="flex justify-center">
          <Logo />
        </div>

        <h1 className="mt-6 text-center font-display text-xl font-semibold text-slate-900 dark:text-white">
          Complete your profile
        </h1>
        <p className="mt-1 text-center text-sm text-slate-500 dark:text-slate-400">
          {user ? `Welcome, ${user.name}. ` : ''}Just a few more details before you get to your dashboard.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4" noValidate>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="gender" className="label-text">Gender</label>
              <select id="gender" className="input-field" {...register('gender', { required: 'Gender is required' })}>
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
              {errors.gender && <p className="mt-1.5 text-xs text-signal-rose">{errors.gender.message}</p>}
            </div>

            <div>
              <label htmlFor="bloodGroup" className="label-text">Blood Group</label>
              <div className="relative">
                <Droplet className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <select id="bloodGroup" className="input-field pl-10" {...register('bloodGroup')}>
                  <option value="">Prefer not to say</option>
                  {BLOOD_GROUP_OPTIONS.map((bg) => <option key={bg} value={bg}>{bg}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="height" className="label-text">Height (cm)</label>
              <input
                id="height"
                type="number"
                step="0.1"
                placeholder="e.g. 165"
                className="input-field"
                {...register('height', { required: 'Height is required', min: { value: 40, message: 'Enter a valid height' } })}
              />
              {errors.height && <p className="mt-1.5 text-xs text-signal-rose">{errors.height.message}</p>}
            </div>

            <div>
              <label htmlFor="weight" className="label-text">Weight (kg)</label>
              <input
                id="weight"
                type="number"
                step="0.1"
                placeholder="e.g. 60"
                className="input-field"
                {...register('weight', { required: 'Weight is required', min: { value: 10, message: 'Enter a valid weight' } })}
              />
              {errors.weight && <p className="mt-1.5 text-xs text-signal-rose">{errors.weight.message}</p>}
            </div>

            <div>
              <label htmlFor="dateOfBirth" className="label-text">Date of Birth</label>
              <div className="relative">
                <CalendarDays className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="dateOfBirth"
                  type="date"
                  max={new Date().toISOString().slice(0, 10)}
                  className="input-field pl-10"
                  {...register('dateOfBirth', { required: 'Date of birth is required' })}
                />
              </div>
              {errors.dateOfBirth && <p className="mt-1.5 text-xs text-signal-rose">{errors.dateOfBirth.message}</p>}
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="address" className="label-text">Address</label>
              <div className="relative">
                <MapPin className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="address"
                  type="text"
                  placeholder="Street, locality"
                  className="input-field pl-10"
                  {...register('address', { required: 'Address is required' })}
                />
              </div>
              {errors.address && <p className="mt-1.5 text-xs text-signal-rose">{errors.address.message}</p>}
            </div>

            <div>
              <label htmlFor="district" className="label-text">District</label>
              <div className="relative">
                <Landmark className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="district"
                  type="text"
                  placeholder="Coimbatore"
                  className="input-field pl-10"
                  {...register('district', { required: 'District is required' })}
                />
              </div>
              {errors.district && <p className="mt-1.5 text-xs text-signal-rose">{errors.district.message}</p>}
            </div>

            <div>
              <label htmlFor="state" className="label-text">State</label>
              <div className="relative">
                <Landmark className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="state"
                  type="text"
                  placeholder="Tamil Nadu"
                  className="input-field pl-10"
                  {...register('state', { required: 'State is required' })}
                />
              </div>
              {errors.state && <p className="mt-1.5 text-xs text-signal-rose">{errors.state.message}</p>}
            </div>

            <div>
              <label htmlFor="pincode" className="label-text">Pincode</label>
              <div className="relative">
                <Hash className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="pincode"
                  type="text"
                  inputMode="numeric"
                  placeholder="641001"
                  className="input-field pl-10"
                  {...register('pincode', {
                    required: 'Pincode is required',
                    pattern: { value: /^[0-9]{6}$/, message: 'Enter a valid 6-digit pincode' },
                  })}
                />
              </div>
              {errors.pincode && <p className="mt-1.5 text-xs text-signal-rose">{errors.pincode.message}</p>}
            </div>

            <div>
              <label htmlFor="preferredLanguage" className="label-text">Preferred Language</label>
              <div className="relative">
                <Languages className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <select id="preferredLanguage" className="input-field pl-10" {...register('preferredLanguage', { required: true })}>
                  {LANGUAGES.map((l) => <option key={l.code} value={l.code}>{l.nativeLabel}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="profilePhoto" className="label-text">Profile Photo URL <span className="text-slate-400">(optional)</span></label>
              <div className="relative">
                <ImageIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="profilePhoto"
                  type="url"
                  placeholder="https://…"
                  className="input-field pl-10"
                  {...register('profilePhoto')}
                />
              </div>
            </div>

            <div>
              <label htmlFor="latitude" className="label-text">Latitude</label>
              <input id="latitude" type="text" placeholder="11.0168" className="input-field" {...register('latitude')} />
            </div>

            <div>
              <label htmlFor="longitude" className="label-text">Longitude</label>
              <input id="longitude" type="text" placeholder="76.9558" className="input-field" {...register('longitude')} />
            </div>

            <div className="sm:col-span-2 -mt-2">
              <button
                type="button"
                onClick={useCurrentLocation}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400"
              >
                <LocateFixed className="h-3.5 w-3.5" /> Use my current location
              </button>
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="emergencyContact" className="label-text">Emergency Contact <span className="text-slate-400">(optional)</span></label>
              <div className="relative">
                <PhoneCall className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="emergencyContact"
                  type="tel"
                  placeholder="+91 98765 00000"
                  className="input-field pl-10"
                  {...register('emergencyContact')}
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="medicalHistory" className="label-text">Medical History <span className="text-slate-400">(optional)</span></label>
              <div className="relative">
                <ClipboardList className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                <textarea
                  id="medicalHistory"
                  rows={3}
                  placeholder="Chronic conditions, allergies, past surgeries…"
                  className="input-field resize-none pl-10 pt-3"
                  {...register('medicalHistory')}
                />
              </div>
            </div>
          </div>

          <Button type="submit" variant="primary" isLoading={isLoading} className="w-full">
            {!isLoading && (<>Save and continue <ArrowRight className="h-4 w-4" /></>)}
            {isLoading && 'Saving…'}
          </Button>
        </form>
      </motion.div>
    </div>
  );
}
