import { mockRequest } from './mockClient';
import onboardingSlides from '../data/onboardingSlides.json';

export async function fetchOnboardingSlides() {
  return mockRequest(onboardingSlides);
}
