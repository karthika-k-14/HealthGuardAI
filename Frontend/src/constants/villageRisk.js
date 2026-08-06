// Village-level risk helpers for the AI Public Health Intelligence
// Center. Kept separate from constants/urgency.js (which models a
// single citizen case's urgency) since village risk is an aggregate
// signal computed by the backend across many cases.
//
// A real backend may send riskLevel as "HIGH", "high", or "High" —
// normalizeRiskLevel accepts any casing so the UI never breaks on a
// convention mismatch, and every helper below is keyed purely by
// risk level, never by village name, so it works for whatever
// villages the backend returns.

const CANONICAL_LEVELS = ['Low', 'Medium', 'High', 'Critical'];

export function normalizeRiskLevel(riskLevel) {
  const match = CANONICAL_LEVELS.find(
    (level) => level.toLowerCase() === String(riskLevel || '').trim().toLowerCase()
  );
  return match || 'Low';
}

const RISK_TONE = { Low: 'brand', Medium: 'amber', High: 'rose', Critical: 'critical' };

export function villageRiskTone(riskLevel) {
  return RISK_TONE[normalizeRiskLevel(riskLevel)];
}

const RECOMMENDATION_BY_RISK = {
  Critical: 'Deploy an ASHA worker immediately and alert the nearest PHC to prepare for a surge in cases.',
  High: 'Schedule a focused health camp and increase ASHA follow-up visits in this village.',
  Medium: 'Monitor closely and share preventive awareness material with residents.',
  Low: 'Continue routine surveillance — no additional action needed right now.',
};

export function getVillageAIRecommendation(riskLevel) {
  return RECOMMENDATION_BY_RISK[normalizeRiskLevel(riskLevel)];
}
