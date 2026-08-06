import React, { createContext, useContext, useCallback, useMemo, useState } from 'react';
import { getJSON, setJSON } from '../utils/storage';

const DashboardContext = createContext(undefined);

const WIDGET_PREFS_KEY = 'hg_dashboard_widget_prefs';

/**
 * Cross-cutting dashboard-shell state that multiple layout pieces
 * need (Sidebar, AppTopbar, Layout) plus per-widget show/hide
 * preferences (consumed by dashboards that offer customization, e.g.
 * the Admin dashboard's DashboardCustomizationWidget). Kept separate
 * from AuthContext/ThemeContext since this is UI-shell state, not
 * session or appearance state.
 */
export function DashboardProvider({ children }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [widgetPrefs, setWidgetPrefs] = useState(() => getJSON(WIDGET_PREFS_KEY, {}));

  const openMobileNav = useCallback(() => setMobileNavOpen(true), []);
  const closeMobileNav = useCallback(() => setMobileNavOpen(false), []);
  const toggleMobileNav = useCallback(() => setMobileNavOpen((v) => !v), []);

  const isWidgetVisible = useCallback((key) => widgetPrefs[key] !== false, [widgetPrefs]);

  const toggleWidget = useCallback((key) => {
    setWidgetPrefs((prev) => {
      const next = { ...prev, [key]: prev[key] === false ? true : false };
      setJSON(WIDGET_PREFS_KEY, next);
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({
      mobileNavOpen,
      openMobileNav,
      closeMobileNav,
      toggleMobileNav,
      widgetPrefs,
      isWidgetVisible,
      toggleWidget,
    }),
    [mobileNavOpen, openMobileNav, closeMobileNav, toggleMobileNav, widgetPrefs, isWidgetVisible, toggleWidget]
  );

  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>;
}

export function useDashboard() {
  const ctx = useContext(DashboardContext);
  if (!ctx) throw new Error('useDashboard must be used within a DashboardProvider');
  return ctx;
}
