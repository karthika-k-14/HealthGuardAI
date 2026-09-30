import React from 'react';
import { HeartPulse, Syringe, AlertTriangle, ClipboardCheck, Landmark } from 'lucide-react';
import ChatbotWidget from '../../components/chatbot/ChatbotWidget';
import { sendFieldAssistantMessage } from '../../api/ashaApi';
import { STORAGE_KEYS } from '../../constants/storageKeys';

const CATEGORIES = [
  {
    key: 'maternal_care',
    label: 'Maternal Care',
    icon: HeartPulse,
    prompt: 'I need guidance on Maternal Care (antenatal care, pregnancy nutrition, postnatal care, and maternal health monitoring).',
    subtopics: [
      'Antenatal care guidance',
      'Pregnancy nutrition',
      'Postnatal care',
      'Maternal health monitoring',
    ],
  },
  {
    key: 'child_immunization',
    label: 'Child Immunization',
    icon: Syringe,
    prompt: 'I need guidance on Child Immunization (vaccination schedules, missed vaccines, growth monitoring, and immunization awareness).',
    subtopics: [
      'Vaccination schedules',
      'Missed vaccination guidance',
      'Growth monitoring',
      'Immunization awareness',
    ],
  },
  {
    key: 'high_risk_pregnancy',
    label: 'High-Risk Pregnancy',
    icon: AlertTriangle,
    prompt: 'I need guidance on High-Risk Pregnancy (risk identification, warning signs, referral recommendations, and emergency maternal cases).',
    subtopics: [
      'Risk identification',
      'Warning signs',
      'Referral recommendations',
      'Emergency maternal cases',
    ],
  },
  {
    key: 'village_surveys',
    label: 'Village Health Surveys',
    icon: ClipboardCheck,
    prompt: 'I need guidance on Village Health Surveys (household survey assistance, data collection, population health tracking, and follow-up visit planning).',
    subtopics: [
      'Household survey assistance',
      'Data collection guidance',
      'Population health tracking',
      'Follow-up visit planning',
    ],
  },
  {
    key: 'govt_schemes',
    label: 'Government Health Schemes',
    icon: Landmark,
    prompt: 'I need information on Government Health Schemes (PM-JAY, Janani Suraksha Yojana, maternal benefit schemes, child welfare programs, and health initiatives).',
    subtopics: [
      'PM-JAY',
      'Janani Suraksha Yojana',
      'Maternal benefit schemes',
      'Child welfare programs',
      'State and central health initiatives',
    ],
  },
];

export default function AIFieldAssistant() {
  return (
    <ChatbotWidget
      title="AI Field Assistant"
      storageKey={STORAGE_KEYS.CHAT_ASHA}
      initialMessage="Namaste! I'm your ASHA Worker AI Field Assistant. Select a topic area or ask any question regarding maternal care, child immunization, high-risk pregnancies, village health surveys, or government schemes."
      categories={CATEGORIES}
      onSend={sendFieldAssistantMessage}
    />
  );
}
