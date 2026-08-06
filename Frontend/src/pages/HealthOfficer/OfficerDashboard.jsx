import WelcomeBanner from './sections/WelcomeBanner';
import DistrictOverviewWidget from './sections/DistrictOverviewWidget';
import TodaysAlertsWidget from './sections/TodaysAlertsWidget';
import HealthStatisticsWidget from './sections/HealthStatisticsWidget';
import EmergencyPanelWidget from './sections/EmergencyPanelWidget';
import RecentActivitiesWidget from './sections/RecentActivitiesWidget';
import QuickActions from './sections/QuickActions';
import NotificationPreviewCard from '../../components/cards/NotificationPreviewCard';

import LiveCommandCenterWidget from './widgets/LiveCommandCenterWidget';
import DistrictHealthScoreWidget from './widgets/DistrictHealthScoreWidget';
import AIOutbreakPredictionWidget from './widgets/AIOutbreakPredictionWidget';
import EmergencyResponseTimelineWidget from './widgets/EmergencyResponseTimelineWidget';
import ResourceAllocationWidget from './widgets/ResourceAllocationWidget';
import MedicineDemandWidget from './widgets/MedicineDemandWidget';
import CampaignSuccessWidget from './widgets/CampaignSuccessWidget';
import AIDecisionSupportWidget from './widgets/AIDecisionSupportWidget';
import PendingCaseReviewsWidget from './widgets/PendingCaseReviewsWidget';
import AIPipelineAnalyticsWidget from './widgets/AIPipelineAnalyticsWidget';
import PublicHealthIntelligenceWidget from './widgets/PublicHealthIntelligenceWidget';

import React from 'react';

export default function OfficerDashboard() {
  return (
    <div className="space-y-6">
      <WelcomeBanner />

      <PendingCaseReviewsWidget />

      <AIPipelineAnalyticsWidget />

      <PublicHealthIntelligenceWidget />

      <DistrictOverviewWidget />

      <QuickActions />

      <div className="grid gap-6 lg:grid-cols-3">
        <TodaysAlertsWidget />
        <div className="lg:col-span-2">
          <HealthStatisticsWidget />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <EmergencyPanelWidget />
        <RecentActivitiesWidget />
        <NotificationPreviewCard />
      </div>

      <div>
        <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
          Command Center Intelligence
        </p>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <LiveCommandCenterWidget />
          <DistrictHealthScoreWidget />
          <AIOutbreakPredictionWidget />
          <EmergencyResponseTimelineWidget />
          <ResourceAllocationWidget />
          <MedicineDemandWidget />
          <CampaignSuccessWidget />
          <AIDecisionSupportWidget />
        </div>
      </div>
    </div>
  );
}
