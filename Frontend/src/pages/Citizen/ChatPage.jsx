import { Link } from 'react-router-dom';
import { Siren, Stethoscope } from 'lucide-react';
import ChatbotWidget from '../../components/chatbot/ChatbotWidget';
import { sendChatMessage } from '../../api/chatbotApi';
import { STORAGE_KEYS } from '../../constants/storageKeys';
import { PATHS } from '../../constants/routes';
import { useLanguage } from '../../contexts/LanguageContext';

import React from 'react';

const SUGGESTED_QUESTIONS = ['Fever', 'Headache', 'Diabetes', 'Dengue', 'Vaccination', 'Pregnancy', 'Nearby Hospital'];
const EMERGENCY_REPLIES = ['I need urgent help', 'Chest pain', 'Difficulty breathing', 'Severe bleeding'];
const DISEASE_RECOMMENDATIONS = ['Dengue prevention tips', 'Flu symptoms this week', 'TB early signs'];

function SidebarExtras({ send }) {
  const { t } = useLanguage();
  return (
    <>
      <div className="surface-card p-5">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-signal-rose/10 text-signal-rose">
            <Siren className="h-4 w-4" />
          </span>
          <p className="text-sm font-semibold text-slate-900 dark:text-white">{t('Emergency quick replies')}</p>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {EMERGENCY_REPLIES.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => send(r)}
              className="rounded-full border border-signal-rose/30 px-3 py-1.5 text-xs font-medium text-signal-rose hover:bg-signal-rose/10 cursor-pointer focus:outline-none focus:ring-2 focus:ring-signal-rose"
            >
              {t(r)}
            </button>
          ))}
        </div>
        <Link
          to={PATHS.CITIZEN_EMERGENCY}
          className="mt-3 block text-center text-xs font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400"
        >
          {t('Open Emergency Center')} →
        </Link>
      </div>

      <div className="surface-card p-5">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400">
            <Stethoscope className="h-4 w-4" />
          </span>
          <p className="text-sm font-semibold text-slate-900 dark:text-white">{t('Disease recommendations')}</p>
        </div>
        <div className="mt-3 flex flex-col gap-2">
          {DISEASE_RECOMMENDATIONS.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => send(r)}
              className="rounded-lg border border-slate-200 px-3 py-2 text-left text-xs font-medium text-slate-600 hover:border-brand-300 hover:text-brand-600 dark:border-white/10 dark:text-slate-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              {t(r)}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

export default function ChatPage() {
  const { languageCode } = useLanguage();

  return (
    <ChatbotWidget
      title="HealthGuard Assistant"
      storageKey={STORAGE_KEYS.CHAT_CITIZEN}
      initialMessage="Hi! I'm your HealthGuard AI assistant. Ask about symptoms, hospitals, medicines, or vaccinations."
      suggestedQuestions={SUGGESTED_QUESTIONS}
      onSend={({ message }) => sendChatMessage(message, languageCode)}
      sidebarExtra={SidebarExtras}
    />
  );
}

