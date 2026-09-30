import React from 'react';
import WelcomeBanner from './sections/WelcomeBanner';
import OfficerEmergencyMonitoringCenter from './sections/OfficerEmergencyMonitoringCenter';
import DistrictOverviewWidget from './sections/DistrictOverviewWidget';
import QuickActions from './sections/QuickActions';
import RecentPHCEscalationsWidget from './widgets/RecentPHCEscalationsWidget';
import TodaysAlertsWidget from './sections/TodaysAlertsWidget';
import HealthStatisticsWidget from './sections/HealthStatisticsWidget';
import PublicHealthIntelligenceWidget from './widgets/PublicHealthIntelligenceWidget';
import AIPipelineAnalyticsWidget from './widgets/AIPipelineAnalyticsWidget';
import DiseaseIntelligenceSummaryWidget from './widgets/DiseaseIntelligenceSummaryWidget';
import CampaignSuccessWidget from './widgets/CampaignSuccessWidget';
import RecentActivitiesWidget from './sections/RecentActivitiesWidget';

export default function OfficerDashboard() {
  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <WelcomeBanner />

      {/* 2. Key Public Health Metrics (5 Core Cards) */}
      <DistrictOverviewWidget />

      {/* 3. Emergency Monitoring Center */}
      <OfficerEmergencyMonitoringCenter />

      {/* 4. Quick Action Navigation */}
      <QuickActions />

      {/* 4. Active PHC Referrals & Today's Surveillance Alerts */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RecentPHCEscalationsWidget />
        </div>
        <TodaysAlertsWidget />
      </div>

      {/* 5. District Disease Surveillance Trend */}
      <HealthStatisticsWidget />

      {/* 6. AI Public Health Intelligence Center */}
      <PublicHealthIntelligenceWidget />

      {/* 7. AI Case Classification & Ward Analytics */}
      <AIPipelineAnalyticsWidget />

      {/* 8. Disease Intelligence & Campaign Operations */}
      <div>
        <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
          Disease Intelligence & Field Campaigns
        </p>
        <div className="grid gap-6 lg:grid-cols-2">
          <DiseaseIntelligenceSummaryWidget />
          <CampaignSuccessWidget />
        </div>
      </div>

      {/* 9. Field Operations Audit Log */}
      <div>
        <RecentActivitiesWidget />
      </div>
    </div>
  );
}
