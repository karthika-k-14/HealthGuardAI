import { assessSymptoms } from './symptomApi';
import { sendChatMessage } from './chatbotApi';

/**
 * AI Pipeline orchestrator delegating directly to backend AI microservices.
 */
export async function runPipelineFromText(text = '', languageCode = 'en') {
  const chatResult = await sendChatMessage(text, languageCode);
  if (!chatResult || chatResult.isError) {
    return { unavailable: true, message: chatResult?.content || 'AI service unavailable. Please try again later.' };
  }

  return {
    input: text,
    response: chatResult.content,
    generatedAt: new Date().toISOString(),
  };
}

export async function runPipelineFromSymptoms({ symptoms = [] }) {
  const symptomsText = Array.isArray(symptoms) ? symptoms.join(', ') : String(symptoms || '');
  const userObj = JSON.parse(localStorage.getItem('user') || '{}');
  const currentUserId = userObj.id || userObj.userId;
  const result = await assessSymptoms({ userId: currentUserId, symptoms: symptomsText });

  if (!result) {
    return { unavailable: true, message: 'AI service unavailable. Please try again later.' };
  }

  return {
    input: symptomsText,
    prediction: result.prediction,
    riskLevel: result.riskLevel,
    recommendation: result.recommendation,
    generatedAt: result.createdAt || new Date().toISOString(),
  };
}
