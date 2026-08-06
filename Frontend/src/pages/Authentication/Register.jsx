import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  Phone,
  ShieldCheck,
  Activity,
  MapPinned,
  HeartPulse,
  Stethoscope,
  ArrowRight,
  BadgeCheck,
} from 'lucide-react';
import Button from '../../components/common/Button';
import Logo from '../../components/common/Logo';
import { PATHS } from '../../constants/routes';
import { ROLES, ROLE_LABELS } from '../../constants/roles';
import { useAuth } from '../../contexts/AuthContext';

const HIGHLIGHTS = [
  { icon: Activity, text: 'Real-time district health surveillance' },
  { icon: MapPinned, text: 'Locate hospitals and care nearby' },
  { icon: HeartPulse, text: 'Track vaccinations and prevention' },
];

const FLOATERS = [
  { Icon: HeartPulse, top: '14%', left: '18%', delay: 0 },
  { Icon: Stethoscope, top: '62%', left: '10%', delay: 0.5 },
  { Icon: ShieldCheck, top: '78%', left: '68%', delay: 1 },
  { Icon: Activity, top: '22%', left: '72%', delay: 1.4 },
];

// Public registration is for Citizens by default. Healthcare Workers
// land here too — but only after verifying a Staff Access Code on
// StaffAccessCode.jsx, which hands their role + code through router
// state. That state is what switches this page into "staff mode":
// a different (shorter) field set, and a Pending Approval redirect
// instead of Login on success.
export default function Register() {
  const navigate = useNavigate();
  const location = useLocation();
  const { register: registerCitizen, registerStaff, isLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const staffRole = location.state?.staffRole || null;
  const staffCode = location.state?.staffCode || null;
  const isStaffMode = Boolean(staffRole && staffCode);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      employeeId: '',
      licenseNumber: '',
    },
  });

  const passwordVal = watch('password', '');

  const getPasswordStrength = (pwd) => {
    if (!pwd) return { label: 'None', score: 0, color: 'bg-slate-200 dark:bg-white/10' };
    let score = 0;
    if (pwd.length >= 6) score += 1;
    if (/[A-Z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;
    if (score <= 1) return { label: 'Weak', score, color: 'bg-signal-rose' };
    if (score <= 3) return { label: 'Medium', score, color: 'bg-amber-500' };
    return { label: 'Strong', score, color: 'bg-emerald-500' };
  };

  const strength = getPasswordStrength(passwordVal);

  // Citizen: Registration -> Registration Successful -> redirect to
  // Login (account is active immediately, but this deliberately does
  // not auto-sign-in).
  //
  // Healthcare Worker: Registration -> account is created PENDING ->
  // redirect to the Pending Approval page. No login happens here.
  const onSubmit = async (values) => {
    const { confirmPassword, employeeId, licenseNumber, ...identity } = values;

    if (isStaffMode) {
      const result = await registerStaff({ ...identity, employeeId, licenseNumber, code: staffCode });
      if (result.success) {
        navigate(PATHS.PENDING_APPROVAL, { replace: true, state: { role: staffRole } });
      } else {
        toast.error(result.error || 'Unable to complete registration.');
      }
      return;
    }

    const result = await registerCitizen(identity);
    if (result.success) {
      toast.success('Registration successful! Please sign in.');
      navigate(PATHS.LOGIN, { replace: true });
    } else {
      toast.error(result.error || 'Unable to complete registration.');
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Left — illustration / highlights */}
      <div className="relative hidden overflow-hidden bg-gradient-to-br from-brand-600 via-brand-700 to-brand-900 lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          {FLOATERS.map(({ Icon, top, left, delay }, i) => (
            <motion.span
              key={i}
              className="absolute text-white/15"
              style={{ top, left }}
              animate={{ y: [0, -16, 0] }}
              transition={{ duration: 5 + i, repeat: Infinity, ease: 'easeInOut', delay }}
            >
              <Icon size={40} />
            </motion.span>
          ))}
          <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-24 -right-16 h-80 w-80 rounded-full bg-black/10 blur-3xl" />
        </div>

        <Link to={PATHS.HOME} className="relative z-10">
          <Logo variant="light" />
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative z-10"
        >
          <h2 className="font-display text-3xl font-semibold leading-snug text-white">
            {isStaffMode ? `Register as ${ROLE_LABELS[staffRole] || 'a Healthcare Worker'}` : 'Create your citizen account'}
          </h2>
          <p className="mt-3 max-w-md text-sm text-brand-50/80">
            {isStaffMode
              ? 'Your Staff Access Code has been verified. Complete your registration below — an Admin will review and approve your account.'
              : 'Join the digital healthcare grid — AI-powered symptom guidance, disease awareness, and your nearest PHC, in your language.'}
          </p>

          {!isStaffMode && (
          <div className="mt-8 space-y-3">
            {HIGHLIGHTS.map((h) => (
              <div key={h.text} className="flex items-center gap-3 rounded-xl bg-white/10 px-4 py-3 backdrop-blur-sm">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/15 text-white">
                  <h.icon className="h-4.5 w-4.5" aria-hidden="true" />
                </span>
                <p className="text-sm text-white/90">{h.text}</p>
              </div>
            ))}
          </div>
          )}
        </motion.div>

        <p className="relative z-10 text-xs text-brand-50/60">
          © {new Date().getFullYear()} HealthGuard AI — demo build, frontend-only auth.
        </p>
      </div>

      {/* Right — registration form */}
      <div className="flex items-center justify-center bg-aurora bg-dot-grid px-4 py-12 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="glass-panel w-full max-w-lg p-8 sm:p-10"
        >
          <div className="flex justify-center lg:hidden">
            <Logo />
          </div>

          <h1 className="mt-6 text-center font-display text-xl font-semibold text-slate-900 dark:text-white lg:mt-0">
            {isStaffMode ? `${ROLE_LABELS[staffRole] || 'Healthcare Worker'} Registration` : 'Create your account'}
          </h1>
          <p className="mt-1 text-center text-sm text-slate-500 dark:text-slate-400">
            {isStaffMode ? (
              <span className="inline-flex items-center gap-1.5 font-medium text-emerald-600 dark:text-emerald-400">
                <BadgeCheck className="h-4 w-4" /> Access code verified — role: {ROLE_LABELS[staffRole] || staffRole}
              </span>
            ) : (
              'For citizens. Healthcare workers register with a Staff Access Code.'
            )}
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4" noValidate>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="firstName" className="label-text">First Name</label>
                <div className="relative">
                  <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input id="firstName" type="text" placeholder="Jane" className="input-field pl-10" {...register('firstName', { required: 'First name is required' })} />
                </div>
                {errors.firstName && <p className="mt-1.5 text-xs text-signal-rose">{errors.firstName.message}</p>}
              </div>

              <div>
                <label htmlFor="lastName" className="label-text">Last Name</label>
                <div className="relative">
                  <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input id="lastName" type="text" placeholder="Doe" className="input-field pl-10" {...register('lastName', { required: 'Last name is required' })} />
                </div>
                {errors.lastName && <p className="mt-1.5 text-xs text-signal-rose">{errors.lastName.message}</p>}
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="email" className="label-text">Email address</label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    className="input-field pl-10"
                    {...register('email', {
                      required: 'Email is required',
                      pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email address' },
                    })}
                  />
                </div>
                {errors.email && <p className="mt-1.5 text-xs text-signal-rose">{errors.email.message}</p>}
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="phone" className="label-text">Mobile Number</label>
                <div className="relative">
                  <Phone className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    id="phone"
                    type="tel"
                    placeholder="+91 98765 43210"
                    className="input-field pl-10"
                    {...register('phone', { required: 'Mobile number is required' })}
                  />
                </div>
                {errors.phone && <p className="mt-1.5 text-xs text-signal-rose">{errors.phone.message}</p>}
              </div>

              {isStaffMode && (
                <div className={staffRole === ROLES.PHARMACIST ? '' : 'sm:col-span-2'}>
                  <label htmlFor="employeeId" className="label-text">Employee ID</label>
                  <div className="relative">
                    <BadgeCheck className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      id="employeeId"
                      type="text"
                      placeholder="EMP-1024"
                      className="input-field pl-10"
                      {...register('employeeId', { required: 'Employee ID is required' })}
                    />
                  </div>
                  {errors.employeeId && <p className="mt-1.5 text-xs text-signal-rose">{errors.employeeId.message}</p>}
                </div>
              )}

              {isStaffMode && staffRole === ROLES.PHARMACIST && (
                <div>
                  <label htmlFor="licenseNumber" className="label-text">License Number</label>
                  <div className="relative">
                    <BadgeCheck className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      id="licenseNumber"
                      type="text"
                      placeholder="PH-45210"
                      className="input-field pl-10"
                      {...register('licenseNumber', { required: 'License number is required for pharmacists' })}
                    />
                  </div>
                  {errors.licenseNumber && <p className="mt-1.5 text-xs text-signal-rose">{errors.licenseNumber.message}</p>}
                </div>
              )}

              <div>
                <label htmlFor="password" className="label-text">Password</label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="input-field pl-10 pr-10"
                    {...register('password', {
                      required: 'Password is required',
                      minLength: { value: 6, message: 'At least 6 characters' },
                    })}
                  />
                  <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && <p className="mt-1.5 text-xs text-signal-rose">{errors.password.message}</p>}
                {passwordVal && (
                  <div className="mt-2.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 dark:text-slate-400">Strength:</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-200">{strength.label}</span>
                    </div>
                    <div className="mt-1.5 grid grid-cols-4 gap-1">
                      {[1, 2, 3, 4].map((step) => (
                        <div key={step} className={`h-1.5 rounded-full transition-colors ${strength.score >= step ? strength.color : 'bg-slate-200 dark:bg-white/10'}`} />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="label-text">Confirm Password</label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="input-field pl-10 pr-10"
                    {...register('confirmPassword', {
                      required: 'Please confirm your password',
                      validate: (val) => val === passwordVal || 'Passwords do not match',
                    })}
                  />
                  <button type="button" onClick={() => setShowConfirmPassword((v) => !v)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="mt-1.5 text-xs text-signal-rose">{errors.confirmPassword.message}</p>}
              </div>

            </div>

            <Button type="submit" variant="primary" isLoading={isLoading} className="w-full">
              {!isLoading && (<>{isStaffMode ? 'Submit registration' : 'Create account'} <ArrowRight className="h-4 w-4" /></>)}
              {isLoading && 'Submitting…'}
            </Button>
          </form>

          {!isStaffMode && (
          <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
            Are you a healthcare worker?{' '}
            <Link to={PATHS.STAFF_ACCESS} className="font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400">
              Enter your Staff Access Code
            </Link>
          </p>
          )}

          <p className="mt-2 text-center text-sm text-slate-500 dark:text-slate-400">
            Already have an account?{' '}
            <Link to={PATHS.LOGIN} className="font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400">
              Login
            </Link>
          </p>

          <p className="mt-4 text-center text-sm text-slate-500 dark:text-slate-400">
            <Link to={PATHS.HOME} className="font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400">
              ← Back to home
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
