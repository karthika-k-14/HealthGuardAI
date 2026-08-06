import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import Button from '../../components/common/Button';
import Logo from '../../components/common/Logo';
import { Spinner } from '../../components/common/Loader';
import { useAuth } from '../../contexts/AuthContext';
import { ROLE_HOME_ROUTE } from '../../constants/roles';
import { fetchOnboardingSlides } from '../../api/onboardingApi';
import { getIcon } from '../../utils/iconRegistry';
import { cn } from '../../utils/cn';
import { useLanguage } from '../../contexts/LanguageContext';

export default function Onboarding() {
  const [slides, setSlides] = useState(null);
  const [step, setStep] = useState(0);
  const { role, completeOnboarding } = useAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();

  useEffect(() => {
    let mounted = true;
    fetchOnboardingSlides().then((data) => {
      if (mounted) setSlides(data);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const finish = () => {
    completeOnboarding();
    navigate(ROLE_HOME_ROUTE[role] || '/', { replace: true });
  };

  if (!slides) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-aurora bg-dot-grid">
        <Spinner size={28} />
      </div>
    );
  }

  const isLast = step === slides.length - 1;
  const current = slides[step];
  const Icon = getIcon(current.icon);

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-aurora bg-dot-grid px-4 py-10 sm:px-6">
      <div className="mb-8">
        <Logo />
      </div>

      <div className="glass-panel w-full max-w-lg overflow-hidden p-8 text-center sm:p-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.3 }}
          >
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-400">
              <Icon className="h-8 w-8" aria-hidden="true" />
            </span>
            <h1 className="mt-6 font-display text-2xl font-semibold text-slate-900 dark:text-white">
              {t(current.title)}
            </h1>
            <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">{t(current.description)}</p>
          </motion.div>
        </AnimatePresence>

        {/* Step dots */}
        <div className="mt-8 flex items-center justify-center gap-2">
          {slides.map((s, i) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setStep(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={cn(
                'h-1.5 rounded-full transition-all',
                i === step ? 'w-6 bg-brand-500' : 'w-1.5 bg-slate-300 dark:bg-white/15'
              )}
            />
          ))}
        </div>

        <div className="mt-8 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={finish}
            className="text-sm font-medium text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            {t('Skip')}
          </button>

          <div className="flex items-center gap-2">
            {step > 0 && (
              <Button variant="secondary" onClick={() => setStep((s) => s - 1)}>
                <ArrowLeft className="h-4 w-4" /> {t('Previous')}
              </Button>
            )}
            {!isLast && (
              <Button variant="primary" onClick={() => setStep((s) => s + 1)}>
                {t('Next')} <ArrowRight className="h-4 w-4" />
              </Button>
            )}
            {isLast && (
              <Button variant="primary" onClick={finish}>
                {t('Get Started')} <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
