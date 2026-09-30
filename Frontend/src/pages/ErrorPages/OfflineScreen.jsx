import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff } from 'lucide-react';

import React from 'react';

/**
 * Full-screen offline banner. Mounted once near the app root and
 * driven by the browser's online/offline events (see useOnlineStatus
 * hook) — not a route, since it needs to appear over whatever page
 * the person is currently on.
 */
export default function OfflineScreen({ visible }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: -60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -60, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-x-0 top-0 z-[200] flex items-center justify-center gap-2 bg-signal-rose px-4 py-2.5 text-sm font-medium text-white shadow-lg"
          role="alert"
        >
          <WifiOff className="h-4 w-4" aria-hidden="true" />
          You&apos;re offline. Some features may not work until your connection is restored.
        </motion.div>
      )}
    </AnimatePresence>
  );
}
