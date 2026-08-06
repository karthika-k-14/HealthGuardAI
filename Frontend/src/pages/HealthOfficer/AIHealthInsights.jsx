import { TrendingUp, MapPinned, Pill, Syringe, Hospital } from 'lucide-react';
import ChatbotWidget from '../../components/chatbot/ChatbotWidget';
import { sendHealthInsightQuery } from '../../api/officerApi';
import { STORAGE_KEYS } from '../../constants/storageKeys';

import React from 'react';

const TOPICS = [
  { key: 'prediction', label: 'Disease Prediction', icon: TrendingUp, prompt: 'What are the disease trend predictions?' },
  { key: 'highRiskAreas', label: 'High Risk Areas', icon: MapPinned, prompt: 'Which areas are highest risk right now?' },
  { key: 'medicineDemand', label: 'Medicine Demand Forecast', icon: Pill, prompt: 'What medicine demand should I expect?' },
  { key: 'vaccination', label: 'Vaccination Recommendations', icon: Syringe, prompt: 'What vaccination actions do you recommend?' },
  { key: 'hospitalLoad', label: 'Hospital Load Prediction', icon: Hospital, prompt: 'How is hospital load trending?' },
];

export default function AIHealthInsights() {
  return (
    <ChatbotWidget
      title="AI Health Insights"
      storageKey={STORAGE_KEYS.CHAT_OFFICER}
      initialMessage="Hi! I'm your AI Health Insights assistant. Pick a topic or ask about district health trends."
      categories={TOPICS}
      onSend={sendHealthInsightQuery}
    />
  );
}
