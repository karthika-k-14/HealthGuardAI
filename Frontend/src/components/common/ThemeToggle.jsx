import { Moon, Sun } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';

import React from 'react';

export default function ThemeToggle({ className }) {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-pressed={isDark}
      className={`relative inline-flex h-9 w-16 items-center rounded-full border border-slate-300 dark:border-white/10 bg-slate-100 dark:bg-white/5 transition-colors ${className || ''}`}
    >
      <motion.span
        className="absolute left-1 flex h-7 w-7 items-center justify-center rounded-full bg-white dark:bg-surface-darkcard shadow-sm"
        animate={{ x: isDark ? 28 : 0 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      >
        {isDark ? (
          <Moon className="h-4 w-4 text-brand-400" aria-hidden="true" />
        ) : (
          <Sun className="h-4 w-4 text-signal-amber" aria-hidden="true" />
        )}
      </motion.span>
    </button>
  );
}
