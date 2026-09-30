import apiClient from './axios';

/**
 * HealthGuard AI - Clinical Assistant API
 * Connected to NLP classification engine and automatic emergency escalation
 */

export async function sendChatMessage(params, languageCode = 'en') {
  let messageText = '';
  let category = null;
  let topic = null;
  let citizenId = null;

  if (typeof params === 'object' && params !== null) {
    messageText = params.message || params.question || params.query || '';
    category = params.category;
    topic = params.topic;
    citizenId = params.citizenId || params.userId;
    if (params.languageCode) languageCode = params.languageCode;
  } else {
    messageText = String(params || '');
  }

  const msgTrimmed = (messageText || '').trim();
  if (!msgTrimmed) {
    return null;
  }

  const userObj = JSON.parse(localStorage.getItem('user') || '{}');
  const currentCitizenId = citizenId || userObj.citizenId || userObj.userId || userObj.id || 1;

  try {
    const payload = {
      citizenId: currentCitizenId,
      query: msgTrimmed,
      message: msgTrimmed,
      category: category || topic || null,
      language: languageCode,
    };

    // Primary: Call Clinical Chat Consultant (/api/chat/consult)
    const response = await apiClient.post('/api/chat/consult', payload, { timeout: 30000 });
    const data = response?.data?.data;

    if (data) {
      const isInformational = ['DISEASE_AWARENESS', 'PREVENTION', 'FACILITY', 'INFORMATIONAL', 'GENERAL_INFO'].includes(data.queryType) ||
                              (!data.urgencyLevel && data.riskScore == null);
      const isDoctorFollowUp = Boolean(data.isDoctorFollowUp || data.queryType === 'DOCTOR_FOLLOW_UP');

      // Ensure riskScore is strictly a number between 0 and 100 ONLY when clinical risk is actually evaluated
      let safeScore = null;
      if (typeof data.riskScore === 'number' && !isInformational && !isDoctorFollowUp) {
        safeScore = Math.min(100, Math.max(0, Math.round(data.riskScore)));
      }

      return {
        id: `msg_${data.id || Date.now()}`,
        role: 'assistant',
        content: data.response || 'Clinical assessment completed.',
        clinicalSummary: isInformational || isDoctorFollowUp ? null : (data.clinicalSummary || null),
        diseaseCategory: data.diseaseCategory || null,
        urgencyLevel: isInformational || isDoctorFollowUp ? null : (data.urgencyLevel || null),
        riskScore: safeScore,
        confidence: isInformational || isDoctorFollowUp ? null : (typeof data.confidence === 'number' ? data.confidence : (typeof data.confidenceScore === 'number' ? data.confidenceScore : null)),
        confidenceScore: isInformational || isDoctorFollowUp ? null : (typeof data.confidenceScore === 'number' ? data.confidenceScore : (typeof data.confidence === 'number' ? data.confidence : null)),
        extractedSymptoms: Array.isArray(data.extractedSymptoms) ? data.extractedSymptoms : [],
        queryType: data.queryType,
        isDoctorFollowUp: isDoctorFollowUp,
        stage: data.stage || null,
        quickReplies: Array.isArray(data.quickReplies) ? data.quickReplies : [],
        recommendations: Array.isArray(data.recommendations) ? data.recommendations : [],
        facilities: data.facilities || [],
        emergencyEscalated: data.emergencyEscalated || false,
        escalationStatus: data.escalationStatus || (data.emergencyEscalated ? 'Activated' : null),
        assignedWorker: data.assignedWorker || data.assignedAshaName || null,
        assignedAshaName: data.assignedAshaName || data.assignedWorker || null,
        timestamp: data.timestamp || new Date().toISOString(),
        inReplyTo: msgTrimmed,
      };
    }
  } catch (err) {
    console.error('[chatbotApi] /api/chat/consult failed:', err?.message || err);
    throw err;
  }

  return null;
}

export async function classifyChatQuery({ query, citizenId, language = 'en' }) {
  const userObj = JSON.parse(localStorage.getItem('user') || '{}');
  const currentCitizenId = citizenId || userObj.citizenId || userObj.userId || userObj.id || 1;

  try {
    const response = await apiClient.post('/api/chat/classify', {
      query,
      citizenId: currentCitizenId,
      language
    });
    return response?.data?.data || null;
  } catch (err) {
    console.error('[chatbotApi] /api/chat/classify failed:', err?.message || err);
    throw err;
  }
}
