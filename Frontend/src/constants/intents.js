// AI Module 2 — NLP Intent Detection.
// The 5 intent categories named in the problem statement, plus the
// keyword rules used to detect them. Centralized so chatbotApi and
// any future surface (e.g. voice input) share one definition.

export const INTENTS = {
  DISEASE_QUERY: 'disease_query',
  SYMPTOM_QUERY: 'symptom_query',
  MEDICINE_QUERY: 'medicine_query',
  AWARENESS_QUERY: 'awareness_query',
  EMERGENCY_QUERY: 'emergency_query',
};

export const INTENT_LABELS = {
  [INTENTS.DISEASE_QUERY]: 'Disease Query',
  [INTENTS.SYMPTOM_QUERY]: 'Symptom Query',
  [INTENTS.MEDICINE_QUERY]: 'Medicine Query',
  [INTENTS.AWARENESS_QUERY]: 'Health Awareness Query',
  [INTENTS.EMERGENCY_QUERY]: 'Emergency Query',
};

// Order matters: checked top-to-bottom, first match wins, so the
// most urgent/specific intents are listed first.
export const INTENT_RULES = [
  {
    intent: INTENTS.EMERGENCY_QUERY,
    keywords: [
      'emergency', 'urgent', 'chest pain', 'breathing', 'unconscious', 'severe bleeding', 'bleeding',
      'दर्द', 'खून', 'सांस', 'बेहोश', 'आपातकाल',
      'வலி', 'இரத்தம்', 'மூச்சு', 'அவசர',
      'ଯନ୍ତ୍ରଣା', 'ରକ୍ତ', 'ନିଶ୍ୱାସ', 'ଜରୁରୀ',
    ],
  },
  {
    intent: INTENTS.MEDICINE_QUERY,
    keywords: [
      'medicine', 'medication', 'dose', 'tablet', 'pharmacy', 'prescription', 'available',
      'दवा', 'गोली', 'फार्मेसी',
      'மருந்து', 'மாத்திரை', 'மருந்தகம்',
      'ଔଷଧ', 'ବଟିକା',
    ],
  },
  {
    intent: INTENTS.SYMPTOM_QUERY,
    keywords: [
      'symptom', 'fever', 'headache', 'cough', 'pain', 'ache', 'vomit', 'rash', 'feeling', 'i have',
      'बुखार', 'सिरदर्द', 'खांसी', 'दर्द हो रहा',
      'காய்ச்சல்', 'தலைவலி', 'இருமல்',
      'ଜ୍ୱର', 'ମୁଣ୍ଡବିନ୍ଧା', 'କାଶ',
    ],
  },
  {
    intent: INTENTS.DISEASE_QUERY,
    keywords: [
      'dengue', 'malaria', 'diabetes', 'tuberculosis', 'disease', 'infection', 'what is',
      'डेंगू', 'मधुमेह', 'बीमारी',
      'டெங்கு', 'நீரிழிவு', 'நோய்',
      'ଡେଙ୍ଗୁ', 'ମଧୁମେହ', 'ରୋଗ',
    ],
  },
  {
    intent: INTENTS.AWARENESS_QUERY,
    keywords: [
      'vaccin', 'prevention', 'hygiene', 'nutrition', 'scheme', 'awareness', 'pregnan', 'vaccination', 'immuniz',
      'टीका', 'योजना', 'स्वच्छता', 'पोषण',
      'தடுப்பூசி', 'திட்டம்', 'சுகாதாரம்',
      'ଟିକା', 'ଯୋଜନା', 'ପୋଷଣ',
    ],
  },
];

/**
 * Detects intent from free-text input. Returns the first matching
 * rule (rules are pre-ordered by urgency/specificity) with a
 * confidence score, or falls back to AWARENESS_QUERY — a chatbot
 * default question is treated as a general awareness ask.
 */
export function detectIntentFromText(text = '') {
  const lower = text.toLowerCase();
  for (const rule of INTENT_RULES) {
    const matched = rule.keywords.filter((kw) => lower.includes(kw));
    if (matched.length > 0) {
      const confidence = Math.min(0.98, 0.72 + matched.length * 0.08);
      return { intent: rule.intent, label: INTENT_LABELS[rule.intent], confidence: Math.round(confidence * 100) / 100, matchedKeywords: matched };
    }
  }
  return { intent: INTENTS.AWARENESS_QUERY, label: INTENT_LABELS[INTENTS.AWARENESS_QUERY], confidence: 0.5, matchedKeywords: [] };
}
