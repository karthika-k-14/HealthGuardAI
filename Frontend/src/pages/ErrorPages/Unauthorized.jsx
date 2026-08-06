import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldAlert } from 'lucide-react';
import Button from '../../components/common/Button';
import { useAuth } from '../../contexts/AuthContext';
import { ROLE_HOME_ROUTE } from '../../constants/roles';
import { PATHS } from '../../constants/routes';

import React from 'react';

export default function Unauthorized() {
  const { isAuthenticated, role } = useAuth();
  const homeLink = isAuthenticated ? ROLE_HOME_ROUTE[role] || PATHS.HOME : PATHS.HOME;

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-aurora bg-dot-grid px-6 text-center">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="glass-panel flex max-w-md flex-col items-center gap-4 p-10"
      >
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-signal-rose/10 text-signal-rose">
          <ShieldAlert className="h-7 w-7" aria-hidden="true" />
        </span>
        <h1 className="text-lg font-semibold text-slate-900 dark:text-white">Access restricted</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Your account role doesn't have permission to view this page.
        </p>
        <Link to={homeLink}>
          <Button variant="primary">{isAuthenticated ? 'Go to my dashboard' : 'Back to home'}</Button>
        </Link>
      </motion.div>
    </div>
  );
}
