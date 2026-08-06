import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Compass } from 'lucide-react';
import Button from '../../components/common/Button';
import { PATHS } from '../../constants/routes';

import React from 'react';

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-aurora bg-dot-grid px-6 text-center">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="glass-panel flex max-w-md flex-col items-center gap-4 p-10"
      >
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-400">
          <Compass className="h-7 w-7" aria-hidden="true" />
        </span>
        <p className="font-display text-5xl font-semibold text-slate-900 dark:text-white">404</p>
        <h1 className="text-lg font-semibold text-slate-900 dark:text-white">Page not found</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          The page you're looking for doesn't exist or may have moved.
        </p>
        <Link to={PATHS.HOME}>
          <Button variant="primary">Back to home</Button>
        </Link>
      </motion.div>
    </div>
  );
}
