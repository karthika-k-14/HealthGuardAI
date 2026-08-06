import { mockRequest } from './mockClient';
import platformStats from '../data/platformStats.json';
import features from '../data/features.json';
import diseasesFixture from '../data/diseases.json';
import govCampaigns from '../data/govCampaigns.json';
import testimonials from '../data/testimonials.json';
import faq from '../data/faq.json';
import suggestedQuestions from '../data/suggestedQuestions.json';

export async function fetchPlatformStats() {
  return mockRequest(platformStats);
}

export async function fetchFeatures() {
  return mockRequest(features);
}

export async function fetchDiseaseCategories() {
  return mockRequest(diseasesFixture.categories);
}

export async function fetchDiseases({ category, search } = {}) {
  return mockRequest(() => {
    let list = diseasesFixture.diseases;
    if (category && category !== 'All') {
      list = list.filter((d) => d.category === category);
    }
    if (search) {
      const q = search.trim().toLowerCase();
      list = list.filter((d) => d.name.toLowerCase().includes(q));
    }
    return list;
  });
}

export async function fetchGovCampaigns() {
  return mockRequest(govCampaigns);
}

export async function fetchTestimonials() {
  return mockRequest(testimonials);
}

export async function fetchFaqs() {
  return mockRequest(faq);
}

export async function fetchSuggestedQuestions() {
  return mockRequest(suggestedQuestions);
}

/**
 * Mock AI Health Risk Demo scorer. Deliberately simple and
 * deterministic-ish so the UI has something believable to animate —
 * this is explicitly a demo, not a medical model.
 */
export async function computeMockHealthRisk({ age, symptoms = [], lifestyle }) {
  return mockRequest(() => {
    let score = 20;
    score += Math.max(0, (Number(age) || 0) - 30) * 0.6;
    score += symptoms.length * 9;
    if (lifestyle === 'sedentary') score += 12;
    if (lifestyle === 'moderate') score += 4;
    if (lifestyle === 'active') score -= 8;
    score = Math.max(4, Math.min(96, Math.round(score)));

    let band = 'Low';
    if (score >= 66) band = 'High';
    else if (score >= 35) band = 'Moderate';

    return {
      score,
      band,
      factors: [
        { label: 'Age factor', impact: age > 45 ? 'Elevated' : 'Normal' },
        { label: 'Reported symptoms', impact: symptoms.length > 0 ? `${symptoms.length} noted` : 'None reported' },
        { label: 'Lifestyle', impact: lifestyle || 'Not specified' },
      ],
    };
  }, { latency: 900 });
}
