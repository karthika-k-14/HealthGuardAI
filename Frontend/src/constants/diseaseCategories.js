// AI Module 3 — Disease Classification.
// The problem statement names exactly five disease categories the
// chatbot/symptom-checker must classify into. This is the single
// source of truth for that taxonomy so no page/service re-declares
// its own copy.

export const DISEASE_CATEGORIES = {
  RESPIRATORY: 'Respiratory',
  VECTOR_BORNE: 'Vector-borne',
  MATERNAL: 'Maternal Health',
  CHILD_HEALTH: 'Child Health',
  GENERAL: 'General Illness',
};

export const DISEASE_CATEGORY_LIST = Object.values(DISEASE_CATEGORIES);

// Known-condition -> category lookup, keyed by lowercased disease name
// (covers symptomConditions.json + common free-text disease mentions).
export const DISEASE_NAME_CATEGORY_MAP = {
  dengue: DISEASE_CATEGORIES.VECTOR_BORNE,
  malaria: DISEASE_CATEGORIES.VECTOR_BORNE,
  chikungunya: DISEASE_CATEGORIES.VECTOR_BORNE,
  filariasis: DISEASE_CATEGORIES.VECTOR_BORNE,
  'seasonal influenza': DISEASE_CATEGORIES.RESPIRATORY,
  influenza: DISEASE_CATEGORIES.RESPIRATORY,
  flu: DISEASE_CATEGORIES.RESPIRATORY,
  asthma: DISEASE_CATEGORIES.RESPIRATORY,
  pneumonia: DISEASE_CATEGORIES.RESPIRATORY,
  tuberculosis: DISEASE_CATEGORIES.RESPIRATORY,
  covid: DISEASE_CATEGORIES.RESPIRATORY,
  'common cold': DISEASE_CATEGORIES.RESPIRATORY,
  migraine: DISEASE_CATEGORIES.GENERAL,
  gastroenteritis: DISEASE_CATEGORIES.GENERAL,
  diabetes: DISEASE_CATEGORIES.GENERAL,
  pregnancy: DISEASE_CATEGORIES.MATERNAL,
  'antenatal care': DISEASE_CATEGORIES.MATERNAL,
  'postnatal care': DISEASE_CATEGORIES.MATERNAL,
  'child growth': DISEASE_CATEGORIES.CHILD_HEALTH,
  malnutrition: DISEASE_CATEGORIES.CHILD_HEALTH,
};

// Symptom/keyword fallback used when the disease name isn't in the
// lookup above (e.g. classifying straight from chatbot free text or
// a symptom-checker input that didn't match a known condition).
export const CATEGORY_KEYWORD_RULES = [
  { category: DISEASE_CATEGORIES.MATERNAL, keywords: ['pregnan', 'prenatal', 'antenatal', 'maternal', 'baby bump', 'gestation', 'गर्भावस्था', 'கர்ப்பம்', 'ଗର୍ଭାବସ୍ଥା'] },
  { category: DISEASE_CATEGORIES.CHILD_HEALTH, keywords: ['infant', 'newborn', 'toddler', 'child immuni', 'growth chart', 'malnutrition', 'बच्च', 'குழந்தை', 'ଶିଶୁ'] },
  { category: DISEASE_CATEGORIES.VECTOR_BORNE, keywords: ['mosquito', 'dengue', 'malaria', 'chikungunya', 'joint pain', 'rash', 'मच्छर', 'கொசு', 'ମଶା'] },
  { category: DISEASE_CATEGORIES.RESPIRATORY, keywords: ['cough', 'breath', 'chest congestion', 'wheeze', 'cold', 'flu', 'sore throat', 'खांसी', 'இருமல்', 'କାଶ'] },
];

/**
 * Classifies a known disease/condition name into one of the 5 spec
 * categories. Falls back to keyword matching over symptom text, then
 * to General Illness.
 */
export function classifyDiseaseCategory({ diseaseName = '', symptomsText = '' } = {}) {
  const nameLower = diseaseName.toLowerCase().trim();
  if (DISEASE_NAME_CATEGORY_MAP[nameLower]) {
    return DISEASE_NAME_CATEGORY_MAP[nameLower];
  }

  const haystack = `${diseaseName} ${symptomsText}`.toLowerCase();
  for (const rule of CATEGORY_KEYWORD_RULES) {
    if (rule.keywords.some((kw) => haystack.includes(kw))) {
      return rule.category;
    }
  }

  return DISEASE_CATEGORIES.GENERAL;
}
