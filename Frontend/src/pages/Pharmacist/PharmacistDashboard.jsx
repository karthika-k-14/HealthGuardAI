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
import BarcodeScannerWidget from './widgets/BarcodeScannerWidget';
import MedicineComparisonWidget from './widgets/MedicineComparisonWidget';
import DrugInteractionCheckerWidget from './widgets/DrugInteractionCheckerWidget';
import PendingReferralsWidget from './widgets/PendingReferralsWidget';

import React from 'react';

export default function PharmacistDashboard() {
  return (
    <div className="space-y-6">
      <WelcomeBanner />

      <PendingReferralsWidget />

      <DashboardStatistics />

      <QuickActions />

      <div className="grid gap-6 lg:grid-cols-3">
        <TodaysOrdersWidget />
        <LowStockSummaryWidget />
        <ExpiringMedicinesWidget />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <RecentActivitiesWidget />
        <NotificationPreviewCard />
      </div>

      <div>
        <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
          Smart Pharmacy Tools
        </p>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <AIStockPredictionWidget />
          <MedicineRecommendationWidget />
          <SmartInventoryScoreWidget />
          <DailyInsightsWidget />
          <BarcodeScannerWidget />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <MedicineComparisonWidget />
        <DrugInteractionCheckerWidget />
      </div>
    </div>
  );
}
