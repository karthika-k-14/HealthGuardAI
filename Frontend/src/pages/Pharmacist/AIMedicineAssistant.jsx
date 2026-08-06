import { Info, RefreshCcw, ShieldAlert, Gauge, AlertTriangle, Boxes } from 'lucide-react';
import ChatbotWidget from '../../components/chatbot/ChatbotWidget';
import { sendMedicineAssistantMessage } from '../../api/pharmacyApi';
import { STORAGE_KEYS } from '../../constants/storageKeys';

import React from 'react';

const TOPICS = [
  { key: 'information', label: 'Medicine Information', icon: Info, prompt: 'Tell me about this medicine' },
  { key: 'alternatives', label: 'Alternative Medicines', icon: RefreshCcw, prompt: 'What are the alternatives?' },
  { key: 'interactions', label: 'Drug Interactions', icon: ShieldAlert, prompt: 'What are the drug interactions?' },
  { key: 'dosage', label: 'Dosage', icon: Gauge, prompt: 'What is the correct dosage?' },
  { key: 'sideEffects', label: 'Side Effects', icon: AlertTriangle, prompt: 'What are the side effects?' },
  { key: 'storage', label: 'Storage Instructions', icon: Boxes, prompt: 'How should this be stored?' },
];

export default function AIMedicineAssistant() {
  return (
    <ChatbotWidget
      title="AI Medicine Assistant"
      storageKey={STORAGE_KEYS.CHAT_PHARMACIST}
      initialMessage="Hi! I'm your AI Medicine Assistant. Ask about a medicine or pick a topic below."
      categories={TOPICS}
      onSend={sendMedicineAssistantMessage}
    />
  );
}
