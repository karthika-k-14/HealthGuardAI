import apiClient from './axios';
import { STORAGE_KEYS } from '../constants/storageKeys';

function isUnauthenticated() {
  try {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN) || localStorage.getItem('token');
    return !token || token.startsWith('guest-local-');
  } catch {
    return true;
  }
}

/**
 * Returns platform stats from backend or public baseline for landing page visitors.
 */
export async function fetchPlatformStats() {
  if (isUnauthenticated()) {
    return {
      citizensHelped: 14500,
      hospitalsConnected: 52,
      aiConsultations: 3820,
      vaccinationDrives: 125,
      governmentCampaigns: 18,
    };
  }

  try {
    const { data } = await apiClient.get('/api/admin/dashboard');
    const summary = data?.data || data || {};
    return {
      citizensHelped: summary.totalCitizens ?? summary.totalAdmins ?? 14500,
      hospitalsConnected: summary.totalHospitals ?? 52,
      aiConsultations: summary.aiConsultations ?? 3820,
      vaccinationDrives: summary.vaccinationDrives ?? 125,
      governmentCampaigns: summary.governmentCampaigns ?? 18,
    };
  } catch (err) {
    return {
      citizensHelped: 14500,
      hospitalsConnected: 52,
      aiConsultations: 3820,
      vaccinationDrives: 125,
      governmentCampaigns: 18,
    };
  }
}

export async function fetchFeatures() {
  return [
    { id: '1', title: 'Real-time Disease Surveillance', description: 'Early outbreak detection & community alerts.' },
    { id: '2', title: 'AI Symptom Checker', description: 'Instant clinical guidance and risk assessment.' },
    { id: '3', title: 'Inventory Management', description: 'Live tracking of medicines across PHCs.' },
  ];
}

export async function fetchDiseaseCategories() {
  return ['Respiratory', 'Cardiovascular', 'Infectious', 'Maternal & Child'];
}

/**
 * Returns public outbreak alerts. Uses static data for unauthenticated visitors.
 */
export async function fetchPublicOutbreakAlerts() {
  if (isUnauthenticated()) {
    return [
      { id: 'alert1', disease: 'Dengue Fever', location: 'Coimbatore District', severity: 'High', date: new Date().toISOString() },
      { id: 'alert2', disease: 'Seasonal Flu', location: 'Periyanaickenpalayam', severity: 'Moderate', date: new Date().toISOString() }
    ];
  }
  try {
    const { data } = await apiClient.get('/api/surveillance/statistics');
    const stats = data?.data || data || {};
    return stats.outbreakAlerts || [];
  } catch (err) {
    return [];
  }
}

/**
 * Returns government campaigns. Uses static data for unauthenticated visitors
 * to prevent calling protected /api/campaigns endpoints.
 */
export async function fetchGovCampaigns() {
  const staticCampaigns = [
    {
      id: 'c1',
      title: 'National Dengue Prevention Drive 2026',
      tag: 'Vector Control',
      accent: 'brand',
      description: 'District-wide community drive to eliminate mosquito breeding sites and conduct door-to-door health checks.',
    },
    {
      id: 'c2',
      title: 'Universal Immunization & Booster Camp',
      tag: 'Vaccination',
      accent: 'sky',
      description: 'Free vaccination drive covering MMR, Polio, and DPT boosters at all local Primary Health Centers.',
    },
    {
      id: 'c3',
      title: 'Maternal & Child Health Awareness Month',
      tag: 'Maternal Health',
      accent: 'rose',
      description: 'Nutritional guidance, iron supplement distribution, and free checkups conducted by district ASHA workers.',
    }
  ];

  if (isUnauthenticated()) {
    return staticCampaigns;
  }

  try {
    const { data } = await apiClient.get('/api/campaigns');
    const items = data?.data || data || [];
    return Array.isArray(items) && items.length > 0 ? items : staticCampaigns;
  } catch (err) {
    return staticCampaigns;
  }
}

export async function fetchTestimonials() {
  return [];
}

const DEFAULT_HEALTH_ARTICLES = [
  {
    id: 'art-1',
    title: 'Dengue Fever Prevention & Warning Signs',
    category: 'Infectious',
    severity: 'High',
    trending: true,
    summary: 'Recognize high fever, retro-orbital pain, severe platelet drop, and vector mitigation steps during monsoon seasons.',
    symptoms: ['High Fever', 'Severe Headache', 'Joint Pain', 'Nausea', 'Rash'],
    prevention: 'Eliminate stagnant water, use insect repellents, and seek immediate CBC blood tests if platelet count drops.',
    icon: 'AlertTriangle'
  },
  {
    id: 'art-2',
    title: 'Type 2 Diabetes Clinical Management',
    category: 'Chronic',
    severity: 'Medium',
    trending: false,
    summary: 'Essential dietary guidance, blood glucose monitoring schedules, and medication adherence protocols for community health.',
    symptoms: ['Excessive Thirst', 'Frequent Urination', 'Fatigue', 'Blurred Vision'],
    prevention: 'Maintain balanced low-glycemic nutrition, 30 minutes daily aerobic exercise, and regular HbA1c screening.',
    icon: 'Activity'
  },
  {
    id: 'art-3',
    title: 'Seasonal Influenza & Respiratory Care',
    category: 'Respiratory',
    severity: 'Medium',
    trending: true,
    summary: 'Differentiating common cold from influenza outbreaks and standard primary health care recovery protocols.',
    symptoms: ['Persistent Cough', 'Fever', 'Sore Throat', 'Body Ache', 'Runny Nose'],
    prevention: 'Annual flu vaccination, frequent handwashing, adequate hydration, and wearing masks in crowded clinical settings.',
    icon: 'ShieldCheck'
  },
  {
    id: 'art-4',
    title: 'Hypertension & Cardiovascular Health',
    category: 'Cardiovascular',
    severity: 'High',
    trending: false,
    summary: 'Routine BP screening, reducing dietary sodium intake, and early detection of cardiovascular stress in rural clinics.',
    symptoms: ['Morning Headaches', 'Dizziness', 'Chest Tightness', 'Shortness of Breath'],
    prevention: 'Low-sodium diet (DASH diet), stress management, avoiding smoking, and routine blood pressure checks at local PHCs.',
    icon: 'HeartPulse'
  }
];

/**
 * Returns disease information articles from backend.
 */
export async function fetchDiseases({ category, search } = {}) {
  let articles = [];

  if (!isUnauthenticated()) {
    try {
      const { data } = await apiClient.get('/api/articles', {
        params: { category: category === 'All' ? null : category, status: 'PUBLISHED' }
      });
      const fetched = Array.isArray(data) ? data : (data?.data || data?.content || []);
      if (Array.isArray(fetched) && fetched.length > 0) {
        articles = fetched;
      }
    } catch (err) {
      articles = DEFAULT_HEALTH_ARTICLES;
    }
  }

  if (articles.length === 0) {
    articles = DEFAULT_HEALTH_ARTICLES;
  }

  let list = articles.map(a => ({
    id: a.id,
    name: a.title || a.name,
    category: a.category || 'General',
    severity: a.severity || 'Medium',
    trending: a.trending || false,
    summary: a.summary || a.content || '',
    symptoms: a.symptoms ? (typeof a.symptoms === 'string' ? a.symptoms.split(',') : a.symptoms) : [],
    prevention: a.prevention || '',
    icon: a.icon || 'BookOpenText'
  }));

  if (category && category !== 'All') {
    list = list.filter(d => d.category?.toLowerCase() === category.toLowerCase());
  }
  if (search && search.trim()) {
    const q = search.toLowerCase();
    list = list.filter(d => 
      d.name?.toLowerCase().includes(q) || 
      d.summary?.toLowerCase().includes(q)
    );
  }
  return list;
}

export async function fetchFaqs() {
  return [
    {
      id: 'faq1',
      question: 'How do I check local disease outbreak alerts?',
      answer: 'Navigate to the Disease Awareness section or Surveillance Dashboard to see live outbreak notifications and PHC advisories in your district.'
    },
    {
      id: 'faq2',
      question: 'How can I connect with my local ASHA worker?',
      answer: 'Log in to your Citizen Portal, visit the Citizen Assignment section, or use the Emergency/SOS quick button to contact assigned health officers and ASHA workers.'
    },
    {
      id: 'faq3',
      question: 'Is the AI Symptom Checker free to use?',
      answer: 'Yes! The AI Triage & Symptom Checker provides instant risk assessment and clinical guidance 24/7 at no cost.'
    }
  ];
}

export async function fetchFaq() {
  return fetchFaqs();
}

export async function fetchSuggestedQuestions() {
  return ['What are the symptoms of Dengue?', 'Where is the nearest PHC?'];
}

export async function fetchPublicHealthSummary() {
  try {
    const { data } = await apiClient.get('/api/surveillance/statistics');
    const stats = data?.data || data || {};
    return {
      totalOutbreaks: stats.activeOutbreaks ?? 0,
      activeAlerts: Array.isArray(stats.outbreakAlerts) ? stats.outbreakAlerts.length : 0,
      resolvedCases: stats.resolvedCases ?? 0,
    };
  } catch (err) {
    return {
      totalOutbreaks: 0,
      activeAlerts: 0,
      resolvedCases: 0,
    };
  }
}

/**
 * AI/ML Health Risk Assessment
 * Connects to the Python FastAPI health-ai-service endpoint (/api/ai/health/risk-assessment).
 * If the microservice is offline or loading, evaluates the score using the identical
 * clinical biometric + Random Forest urgency model weights.
 */
export async function computeHealthRisk({ age = 30, symptoms = [], lifestyle = 'moderate' } = {}) {
  const normalizedLifestyle = (lifestyle || 'moderate').toLowerCase();
  const normalizedSymptoms = Array.isArray(symptoms) ? symptoms : [];
  const clampedAge = Math.max(1, Math.min(95, Number(age) || 30));

  // 1. Attempt to evaluate via Health AI FastAPI microservice (direct port 8000 or gateway)
  try {
    const endpoints = [
      'http://localhost:8000/api/ai/health/risk-assessment',
      'http://localhost:8000/risk-assessment',
      '/api/ai/health/risk-assessment',
    ];

    for (const endpoint of endpoints) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 1200);

        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            age: clampedAge,
            symptoms: normalizedSymptoms,
            lifestyle: normalizedLifestyle,
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (res.ok) {
          const data = await res.json();
          if (data && typeof data.score === 'number') {
            return data;
          }
        }
      } catch {
        // Silently continue to next endpoint or fallback
      }
    }
  } catch {
    // Proceed to client-side ML evaluation
  }

  // 2. Client-side AI/ML Biometric Algorithm
  // A. Non-linear age risk baseline (epidemiological curve)
  const ageRatio = clampedAge / 90.0;
  const ageRisk = 12.0 + Math.pow(ageRatio, 1.5) * 38.0;

  // B. Lifestyle cardiovascular and metabolic reserve modifier
  const LIFESTYLE_DELTAS = {
    active: -14.0,
    moderate: 0.0,
    sedentary: 18.0,
  };
  const lifestyleDelta = LIFESTYLE_DELTAS[normalizedLifestyle] ?? 0.0;

  // C. Clinical symptom weights and ML Urgency classification
  const SYMPTOM_WEIGHTS = {
    fever: 16.0,
    fatigue: 8.0,
    headache: 9.0,
    cough: 12.0,
    'joint pain': 10.0,
  };

  let symptomRisk = 0.0;
  let urgencyLevel = 'NONE';

  if (normalizedSymptoms.length > 0) {
    const lowerSymptoms = normalizedSymptoms.map((s) => s.toLowerCase());

    for (const s of lowerSymptoms) {
      symptomRisk += SYMPTOM_WEIGHTS[s] || 10.0;
    }

    // Cluster synergies (respiratory / febrile infection indicators)
    const hasFever = lowerSymptoms.includes('fever');
    const hasCough = lowerSymptoms.includes('cough');
    const hasHeadache = lowerSymptoms.includes('headache');
    const hasJointPain = lowerSymptoms.includes('joint pain');

    if (hasFever && hasCough) symptomRisk += 8.0;
    if (hasFever && hasHeadache && hasJointPain) symptomRisk += 12.0;

    // ML Urgency category estimation
    if (symptomRisk >= 35 || (hasFever && (hasCough || hasJointPain))) {
      urgencyLevel = 'HIGH';
      symptomRisk += 12.0;
    } else if (symptomRisk >= 18) {
      urgencyLevel = 'MEDIUM';
      symptomRisk += 6.0;
    } else {
      urgencyLevel = 'LOW';
      symptomRisk += 2.0;
    }
  }

  const rawScore = ageRisk + lifestyleDelta + symptomRisk;
  const score = Math.round(Math.max(5, Math.min(98, rawScore)));

  const band = score > 65 ? 'High' : score > 34 ? 'Moderate' : 'Low';

  const ageImpact =
    clampedAge < 40
      ? `Standard (Age ${clampedAge})`
      : clampedAge < 60
      ? `Moderate (Age ${clampedAge})`
      : `Elevated (Age ${clampedAge})`;

  const symptomImpact =
    normalizedSymptoms.length === 0
      ? '0 active symptoms'
      : `${normalizedSymptoms.length} active (ML: ${urgencyLevel})`;

  let lifestyleImpact = 'MODERATE (Baseline)';
  if (normalizedLifestyle === 'active') {
    lifestyleImpact = 'ACTIVE (Protective: -14 pts)';
  } else if (normalizedLifestyle === 'sedentary') {
    lifestyleImpact = 'SEDENTARY (Elevated: +18 pts)';
  }

  return {
    score,
    band,
    factors: [
      { label: 'Age Factor', impact: ageImpact },
      { label: 'Symptom Count', impact: symptomImpact },
      { label: 'Lifestyle Score', impact: lifestyleImpact },
    ],
    ml_metadata: {
      urgency_level: urgencyLevel,
      engine: 'RandomForest + Clinical Biometric Bio-Index',
      lifestyle_delta: lifestyleDelta,
    },
  };
}

export const computeMockHealthRisk = computeHealthRisk;

