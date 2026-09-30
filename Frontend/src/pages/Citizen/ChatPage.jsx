import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Siren, Stethoscope, ShieldAlert, MapPin, Activity, HelpCircle, PhoneCall } from 'lucide-react';
import ChatbotWidget from '../../components/chatbot/ChatbotWidget';
import { sendChatMessage } from '../../api/chatbotApi';
import { STORAGE_KEYS } from '../../constants/storageKeys';
import { PATHS } from '../../constants/routes';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';

function ClinicalSidebarExtras({ send }) {
  const { t } = useLanguage();
  const { user } = useAuth();

  const CLINICAL_SYMPTOM_QUERIES = [
    'I have fever and headache',
    'Chest pain and breathing difficulty',
    'My child has vomiting and diarrhea',
    'Dizziness and blurred vision'
  ];

  const DISEASE_AWARENESS_QUERIES = [
    'What is dengue?',
    'Symptoms of malaria',
    'How to prevent typhoid?',
    'TB warning signs'
  ];

  const FACILITY_QUERIES = [
    'Nearest PHC',
    'Nearest Hospital',
    'Blood bank near me',
    'Emergency services'
  ];

  return (
    <div className="space-y-4">
      {/* High-Urgency Symptoms Box */}
      <div className="surface-card p-4 border-l-4 border-l-rose-500 bg-rose-500/5">
        <div className="flex items-center gap-2">
          <Siren className="h-4 w-4 text-rose-600 animate-pulse" />
          <p className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400">
            Automated Escalation Active
          </p>
        </div>
        <p className="text-2xs text-slate-500 dark:text-slate-400 mt-1">
          High and Critical urgency symptoms are automatically routed to your assigned ASHA Worker and PHC.
        </p>
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {CLINICAL_SYMPTOM_QUERIES.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => send(q)}
              className="rounded-full border border-rose-200 bg-white/80 px-2.5 py-1 text-2xs font-medium text-rose-700 hover:bg-rose-100 dark:border-rose-500/30 dark:bg-slate-800 dark:text-rose-300 transition-colors"
            >
              {q}
            </button>
          ))}
        </div>
        <Link
          to={PATHS.CITIZEN_EMERGENCY}
          className="mt-3 block text-center text-xs font-semibold text-rose-600 hover:text-rose-700"
        >
          View Emergency Hub →
        </Link>
      </div>

      {/* Disease Awareness Box */}
      <div className="surface-card p-4 border-l-4 border-l-purple-500">
        <div className="flex items-center gap-2">
          <Stethoscope className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          <p className="text-xs font-bold text-slate-900 dark:text-white">Disease Guidance</p>
        </div>
        <p className="text-2xs text-slate-500 dark:text-slate-400 mt-1">
          Ask about transmission, causes, prevention, and government treatment protocols.
        </p>
        <div className="mt-2.5 flex flex-col gap-1.5">
          {DISEASE_AWARENESS_QUERIES.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => send(q)}
              className="rounded-lg border border-slate-200/80 px-2.5 py-1.5 text-left text-xs font-medium text-slate-700 hover:border-purple-300 hover:bg-purple-50/50 dark:border-white/5 dark:text-slate-300 dark:hover:bg-purple-500/10 transition-colors"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Real Facility Queries */}
      <div className="surface-card p-4 border-l-4 border-l-emerald-500">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          <p className="text-xs font-bold text-slate-900 dark:text-white">Healthcare Facilities</p>
        </div>
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {FACILITY_QUERIES.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => send(q)}
              className="rounded-full border border-emerald-200 bg-white/80 px-2.5 py-1 text-2xs font-medium text-emerald-700 hover:bg-emerald-100 dark:border-emerald-500/30 dark:bg-slate-800 dark:text-emerald-300 transition-colors"
            >
              {q}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ChatPage() {
  const { languageCode } = useLanguage();
  const { user } = useAuth();
  const citizenId = user?.citizenId || user?.userId || user?.id || 1;

  return (
    <ChatbotWidget
      title="HealthGuard AI Clinical Assistant"
      storageKey={STORAGE_KEYS.CHAT_CITIZEN}
      initialMessage="Namaste! I am your HealthGuard AI Clinical Assistant. You can describe symptoms, query disease prevention protocols, or locate nearest government hospitals and Primary Health Centres in English, Tamil, or Hindi."
      suggestedQuestions={[]}
      onSend={({ message, languageCode: msgLang }) =>
        sendChatMessage({
          message,
          citizenId,
          languageCode: msgLang || languageCode
        })
      }
      sidebarExtra={ClinicalSidebarExtras}
    />
  );
}
