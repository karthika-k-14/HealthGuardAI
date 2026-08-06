import apiClient from './axios';
import { mockRequest } from './mockClient';
import hospitalsFixture from '../data/hospitals.json';
import pharmaciesFixture from '../data/pharmacies.json';

export async function fetchNearbyHospitals() {
  return mockRequest(hospitalsFixture);
}

// ---- Hospital CRUD (Admin) ----
// Calls the real Spring Boot backend (HospitalController, "/admin/hospitals").
// Unlike fetchNearbyHospitals above (citizen-facing, mock distance/rating
// data), these manage the actual hospital records used by Admin CRUD.

export async function fetchHospitals() {
  const { data } = await apiClient.get('/admin/hospitals');
  return data;
}

export async function fetchHospitalById(hospitalId) {
  const { data } = await apiClient.get(`/admin/hospitals/${hospitalId}`);
  return data;
}

export async function createHospital(hospital) {
  const { data } = await apiClient.post('/admin/hospitals', hospital);
  return data;
}

export async function updateHospital(hospitalId, hospital) {
  const { data } = await apiClient.put(`/admin/hospitals/${hospitalId}`, hospital);
  return data;
}

export async function deleteHospital(hospitalId) {
  await apiClient.delete(`/admin/hospitals/${hospitalId}`);
  return { id: hospitalId, deleted: true };
}

export async function fetchNearbyPharmacies() {
  return mockRequest(pharmaciesFixture);
}

/**
 * AI Module 5 — Nearest PHC Recommendation. Returns facilities
 * ranked by distance, PHCs first, so a Medium-urgency citizen is
 * pointed at the most appropriate (not necessarily the biggest)
 * nearby facility.
 */
export async function fetchNearestPHCs(limit = 3) {
  return mockRequest(() =>
    [...hospitalsFixture]
      .sort((a, b) => {
        const aPHC = /PHC|Primary Health Centre/i.test(a.type) ? 0 : 1;
        const bPHC = /PHC|Primary Health Centre/i.test(b.type) ? 0 : 1;
        if (aPHC !== bPHC) return aPHC - bPHC;
        return a.distanceKm - b.distanceKm;
      })
      .slice(0, limit)
  );
}
