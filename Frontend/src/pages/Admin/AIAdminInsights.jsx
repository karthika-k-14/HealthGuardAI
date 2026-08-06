import { Gauge, ShieldAlert, TrendingUp, Activity, Megaphone, Settings2 } from 'lucide-react';
import ChatbotWidget from '../../components/chatbot/ChatbotWidget';
import { sendAdminInsightQuery } from '../../api/adminApi';
import { STORAGE_KEYS } from '../../constants/storageKeys';

import React from 'react';

const TOPICS = [
  { key: 'platformHealth', label: 'Platform Health Score', icon: Gauge, prompt: 'How healthy is the platform right now?' },
  { key: 'suspiciousActivity', label: 'Suspicious Activity Detection', icon: ShieldAlert, prompt: 'Any suspicious activity to review?' },
  { key: 'userGrowth', label: 'User Growth Prediction', icon: TrendingUp, prompt: 'What does user growth look like?' },
  { key: 'diseaseTrend', label: 'Disease Trend Prediction', icon: Activity, prompt: 'What are the disease trend predictions?' },
  { key: 'campaignSuggestion', label: 'Campaign Suggestions', icon: Megaphone, prompt: 'Any campaign suggestions?' },
  { key: 'resourceOptimization', label: 'Resource Optimization', icon: Settings2, prompt: 'How can we optimize resources?' },
];

export default function AIAdminInsights() {
  return (
    <ChatbotWidget
      title="AI Admin Insights"
      storageKey={STORAGE_KEYS.CHAT_ADMIN}
      initialMessage="Hi! I'm your AI Admin Insights assistant. Pick a topic or ask about the platform."
      categories={TOPICS}
      onSend={sendAdminInsightQuery}
    />
  );
}
