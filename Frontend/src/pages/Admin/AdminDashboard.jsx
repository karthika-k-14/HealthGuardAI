import WelcomeBanner from './sections/WelcomeBanner';
import PlatformStatistics from './sections/PlatformStatistics';
import RecentActivitiesWidget from './sections/RecentActivitiesWidget';
import SystemStatusWidget from './sections/SystemStatusWidget';
import QuickActions from './sections/QuickActions';
import NotificationPreviewCard from '../../components/cards/NotificationPreviewCard';

import SmartNotificationsWidget from './widgets/SmartNotificationsWidget';
import DashboardCustomizationWidget from './widgets/DashboardCustomizationWidget';
import PendingApprovalsWidget from './widgets/PendingApprovalsWidget';
import CasePipelineWidget from './widgets/CasePipelineWidget';

import React from 'react';

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <WelcomeBanner />

      <PlatformStatistics />

      <CasePipelineWidget />

      <QuickActions />

      <div className="grid gap-6 lg:grid-cols-3">
        <SystemStatusWidget />
        <RecentActivitiesWidget />
        <NotificationPreviewCard />
      </div>

      <div className="grid gap-6 lg:grid-cols-1">
        <PendingApprovalsWidget />
      </div>

      <div>
        <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
          Command Center Tools
        </p>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-2">
          <SmartNotificationsWidget />
          <DashboardCustomizationWidget />
        </div>
      </div>
    </div>
  );
}
