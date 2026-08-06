import React from 'react';
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

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

// Shown once, right after a user's first successful login, if their
// profile isn't complete yet (see ProtectedRoute.jsx). Registration
// only ever collects identity + credentials — everything else lands
// here: blood group, DOB, address, geo-location, emergency contact,
// medical history, etc. Saving redirects to the dashboard.
export default function CompleteProfile() {
  const navigate = useNavigate();
  const { user, completeProfile, isLoading } = useAuth();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      bloodGroup: '',
      dateOfBirth: '',
      address: '',
      district: '',
      state: '',
      pincode: '',
      preferredLanguage: 'en',
      latitude: '',
      longitude: '',
      profilePhoto: '',
      emergencyContact: '',
      medicalHistory: '',
    },
  });

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not available on this device.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setValue('latitude', pos.coords.latitude.toFixed(6));
        setValue('longitude', pos.coords.longitude.toFixed(6));
        toast.success('Location captured.');
      },
      () => toast.error('Unable to fetch your location.')
    );
  };

  const onSubmit = async (values) => {
    const result = await completeProfile({
      ...values,
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
              <label htmlFor="bloodGroup" className="label-text">Blood Group</label>
              <div className="relative">
                <Droplet className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <select id="bloodGroup" className="input-field pl-10" {...register('bloodGroup')}>
                  <option value="">Prefer not to say</option>
                  {BLOOD_GROUPS.map((bg) => <option key={bg} value={bg}>{bg}</option>)}
                </select>
              </div>
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
