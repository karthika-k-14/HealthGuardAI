import React, { useEffect, useState, useCallback } from 'react';
import { RefreshCw, Radio, CheckCircle2, Clock } from 'lucide-react';
import WelcomeBanner from './sections/WelcomeBanner';
import DashboardStatistics from './sections/DashboardStatistics';
import TodaysOrdersWidget from './sections/TodaysOrdersWidget';
import LowStockSummaryWidget from './sections/LowStockSummaryWidget';
import ExpiringMedicinesWidget from './sections/ExpiringMedicinesWidget';
import RecentActivitiesWidget from './sections/RecentActivitiesWidget';
import QuickActions from './sections/QuickActions';
import NotificationPreviewCard from '../../components/cards/NotificationPreviewCard';

import AIStockPredictionWidget from './widgets/AIStockPredictionWidget';
import MedicineRecommendationWidget from './widgets/MedicineRecommendationWidget';
import SmartInventoryScoreWidget from './widgets/SmartInventoryScoreWidget';
import DailyInsightsWidget from './widgets/DailyInsightsWidget';
import { fetchPharmacistDashboardSettings } from '../../api/pharmacyApi';

export default function PharmacistDashboard() {
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());

  // 1. Fetch dashboard auto-refresh setting on mount
  useEffect(() => {
    let mounted = true;
    fetchPharmacistDashboardSettings()
      .then((data) => {
        if (mounted && data?.autoRefreshEnabled !== undefined) {
          setAutoRefreshEnabled(Boolean(data.autoRefreshEnabled));
        }
      })
      .catch((err) => {
        console.error('Failed to load pharmacist dashboard settings:', err);
      });
    return () => {
      mounted = false;
    };
  }, []);

  // 2. Set up 30-second interval when Auto Refresh is enabled
  useEffect(() => {
    if (!autoRefreshEnabled) return;

    const timer = setInterval(() => {
      setRefreshKey((prev) => prev + 1);
      setLastRefreshed(new Date());
    }, 30000);

    return () => clearInterval(timer);
  }, [autoRefreshEnabled]);

  // Manual refresh handler
  const handleManualRefresh = useCallback(() => {
    setIsRefreshing(true);
    setRefreshKey((prev) => prev + 1);
    setLastRefreshed(new Date());
    setTimeout(() => {
      setIsRefreshing(false);
    }, 500);
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Banner & Real-time Auto-Refresh Status Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1">
          <WelcomeBanner />
        </div>
      </div>

      {/* Auto Refresh & Sync Status Bar */}
      <div className="surface-card flex flex-wrap items-center justify-between gap-3 px-5 py-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-medium">
            {autoRefreshEnabled ? (
              <>
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
                </span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400" id="status-autorefresh">
                  Auto Refresh: Active (30s)
                </span>
              </>
            ) : (
              <>
                <span className="h-2.5 w-2.5 rounded-full bg-slate-300 dark:bg-slate-600"></span>
                <span className="font-medium text-slate-500 dark:text-slate-400" id="status-autorefresh">
                  Auto Refresh: Disabled
                </span>
              </>
            )}
          </div>
          <span className="text-slate-300 dark:text-white/20">|</span>
          <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
            <Clock className="h-3 w-3" />
            <span>Updated: {lastRefreshed.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
          </div>
        </div>

        <button
          type="button"
          id="btn-manual-refresh-dashboard"
          onClick={handleManualRefresh}
          disabled={isRefreshing}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white/80 px-3 py-1.5 font-semibold text-slate-700 shadow-sm transition-all hover:border-brand-400 hover:text-brand-600 active:scale-95 disabled:opacity-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin text-brand-600' : ''}`} />
          <span>Refresh Now</span>
        </button>
      </div>

      {/* Analytics & Inventory Statistics */}
      <DashboardStatistics key={`stats-${refreshKey}`} />

      <QuickActions />

      {/* Dispensing Orders, Low Stock Alerts & Expiry Alerts */}
      <div className="grid gap-6 lg:grid-cols-3">
        <TodaysOrdersWidget key={`orders-${refreshKey}`} />
        <LowStockSummaryWidget key={`lowstock-${refreshKey}`} />
        <ExpiringMedicinesWidget key={`expiring-${refreshKey}`} />
      </div>

      {/* Activities & Notification Preview (Notification counts) */}
      <div className="grid gap-6 lg:grid-cols-2">
        <RecentActivitiesWidget key={`activities-${refreshKey}`} />
        <NotificationPreviewCard key={`notifications-${refreshKey}`} />
      </div>

      {/* Smart Pharmacy Tools: Demand Predictions, Recommendations & Inventory Health */}
      <div>
        <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
          Smart Pharmacy Tools
        </p>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <AIStockPredictionWidget key={`prediction-${refreshKey}`} />
          <MedicineRecommendationWidget key={`recommendation-${refreshKey}`} />
          <SmartInventoryScoreWidget key={`score-${refreshKey}`} />
          <DailyInsightsWidget key={`insights-${refreshKey}`} />
        </div>
      </div>
    </div>
  );
}
