import { mockRequest } from './mockClient';
import diseaseStats from '../data/diseaseStats.json';
import awarenessFixture from '../data/awareness.json';
import healthTipsFixture from '../data/healthTips.json';
import recentActivityFixture from '../data/recentActivity.json';
import symptomConditionsFixture from '../data/symptomConditions.json';
import widgetsFixture from '../data/citizenWidgets.json';
import timelineFixture from '../data/healthTimeline.json';
import nutritionPlanFixture from '../data/nutritionPlan.json';
import { classifyDiseaseCategory } from '../constants/diseaseCategories';
import { URGENCY_LEVELS, URGENCY_RANK } from '../constants/urgency';

const EMERGENCY_SYMPTOMS = ['Difficulty breathing', 'Severe bleeding', 'Chest pain', 'Unconsciousness'];

// --- Dashboard overview -----------------------------------------------

// TODO: Missing backend API: /citizen/health-summary
export async function fetchCitizenHealthSummary() {
  return mockRequest(diseaseStats.summary);
}

export async function fetchAwarenessFeed() {
  return mockRequest(awarenessFixture);
}

// TODO: Missing backend API: /citizen/health-tips
export async function fetchHealthTips() {
  return mockRequest(healthTipsFixture);
}

// TODO: Missing backend API: /citizen/recent-activity
export async function fetchRecentActivity() {
  return mockRequest(recentActivityFixture);
}

// TODO: Missing backend API: /citizen/health-timeline
export async function fetchHealthTimeline() {
  return mockRequest(timelineFixture);
}

/**
 * AI Personal Health Score — a richer demo scorer than the landing
 * page's quick preview. Deterministic-ish math over age/gender/
 * weight/height/lifestyle/symptoms, purely for demonstration.
 */
export async function computeHealthScore({ age, gender, weight, height, lifestyle, symptoms = [] }) {
  return mockRequest(() => {
    const heightM = (Number(height) || 170) / 100;
    const bmi = (Number(weight) || 65) / (heightM * heightM);

    let score = 82;
    if (bmi < 18.5 || bmi > 27) score -= 14;
    else if (bmi > 24.5) score -= 6;

    score -= Math.max(0, (Number(age) || 0) - 40) * 0.35;
    score -= symptoms.length * 7;

    if (lifestyle === 'sedentary') score -= 12;
    if (lifestyle === 'moderate') score -= 3;
    if (lifestyle === 'active') score += 6;

    score = Math.max(6, Math.min(98, Math.round(score)));

    let risk = 'Low';
    if (score < 45) risk = 'High';
    else if (score < 70) risk = 'Moderate';

    const suggestions = [];
    if (bmi > 24.5) suggestions.push('Consider a balanced diet and regular activity to bring BMI toward a healthier range.');
    if (lifestyle === 'sedentary') suggestions.push('Add short daily walks — even 15–20 minutes helps significantly.');
    if (symptoms.length > 0) suggestions.push('Monitor reported symptoms and consult a doctor if they persist beyond a few days.');
    if (suggestions.length === 0) suggestions.push('Keep up your current habits — your indicators look good this demo run.');

    return {
      score,
      risk,
      bmi: Math.round(bmi * 10) / 10,
      gender: gender || 'Not specified',
      suggestions,
    };
  }, { latency: 900 });
}

// --- Extra premium widgets ---------------------------------------------

export async function fetchDailyChallenge() {
  return mockRequest(widgetsFixture.dailyChallenge);
}

export async function fetchMoodData() {
  return mockRequest({ options: widgetsFixture.moodOptions, history: widgetsFixture.moodHistory });
}

export async function logMood(moodId) {
  return mockRequest(() => ({ moodId, loggedAt: new Date().toISOString() }));
}

export async function fetchWaterIntake() {
  return mockRequest(widgetsFixture.waterIntake);
}

export async function logWaterIntake(amount) {
  return mockRequest(() => ({
    current: Math.min(widgetsFixture.waterIntake.target, widgetsFixture.waterIntake.current + amount),
    target: widgetsFixture.waterIntake.target,
    unit: widgetsFixture.waterIntake.unit,
  }));
}

export async function fetchStepCount() {
  return mockRequest(widgetsFixture.stepCounter);
}

export async function fetchNutritionTip() {
  return mockRequest(() => {
    const tips = widgetsFixture.nutritionTips;
    return tips[Math.floor(Math.random() * tips.length)];
  });
}

export async function fetchBadges() {
  return mockRequest(widgetsFixture.badges);
}

export async function fetchWeeklyReport() {
  return mockRequest(widgetsFixture.weeklyReport);
}

export async function fetchWellnessTip() {
  return mockRequest(() => {
    const tips = widgetsFixture.wellnessTips;
    return tips[Math.floor(Math.random() * tips.length)];
  });
}

// ---- AI Symptom Checker ----

const HOME_CARE_FALLBACK = ['Rest and stay hydrated', 'Monitor your symptoms over the next 24–48 hours'];

/**
 * Mock symptom checker. Ranks known conditions by how many of the
 * selected symptoms overlap, then layers in a simple age/gender-aware
 * risk nudge. This is a demo heuristic, not a diagnostic tool.
 */
export async function runSymptomCheck({ symptoms = [], age, gender }) {
  return mockRequest(() => {
    const scored = symptomConditionsFixture
      .map((cond) => {
        const overlap = cond.symptoms.filter((s) => symptoms.includes(s)).length;
        return { ...cond, matchScore: overlap };
      })
      .filter((c) => c.matchScore > 0)
      .sort((a, b) => b.matchScore - a.matchScore);

    const possibleDiseases = scored.slice(0, 3).map((c) => ({
      name: c.name,
      likelihood: Math.min(96, Math.round((c.matchScore / c.symptoms.length) * 100)),
    }));

    const topMatch = scored[0];

    // ---- AI Module 4: Urgency Prediction (Low/Medium/High/Critical) ----
    let riskLevel = topMatch ? topMatch.riskLevel : URGENCY_LEVELS.LOW;
    if ((Number(age) || 0) > 60 && URGENCY_RANK[riskLevel] < URGENCY_RANK[URGENCY_LEVELS.MEDIUM]) {
      riskLevel = URGENCY_LEVELS.MEDIUM;
    }
    if (symptoms.length >= 4 && URGENCY_RANK[riskLevel] < URGENCY_RANK[URGENCY_LEVELS.HIGH]) {
      riskLevel = URGENCY_LEVELS.HIGH;
    }
    // Critical: any emergency-signal symptom present, or a senior
    // citizen presenting with an already-High-risk condition.
    const hasEmergencySymptom = symptoms.some((s) => EMERGENCY_SYMPTOMS.includes(s));
    if (hasEmergencySymptom || ((Number(age) || 0) > 60 && riskLevel === URGENCY_LEVELS.HIGH)) {
      riskLevel = URGENCY_LEVELS.CRITICAL;
    }

    // ---- AI Module 3: Disease Classification (5 spec categories) ----
    const diseaseCategory = classifyDiseaseCategory({
      diseaseName: topMatch?.name || '',
      symptomsText: symptoms.join(' '),
    });

    return {
      possibleDiseases: possibleDiseases.length > 0 ? possibleDiseases : [{ name: 'Non-specific symptoms', likelihood: 40 }],
      diseaseCategory,
      riskLevel,
      homeCareTips: topMatch ? topMatch.homeCareTips : HOME_CARE_FALLBACK,
      recommendedDoctor: topMatch ? topMatch.recommendedDoctor : 'General Physician',
      emergencyWarning: (riskLevel === URGENCY_LEVELS.HIGH || riskLevel === URGENCY_LEVELS.CRITICAL)
        ? (topMatch?.emergencyWarning || 'Seek immediate medical attention if symptoms worsen rapidly.')
        : null,
      inputSummary: { symptoms, age, gender },
    };
  }, { latency: 900 });
}

// ---- Unique features: Health Calendar & Streak Tracker ----

export async function fetchHealthCalendar() {
  return mockRequest(widgetsFixture.healthCalendar);
}

export async function fetchHealthStreak() {
  return mockRequest(widgetsFixture.healthStreak);
}

// ---- AI Nutrition Planner ----

export async function fetchNutritionPlan(goal = 'maintenance') {
  return mockRequest(() => ({ goal, ...nutritionPlanFixture[goal] }), { latency: 500 });
}

export async function fetchNutritionGoals() {
  return mockRequest(() => Object.keys(nutritionPlanFixture).map((key) => ({ key, label: nutritionPlanFixture[key].label })));
}
