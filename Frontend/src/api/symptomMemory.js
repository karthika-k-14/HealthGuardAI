import { assessSymptoms } from './symptomApi';

function getMemoryKey(userId = null) {
  return userId ? `healthguard_chat_symptom_memory_${userId}` : 'healthguard_chat_symptom_memory';
}

const INITIAL_STATE = {
  sessionId: null,
  symptoms: [],
  bodyParts: [],
  severity: null,
  duration: null,
  followUpAnswers: [],
  askedQuestions: [],
  questionCount: 0,
  isComplete: false,
  assessmentResult: null,
};

export function getSymptomMemoryState(userId = null) {
  try {
    const saved = localStorage.getItem(getMemoryKey(userId));
    if (saved) {
      const parsed = JSON.parse(saved);
      if (!parsed.sessionId) parsed.sessionId = 'session_' + Date.now();
      return parsed;
    }
  } catch (e) {
    // Preserve the initial symptom memory fallback when stored data is invalid or unavailable.
  }
  return { ...INITIAL_STATE, sessionId: 'session_' + Date.now() };
}

export function resetSymptomMemoryState(userId = null) {
  const fresh = { ...INITIAL_STATE, sessionId: 'session_' + Date.now() };
  try {
    localStorage.setItem(getMemoryKey(userId), JSON.stringify(fresh));
  } catch (e) {
    // Preserve the fresh symptom memory state when localStorage saving fails.
  }
  return fresh;
}


export async function accumulateSymptomMemory(userText = '', sessionUuid = null, userId = null) {
  const state = getSymptomMemoryState();

  if (sessionUuid) {
    state.sessionId = sessionUuid;
  } else if (!state.sessionId) {
    state.sessionId = 'session_' + Date.now();
  }

  const symptomsQuery = userText.trim();
  if (symptomsQuery && !state.symptoms.includes(symptomsQuery)) {
    state.symptoms.push(symptomsQuery);
  }

  // Send request directly to real backend API: POST /api/ai/symptoms
  const backendResult = await assessSymptoms({
    userId,
    symptoms: state.symptoms.length > 0 ? state.symptoms.join(', ') : symptomsQuery
  });

  if (backendResult) {
    state.isComplete = true;
    state.assessmentResult = {
      symptomSummary: backendResult.symptoms || symptomsQuery,
      riskLevel: backendResult.riskLevel,
      prediction: backendResult.prediction,
      recommendations: backendResult.recommendation,
      createdAt: backendResult.createdAt || new Date().toISOString()
    };

    try {
      localStorage.setItem(STORAGE_KEY_MEMORY, JSON.stringify(state));
    } catch (e) {
      // Preserve the assessment result when symptom memory cannot be saved locally.
    }

    return {
      state,
      isComplete: true,
      assessmentResult: state.assessmentResult
    };
  }

  return {
    state,
    isComplete: false,
    assessmentResult: null
  };
}

