import { mockRequest } from './mockClient';
import { detectIntentFromText } from '../constants/intents';
import { classifyDiseaseCategory } from '../constants/diseaseCategories';
import { URGENCY_LEVELS, getDecisionForUrgency } from '../constants/urgency';
import { detectLanguageFromText } from '../utils/languageDetect';
import { runSymptomCheck } from './citizenApi';

/**
 * The full AI pipeline named in the problem statement:
 *   Citizen Input -> Language Detection -> Intent Detection ->
 *   Disease Category Classification -> Urgency Prediction -> Decision Engine
 *
 * This is the single reusable orchestrator — the Symptom Checker,
 * the Chatbot, and dashboard "Recent AI Analysis" widgets all call
 * into this instead of re-implementing the pipeline shape. Each
 * step's actual logic still lives in its own module
 * (intentApi/intents.js, diseaseClassificationApi.js, urgency.js);
 * this file only sequences them and records the trace.
 *
 * Two entry points are supported:
 *  - runPipelineFromText: free text (chatbot messages)
 *  - runPipelineFromSymptoms: structured symptom-checker input,
 *    which reuses the existing runSymptomCheck disease/urgency logic
 *    rather than duplicating it, and layers language + intent
 *    detection on top for a complete trace.
 */

function buildTrace({ input, detectedLanguage, intentResult, diseaseCategory, urgencyLevel }) {
  const decision = getDecisionForUrgency(urgencyLevel);
  return {
    input,
    steps: [
      { step: 'Language Detection', result: detectedLanguage.name, detail: `Detected via ${detectedLanguage.method}` },
      { step: 'Intent Detection', result: intentResult.label, detail: `${Math.round(intentResult.confidence * 100)}% confidence` },
      { step: 'Disease Category Classification', result: diseaseCategory, detail: null },
      { step: 'Urgency Prediction', result: urgencyLevel, detail: decision.summary },
      { step: 'Decision Engine', result: decision.title, detail: decision.summary },
    ],
    detectedLanguage,
    intent: intentResult,
    diseaseCategory,
    urgencyLevel,
    decision,
    confidence: intentResult.confidence,
    generatedAt: new Date().toISOString(),
  };
}

export async function runPipelineFromText(text = '') {
  return mockRequest(() => {
    const detectedLanguage = detectLanguageFromText(text);
    const intentResult = detectIntentFromText(text);
    const diseaseCategory = classifyDiseaseCategory({ symptomsText: text });

    let urgencyLevel = URGENCY_LEVELS.LOW;
    if (intentResult.intent === 'emergency_query') urgencyLevel = URGENCY_LEVELS.CRITICAL;
    else if (intentResult.intent === 'symptom_query' || intentResult.intent === 'disease_query') urgencyLevel = URGENCY_LEVELS.MEDIUM;

    return buildTrace({ input: text, detectedLanguage, intentResult, diseaseCategory, urgencyLevel });
  });
}

export async function runPipelineFromSymptoms({ symptoms = [], age = null, gender = null }) {
  const symptomCheckResult = await runSymptomCheck({ symptoms, age, gender });
  const pseudoText = symptoms.length ? `I have ${symptoms.join(', ')}` : '';

  return mockRequest(() => {
    const detectedLanguage = detectLanguageFromText(pseudoText);
    const intentResult = detectIntentFromText(pseudoText);
    const trace = buildTrace({
      input: pseudoText,
      detectedLanguage,
      intentResult,
      diseaseCategory: symptomCheckResult.diseaseCategory,
      urgencyLevel: symptomCheckResult.riskLevel,
    });
    return { ...trace, symptomCheckResult };
  });
}
