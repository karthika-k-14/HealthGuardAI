import { mockRequest } from './mockClient';
import villageAnalyticsFixture from '../data/villageAnalytics.json';

/**
 * AI Public Health Intelligence Center — village-level analytics.
 *
 * The shape returned here is exactly the future backend contract:
 *   { state, district, villages: [{ name, riskLevel, totalAssessments,
 *     highRiskCases, criticalCases, topDisease }, ...] }
 *
 * Today this resolves to realistic mock data for Coimbatore, Tamil
 * Nadu (see src/data/villageAnalytics.json) — but no consumer of this
 * function ever hardcodes a village name; every widget just renders
 * whatever `villages` array comes back. When a real backend is wired
 * up, this function becomes the ONLY place that changes (swap
 * `mockRequest(villageAnalyticsFixture)` for an HTTP GET against the
 * real endpoint) — no UI changes required anywhere else.
 */
export async function fetchVillageAnalytics() {
  return mockRequest(villageAnalyticsFixture);
}

/**
 * Just the plain list of village names for this district — backs the
 * citizen registration village field (as autocomplete suggestions)
 * and any other place that needs a configurable village list without
 * caring about analytics. Reads from the same source as
 * fetchVillageAnalytics so the two are never out of sync, and will
 * automatically reflect whatever the backend returns once connected.
 */
export async function fetchVillageOptions() {
  return mockRequest(() => villageAnalyticsFixture.villages.map((v) => v.name));
}
