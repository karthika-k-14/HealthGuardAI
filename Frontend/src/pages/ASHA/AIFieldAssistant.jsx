import { Stethoscope, Baby, Smile, BookOpenText, Siren, Landmark } from 'lucide-react';
import ChatbotWidget from '../../components/chatbot/ChatbotWidget';
import { sendFieldAssistantMessage } from '../../api/ashaApi';
import { STORAGE_KEYS } from '../../constants/storageKeys';

import React from 'react';

const CATEGORIES = [
  { key: 'symptom', label: 'Symptom Guidance', icon: Stethoscope, prompt: 'I need symptom guidance for a patient' },
  { key: 'childcare', label: 'Child Care Tips', icon: Smile, prompt: 'I need child care tips' },
  { key: 'disease', label: 'Disease Awareness', icon: BookOpenText, prompt: 'I need disease awareness guidance' },
  { key: 'emergency', label: 'Emergency Suggestions', icon: Siren, prompt: 'I have an emergency situation' },
  { key: 'scheme', label: 'Govt. Scheme Info', icon: Landmark, prompt: 'Which government schemes apply here?' },
];

export default function AIFieldAssistant() {
  return (
    <ChatbotWidget
      title="AI Field Assistant"
      storageKey={STORAGE_KEYS.CHAT_ASHA}
      initialMessage="Hi! I'm your AI Field Assistant. Pick a category or describe what you're seeing in the field."
      categories={CATEGORIES}
      onSend={sendFieldAssistantMessage}
    />
  );
}
