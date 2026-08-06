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
  ArrowRight,
  ShieldCheck,
  Activity,
  MapPinned,
  HeartPulse,
  Stethoscope,
} from 'lucide-react';
import Button from '../../components/common/Button';
import Logo from '../../components/common/Logo';
import { useAuth } from '../../contexts/AuthContext';
import { PATHS } from '../../constants/routes';
import { ROLE_LABELS } from '../../constants/roles';

const DEMO_ACCOUNTS = [
  { email: 'ananya.sharma@healthguard.in', password: 'demo1234', role: ROLE_LABELS.citizen },
  { email: 'lakshmi.devi@healthguard.in', password: 'demo1234', role: ROLE_LABELS.asha },
  { email: 'rahul.menon@healthguard.in', password: 'demo1234', role: ROLE_LABELS.pharmacist },
  { email: 'priya.raghunathan@healthguard.in', password: 'demo1234', role: ROLE_LABELS.officer },
  { email: 'admin@healthguard.com', password: 'Admin@123', role: ROLE_LABELS.admin },
];

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

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const { login, continueAsGuest, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({ defaultValues: { email: '', password: '' } });

  const goAfterAuth = (redirectTo) => {
    const target = location.state?.from?.pathname || redirectTo || PATHS.HOME;
    navigate(target, { replace: true });
  };

  const onSubmit = async (values) => {
    const result = await login(values);
    if (result.success) {
      toast.success('Signed in successfully');
      goAfterAuth(result.redirectTo);
    } else if (result.status) {
      // Account exists but isn't ACTIVE yet (or no longer is) — show
      // the same page a fresh staff registration lands on, with the
      // right status-specific message.
      navigate(PATHS.PENDING_APPROVAL, { state: { status: result.status } });
    } else {
      toast.error(result.error || 'Unable to sign in');
    }
  };

  const handleGuest = async () => {
    const result = await continueAsGuest();
    if (result.success) {
      toast.success('Continuing as guest');
      goAfterAuth(result.redirectTo);
    } else {
      toast.error(result.error || 'Unable to continue as guest');
    }
  };

  const handleGoogleLogin = () => {
    toast('Google sign-in is a UI preview in this demo build.', { icon: 'ℹ️' });
  };

  const handleForgotPassword = () => {
    toast('Password reset isn\u2019t available in this demo build.', { icon: 'ℹ️' });
  };

  const fillDemo = (email, password) => {
    setValue('email', email);
    setValue('password', password);
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
            One platform for early health response
          </h2>
          <p className="mt-3 max-w-md text-sm text-brand-50/80">
            Citizens, ASHA workers, pharmacists, and health officers — all working from
            the same real-time picture.
          </p>

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
        </motion.div>

        <p className="relative z-10 text-xs text-brand-50/60">
          © {new Date().getFullYear()} HealthGuard AI — Powered by Spring Boot & PostgreSQL backend.
        </p>
      </div>

      {/* Right — login form */}
      <div className="flex items-center justify-center bg-aurora bg-dot-grid px-4 py-12 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="glass-panel w-full max-w-md p-8 sm:p-10"
        >
          <div className="flex justify-center lg:hidden">
            <Logo />
          </div>

          <h1 className="mt-6 text-center font-display text-xl font-semibold text-slate-900 dark:text-white lg:mt-0">
            Sign in to your workspace
          </h1>
          <p className="mt-1 text-center text-sm text-slate-500 dark:text-slate-400">
            Role-based access — redirected to your dashboard automatically after sign-in.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5" noValidate>
            <div>
              <label htmlFor="email" className="label-text">
                Email address
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@healthguard.in"
                  className="input-field pl-10"
                  {...register('email', {
                    required: 'Email is required',
                    pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email address' },
                  })}
                />
              </div>
              {errors.email && <p className="mt-1.5 text-xs text-signal-rose">{errors.email.message}</p>}
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="label-text">
                  Password
                </label>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="mb-1.5 text-xs font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="input-field pl-10 pr-10"
                  {...register('password', {
                    required: 'Password is required',
                    minLength: { value: 4, message: 'Password must be at least 4 characters' },
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="mt-1.5 text-xs text-signal-rose">{errors.password.message}</p>}
            </div>

            <label className="flex select-none items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500 dark:border-white/20"
              />
              Remember me
            </label>

            <Button type="submit" variant="primary" isLoading={isLoading} className="w-full">
              {!isLoading && (
                <>
                  Sign in <ArrowRight className="h-4 w-4" />
                </>
              )}
              {isLoading && 'Signing in…'}
            </Button>
          </form>

          <div className="mt-5 flex items-center gap-3">
            <span className="h-px flex-1 bg-slate-200 dark:bg-white/10" />
            <span className="text-xs uppercase tracking-wide text-slate-400">or</span>
            <span className="h-px flex-1 bg-slate-200 dark:bg-white/10" />
          </div>

          <div className="mt-5 space-y-2.5">
            <Button variant="secondary" className="w-full" onClick={handleGoogleLogin}>
              <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
                <path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.2-2.27H12v4.3h6.47a5.53 5.53 0 0 1-2.4 3.63v3h3.88c2.27-2.09 3.54-5.17 3.54-8.66z" />
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.87-3a7.4 7.4 0 0 1-11-3.9H1.08v3.1A12 12 0 0 0 12 24z" />
                <path fill="#FBBC05" d="M5.06 14.19a7.2 7.2 0 0 1 0-4.38v-3.1H1.08a12 12 0 0 0 0 10.58l3.98-3.1z" />
                <path fill="#EA4335" d="M12 4.77c1.77 0 3.35.6 4.6 1.8l3.42-3.42C17.94 1.19 15.24 0 12 0 7.31 0 3.26 2.69 1.08 6.62l3.98 3.1A7.18 7.18 0 0 1 12 4.77z" />
              </svg>
              Continue with Google
            </Button>
            <Button variant="ghost" className="w-full" onClick={handleGuest} isLoading={isLoading}>
              Continue as Guest
            </Button>
          </div>

          <div className="mt-8 border-t border-slate-200/70 pt-6 dark:border-white/10">
            <p className="text-center text-xs font-medium uppercase tracking-wide text-slate-400">
              Prefill Login Credentials
            </p>
            <div className="mt-3 flex flex-wrap justify-center gap-2">
              {DEMO_ACCOUNTS.map((acc) => (
                <button
                  key={acc.email}
                  type="button"
                  onClick={() => fillDemo(acc.email, acc.password)}
                  className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:border-brand-400 hover:text-brand-600 dark:border-white/10 dark:text-slate-300 dark:hover:text-brand-400"
                >
                  {acc.role}
                </button>
              ))}
            </div>
          </div>

          <p className="mt-4 text-center text-sm text-slate-500 dark:text-slate-400">
            Don't have an account?{' '}
            <Link to={PATHS.REGISTER} className="font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400">
              Create an account
            </Link>
          </p>

          <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
            <Link to={PATHS.HOME} className="font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400">
              ← Back to home
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
