import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Sidebar from './sidebar/Sidebar';
import AppTopbar from './navbar/AppTopbar';
import { useDashboard } from '../../contexts/DashboardContext';
import ErrorBoundary from '../common/ErrorBoundary';

import React from 'react';

export default function Layout() {
  const { mobileNavOpen, closeMobileNav, openMobileNav } = useDashboard();
  const location = useLocation();

  return (
    <div className="min-h-screen bg-surface-light dark:bg-surface-dark lg:flex">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-brand-500 focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-white"
      >
        Skip to main content
      </a>
      <Sidebar mobileOpen={mobileNavOpen} onClose={closeMobileNav} />

      <div className="flex min-h-screen flex-1 flex-col">
        <AppTopbar onMenuClick={openMobileNav} />
        <main id="main-content" className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
            >
              <ErrorBoundary key={location.pathname}>
                <Outlet />
              </ErrorBoundary>
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
