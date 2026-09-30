import WelcomeBanner from './sections/WelcomeBanner';
import AshaEmergencyAlertsSection from './sections/AshaEmergencyAlertsSection';
import TodaysTasksWidget from './sections/TodaysTasksWidget';
import AssignedCitizensSummaryWidget from './sections/AssignedCitizensSummaryWidget';
import AssignedFamiliesWidget from './sections/AssignedFamiliesWidget';
import HighRiskAlertsWidget from './sections/HighRiskAlertsWidget';
import RecentActivitiesWidget from './sections/RecentActivitiesWidget';
import QuickActions from './sections/QuickActions';
import NotificationPreviewCard from '../../components/cards/NotificationPreviewCard';

import VillageHealthScoreWidget from './widgets/VillageHealthScoreWidget';
import DailyVisitProgressWidget from './widgets/DailyVisitProgressWidget';
import NewCitizenCasesWidget from './widgets/NewCitizenCasesWidget';
import AIUrgentCasesWidget from './widgets/AIUrgentCasesWidget';

import React from 'react';

export default function AshaDashboard() {
  return (
    <div className="space-y-6">
      <WelcomeBanner />

      {/* Primary Emergency Alert Center */}
      <AshaEmergencyAlertsSection />

      <NewCitizenCasesWidget />
      <AIUrgentCasesWidget />

      <QuickActions />

      {/* Caseload & Daily Tasks (Balanced 3-Column Grid) */}
      <div className="grid gap-6 lg:grid-cols-3">
        <AssignedCitizensSummaryWidget />
        <TodaysTasksWidget />
        <AssignedFamiliesWidget />
      </div>

      {/* High-Risk Operations & Audit (Balanced 3-Column Grid) */}
      <div className="grid gap-6 lg:grid-cols-3">
        <HighRiskAlertsWidget />
        <RecentActivitiesWidget />
        <NotificationPreviewCard />
      </div>

      {/* Field Health Intelligence (Balanced 2-Column Grid) */}
      <div>
        <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
          Field Intelligence
        </p>
        <div className="grid gap-6 sm:grid-cols-2">
          <VillageHealthScoreWidget />
          <DailyVisitProgressWidget />
        </div>
      </div>
    </div>
  );
}
