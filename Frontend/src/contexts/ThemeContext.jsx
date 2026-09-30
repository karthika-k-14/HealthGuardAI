import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { STORAGE_KEYS } from '../constants/storageKeys';
import { getItem, setItem } from '../utils/storage';

const ThemeContext = createContext(undefined);

function getInitialTheme() {
  const stored = getItem(STORAGE_KEYS.THEME);
  if (stored === 'light' || stored === 'dark') return stored;
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'light';
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
    setItem(STORAGE_KEYS.THEME, theme);
  }, [theme]);

  // Load saved theme for Pharmacist on mount/session start
  useEffect(() => {
    const role = getItem(STORAGE_KEYS.ROLE);
    const token = getItem(STORAGE_KEYS.TOKEN);
    if (token && (role === 'PHARMACIST' || role === 'pharmacist')) {
      import('../api/pharmacyApi').then(({ fetchPharmacistAppearanceSettings }) => {
        fetchPharmacistAppearanceSettings().then((res) => {
          if (res?.theme && (res.theme === 'dark' || res.theme === 'light')) {
            setTheme(res.theme);
          }
        }).catch(() => {});
      });
    }
  }, []);

  const value = useMemo(
    () => ({
      theme,
      isDark: theme === 'dark',
      setTheme,
      toggleTheme: () => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark')),
    }),
    [theme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider');
  return ctx;
}
