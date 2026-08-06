import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ServerCrash } from 'lucide-react';
import Button from '../../components/common/Button';
import { PATHS } from '../../constants/routes';

import React from 'react';

export default function ServerError() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-aurora bg-dot-grid px-6 text-center">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="glass-panel flex max-w-md flex-col items-center gap-4 p-10"
      >
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-signal-rose/10 text-signal-rose">
          <ServerCrash className="h-7 w-7" aria-hidden="true" />
        </span>
        <p className="font-display text-5xl font-semibold text-slate-900 dark:text-white">500</p>
        <h1 className="text-lg font-semibold text-slate-900 dark:text-white">Something went wrong on our end</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Our team has been notified. Please try again in a moment.
        </p>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => window.location.reload()}>
            Retry
          </Button>
          <Link to={PATHS.HOME}>
            <Button variant="primary">Back to home</Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
