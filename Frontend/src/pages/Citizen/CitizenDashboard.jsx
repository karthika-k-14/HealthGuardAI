import { useTranslation } from 'react-i18next';
import WelcomeBanner from './sections/WelcomeBanner';
import HealthScoreCard from './sections/HealthScoreCard';
import HealthTipsWidget from './sections/HealthTipsWidget';
import QuickActions from './sections/QuickActions';
import RecentActivityWidget from './sections/RecentActivityWidget';
import AnalyticsPreviewWidget from './sections/AnalyticsPreviewWidget';
import NotificationPreviewCard from '../../components/cards/NotificationPreviewCard';
import CaseTrackerWidget from './widgets/CaseTrackerWidget';
import AIHealthSummaryWidget from './widgets/AIHealthSummaryWidget';

import DailyChallengeWidget from './widgets/DailyChallengeWidget';
import MoodTrackerWidget from './widgets/MoodTrackerWidget';
import WaterIntakeWidget from './widgets/WaterIntakeWidget';
import StepCounterWidget from './widgets/StepCounterWidget';
import NutritionWidget from './widgets/NutritionWidget';
import BadgesWidget from './widgets/BadgesWidget';
import WeeklyReportWidget from './widgets/WeeklyReportWidget';
import WellnessTipWidget from './widgets/WellnessTipWidget';
import HealthCalendarWidget from './widgets/HealthCalendarWidget';
import HealthStreakWidget from './widgets/HealthStreakWidget';
import AINutritionPlannerWidget from './widgets/AINutritionPlannerWidget';

import React from 'react';

export default function CitizenDashboard() {
  const { t } = useTranslation();
  return (
    <div className="space-y-6">
      <WelcomeBanner />

      <QuickActions />

      <div className="grid gap-6 lg:grid-cols-3">
        <HealthScoreCard />
        <HealthTipsWidget />
        <NotificationPreviewCard />
      </div>

      <AIHealthSummaryWidget />
      <CaseTrackerWidget />

      <div className="grid gap-6 lg:grid-cols-2">
        <RecentActivityWidget />
        <AnalyticsPreviewWidget />
      </div>

      <div>
        <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
          {t('Wellness & Engagement')}
        </p>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <DailyChallengeWidget />
          <MoodTrackerWidget />
          <WaterIntakeWidget />
          <StepCounterWidget />
          <NutritionWidget />
          <BadgesWidget />
          <WeeklyReportWidget />
          <WellnessTipWidget />
          <HealthCalendarWidget />
          <HealthStreakWidget />
          <AINutritionPlannerWidget />
        </div>
      </div>
    </div>
  );
}
