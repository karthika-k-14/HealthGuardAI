import WelcomeBanner from './sections/WelcomeBanner';
import TodaysTasksWidget from './sections/TodaysTasksWidget';
import AssignedCitizensSummaryWidget from './sections/AssignedCitizensSummaryWidget';
import AssignedFamiliesWidget from './sections/AssignedFamiliesWidget';
import VisitSummaryWidget from './sections/VisitSummaryWidget';
import HighRiskAlertsWidget from './sections/HighRiskAlertsWidget';
import RecentActivitiesWidget from './sections/RecentActivitiesWidget';
import QuickActions from './sections/QuickActions';
import NotificationPreviewCard from '../../components/cards/NotificationPreviewCard';

import VillageHealthScoreWidget from './widgets/VillageHealthScoreWidget';
import AIRiskPredictionWidget from './widgets/AIRiskPredictionWidget';
import DailyVisitProgressWidget from './widgets/DailyVisitProgressWidget';
import CommunityHeatmapWidget from './widgets/CommunityHeatmapWidget';
import OfflineSyncWidget from './widgets/OfflineSyncWidget';
import VoiceNoteWidget from './widgets/VoiceNoteWidget';
import MedicineRequestWidget from './widgets/MedicineRequestWidget';
import NewCitizenCasesWidget from './widgets/NewCitizenCasesWidget';
import AIUrgentCasesWidget from './widgets/AIUrgentCasesWidget';

import React from 'react';

export default function AshaDashboard() {
  return (
    <div className="space-y-6">
      <WelcomeBanner />

      <NewCitizenCasesWidget />
      <AIUrgentCasesWidget />

      <QuickActions />

      <div className="grid gap-6 lg:grid-cols-3">
        <AssignedCitizensSummaryWidget />
        <TodaysTasksWidget />
        <AssignedFamiliesWidget />
        <VisitSummaryWidget />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <HighRiskAlertsWidget />
        <RecentActivitiesWidget />
        <NotificationPreviewCard />
      </div>

      <div>
        <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
          Field Intelligence
        </p>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <VillageHealthScoreWidget />
          <AIRiskPredictionWidget />
          <DailyVisitProgressWidget />
          <CommunityHeatmapWidget />
          <OfflineSyncWidget />
          <VoiceNoteWidget />
        </div>
      </div>

      <MedicineRequestWidget />
    </div>
  );
}
