import { mockRequest } from './mockClient';
import { classifyDiseaseCategory, DISEASE_CATEGORY_LIST } from '../constants/diseaseCategories';

/**
 * AI Module 3 — Disease Classification.
 * Reusable classification service shared by the Symptom Checker and
 * the Chatbot's disease/symptom-query handling, so both surfaces
 * agree on the same 5-category taxonomy instead of each inventing
 * its own labels.
 */
export async function classifyDisease({ diseaseName = '', symptoms = [] } = {}) {
  return mockRequest(() => {
    const category = classifyDiseaseCategory({ diseaseName, symptomsText: symptoms.join(' ') });
    return {
      category,
      allCategories: DISEASE_CATEGORY_LIST,
      basis: diseaseName ? 'known-condition-lookup' : 'symptom-keyword-match',
    };
  });
}
