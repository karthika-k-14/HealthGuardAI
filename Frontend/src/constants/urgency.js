// AI Module 4 — Urgency Prediction.
// Upgraded from Low/Medium/High to the spec-mandated four tiers.
// Single source of truth for rank/tone/escalation-action so every
// page that renders an urgency badge or branches on urgency reads
// from here instead of declaring its own map.

export const URGENCY_LEVELS = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  CRITICAL: 'Critical',
};

export const URGENCY_RANK = {
  [URGENCY_LEVELS.LOW]: 0,
  [URGENCY_LEVELS.MEDIUM]: 1,
  [URGENCY_LEVELS.HIGH]: 2,
  [URGENCY_LEVELS.CRITICAL]: 3,
};

// Badge tones — 'critical' is a distinct (darker/solid) tone from
// 'rose' so Critical reads as visually more severe than High.
export const URGENCY_TONE = {
  [URGENCY_LEVELS.LOW]: 'brand',
  [URGENCY_LEVELS.MEDIUM]: 'amber',
  [URGENCY_LEVELS.HIGH]: 'rose',
  [URGENCY_LEVELS.CRITICAL]: 'critical',
};

// What the workflow does at each tier. The AI always gives the
// citizen guidance immediately, regardless of tier — this only
// describes what happens *after* that, in the background:
// Low -> self-care guidance, stored for analytics only (no worker
// involvement). Medium -> nearest-PHC recommendation, stored for
// analytics only. High -> a follow-up case lands in the ASHA
// Follow-Up Queue (confirm the citizen reached the PHC, not
// diagnosis) and feeds Health Officer analytics. Critical -> the
// Emergency Screen is shown first; ASHA + Health Officer are only
// assigned/notified once the citizen explicitly shares their
// location.
export const URGENCY_ACTION = {
  [URGENCY_LEVELS.LOW]: 'awareness_guidance',
  [URGENCY_LEVELS.MEDIUM]: 'recommend_phc',
  [URGENCY_LEVELS.HIGH]: 'asha_followup_queue',
  [URGENCY_LEVELS.CRITICAL]: 'emergency_screen_then_location_share',
};

export function isAtLeast(level, threshold) {
  return (URGENCY_RANK[level] ?? 0) >= (URGENCY_RANK[threshold] ?? 0);
}

export function maxUrgency(a, b) {
  return (URGENCY_RANK[a] ?? 0) >= (URGENCY_RANK[b] ?? 0) ? a : b;
}

/**
 * Decision Engine — the single place that turns an urgency level into
 * what the citizen sees and what the workflow does next, per the
 * spec's branching rules. Both the Symptom Checker and the chatbot
 * pipeline call this instead of re-implementing the branch.
 */
export function getDecisionForUrgency(level) {
  switch (level) {
    case URGENCY_LEVELS.MEDIUM:
      return {
        action: URGENCY_ACTION[URGENCY_LEVELS.MEDIUM],
        title: 'Nearest PHC recommended',
        summary: 'Your symptoms warrant a visit to your nearest Primary Health Centre. Awareness resources are shown below.',
        showNearestPHC: true,
        createsCase: false,
      };
    case URGENCY_LEVELS.HIGH:
      return {
        action: URGENCY_ACTION[URGENCY_LEVELS.HIGH],
        title: 'Please visit the nearest PHC within 24 hours',
        summary: 'A follow-up case has been created and placed in your ASHA worker\'s follow-up queue — they will check in to confirm you received care, not to diagnose you. The AI has already given you guidance above.',
        showNearestPHC: true,
        createsCase: true,
        requiresLocationShare: false,
      };
    case URGENCY_LEVELS.CRITICAL:
      return {
        action: URGENCY_ACTION[URGENCY_LEVELS.CRITICAL],
        title: 'Emergency guidance provided',
        summary: 'You\'ve been given immediate emergency guidance above — this comes first, before any healthcare worker is involved. Share your location when you\'re ready so your ASHA worker and the Health Officer can be notified immediately.',
        showNearestPHC: true,
        createsCase: true,
        requiresLocationShare: true,
      };
    case URGENCY_LEVELS.LOW:
    default:
      return {
        action: URGENCY_ACTION[URGENCY_LEVELS.LOW],
        title: 'Awareness & home care guidance',
        summary: 'Your symptoms appear low-risk. Prevention tips and home care guidance are shown below.',
        showNearestPHC: false,
        createsCase: false,
      };
  }
}
