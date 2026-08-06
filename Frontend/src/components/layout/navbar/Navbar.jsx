import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Logo from '../../common/Logo';
import ThemeToggle from '../../common/ThemeToggle';
import LanguageSelector from '../../common/LanguageSelector';
import Button from '../../common/Button';
import { PATHS } from '../../../constants/routes';
import { useLanguage } from '../../../contexts/LanguageContext';

const NAV_LINKS = [
  { label: 'Home', href: '#overview' },
  { label: 'Features', href: '#features' },
  { label: 'AI Assistant', href: '#ai-assistant' },
  { label: 'Disease Awareness', href: '#disease-awareness' },
  { label: 'Hospitals', href: '#hospitals' },
  { label: 'Government Schemes', href: '#government-schemes' },
  { label: 'Contact', href: '#footer-contact' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { t } = useLanguage();

  return (
    <header className="sticky top-0 z-50 w-full bg-surface-light/80 dark:bg-surface-dark/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3">
        <div className="glass-panel flex w-full items-center justify-between gap-4 px-4 py-2.5 sm:px-6">
          
          {/* Left Column: Logo */}
          <div className="flex shrink-0 items-center">
            <Link to={PATHS.HOME} aria-label="HealthGuard AI home">
              <Logo />
            </Link>
          </div>

          {/* Center Column: Navigation Links (visible on desktop) */}
          <nav 
            className="hidden flex-1 items-center justify-center gap-2 px-2 overflow-hidden xl:flex" 
            aria-label="Primary"
          >
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="whitespace-nowrap rounded-lg px-2.5 py-1.5 text-[13px] lg:text-sm font-medium text-slate-600 transition-colors hover:text-brand-600 dark:text-slate-300 dark:hover:text-brand-400"
              >
                {t(link.label)}
              </a>
            ))}
          </nav>

          {/* Right Column: Actions (visible on desktop) */}
          <div className="hidden shrink-0 items-center gap-2 xl:flex">
            <LanguageSelector />
            <ThemeToggle />
            <NavLink to={PATHS.LOGIN}>
              <Button variant="secondary" className="px-3.5 py-2 text-xs lg:text-sm">
                {t('Login')}
              </Button>
            </NavLink>
            <NavLink to={PATHS.LOGIN}>
              <Button variant="primary" className="px-3.5 py-2 text-xs lg:text-sm">
                {t('Get Started')}
              </Button>
            </NavLink>
          </div>

          {/* Hamburger Menu Toggle (visible below desktop) */}
          <div className="flex items-center gap-2 xl:hidden">
            <LanguageSelector />
            <ThemeToggle />
            <button
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200"
              onClick={() => setOpen((v) => !v)}
              aria-label={open ? 'Close menu' : 'Open menu'}
              aria-expanded={open}
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile / Tablet Overlay Menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="mx-4 mb-3 overflow-hidden rounded-2xl glass px-5 py-4 xl:hidden"
          >
            <nav className="flex flex-col gap-3.5" aria-label="Mobile">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="rounded-lg py-1.5 text-sm font-medium text-slate-700 hover:text-brand-600 dark:text-slate-200 dark:hover:text-brand-400"
                >
                  {t(link.label)}
                </a>
              ))}
              <hr className="border-slate-200 dark:border-white/10 my-1" />
              <div className="flex items-center justify-end gap-2.5">
                <NavLink to={PATHS.LOGIN} onClick={() => setOpen(false)}>
                  <Button variant="secondary" className="text-xs py-2 px-3.5">
                    {t('Login')}
                  </Button>
                </NavLink>
                <NavLink to={PATHS.LOGIN} onClick={() => setOpen(false)}>
                  <Button variant="primary" className="text-xs py-2 px-3.5">
                    {t('Get Started')}
                  </Button>
                </NavLink>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

