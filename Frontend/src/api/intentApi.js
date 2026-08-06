import { mockRequest } from './mockClient';
import { detectIntentFromText, INTENTS, INTENT_LABELS } from '../constants/intents';

/**
 * AI Module 2 — NLP Intent Detection. Reusable across the chatbot
 * and any other free-text entry point; keeps intent-detection logic
 * out of chatbotApi so it isn't duplicated per surface.
 */
export async function detectIntent(message = '') {
  return mockRequest(() => detectIntentFromText(message));
}

export { INTENTS, INTENT_LABELS };
