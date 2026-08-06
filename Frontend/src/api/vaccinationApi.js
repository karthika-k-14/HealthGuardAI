import { mockRequest } from './mockClient';
import vaccinationsFixture from '../data/vaccinations.json';

export async function fetchVaccinationRecord() {
  return mockRequest(vaccinationsFixture);
}
