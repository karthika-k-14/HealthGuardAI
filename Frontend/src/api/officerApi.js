import { mockRequest } from './mockClient';
import diseaseStats from '../data/diseaseStats.json';
import campaignsFixture from '../data/campaigns.json';
import districtOverviewFixture from '../data/districtOverview.json';
import diseaseMonitoringFixture from '../data/diseaseMonitoring.json';
import healthMapFixture from '../data/healthMapZones.json';
import officerHospitalsFixture from '../data/officerHospitals.json';
import vaccinationMonitorFixture from '../data/vaccinationMonitor.json';
import emergencyCenterFixture from '../data/emergencyCenter.json';
import officerProfileFixture from '../data/officerProfile.json';

// Kept as-is — consumed by the landing page's live stats panel.
export async function fetchDistrictSurveillance() {
  return mockRequest(diseaseStats);
}

// Kept as-is — the Campaign Management page primarily uses
// campaignApi.js directly (see fetchCampaigns/fetchCampaignById
// there); this stays for any existing callers of the officer-scoped
// alias.
export async function fetchDistrictCampaigns() {
  return mockRequest(campaignsFixture);
}

// ---- Dashboard ----

export async function fetchDistrictOverview() {
  return mockRequest(districtOverviewFixture);
}

export async function fetchTodaysAlerts() {
  return mockRequest(() => [
    ...emergencyCenterFixture.outbreakAlerts.map((a) => ({
      id: a.id,
      label: `${a.disease} outbreak — ${a.area} (${a.reportedCases} cases)`,
      severity: a.severity,
    })),
    ...emergencyCenterFixture.disasterAlerts.map((d) => ({
      id: d.id,
      label: `${d.type} — ${d.area}`,
      severity: 'Medium',
    })),
  ]);
}

export async function fetchEmergencyPanelSummary() {
  return mockRequest(() => ({
    outbreakAlerts: emergencyCenterFixture.outbreakAlerts.length,
    ambulanceRequests: emergencyCenterFixture.ambulanceRequests.filter((a) => a.status === 'Pending').length,
    medicineShortages: emergencyCenterFixture.medicineShortages.length,
    disasterAlerts: emergencyCenterFixture.disasterAlerts.length,
  }));
}

export async function fetchRecentActivities() {
  return mockRequest(() => [
    { id: 'oact_1', label: 'Approved additional ICU capacity at Ganga Hospital', date: '2026-07-05' },
    { id: 'oact_2', label: 'Launched Dengue Prevention Week campaign', date: '2026-06-28' },
    { id: 'oact_3', label: 'Reviewed weekly surveillance report from 12 ASHA workers', date: '2026-06-27' },
    { id: 'oact_4', label: 'Dispatched ambulance to Sulur Community Health Centre', date: '2026-07-05' },
  ]);
}

// ---- District analytics ----

export async function fetchDistrictAnalytics() {
  return mockRequest(districtOverviewFixture);
}

// ---- Disease monitoring ----

export async function fetchDiseaseMonitoring() {
  return mockRequest(diseaseMonitoringFixture);
}

// ---- Health map ----

export async function fetchHealthMapData() {
  return mockRequest(healthMapFixture);
}

// ---- Hospital management ----

// Deprecated: kept only so nothing that still imports the old name
// breaks. Use fetchReferralMonitoring() instead — this project is a
// public-health chatbot platform, not a hospital operations system,
// so Health Officer's job here is monitoring referrals into PHCs/
// hospitals, not managing beds/staff/ambulances.
export async function fetchHospitalManagement() {
  return mockRequest(officerHospitalsFixture);
}

/**
 * PHC/Hospital Referral Monitoring — the Health Officer responsibility
 * named in the spec ("Referral monitoring"). Combines the static
 * facility directory (kept only as light capacity context, e.g. is a
 * PHC currently over-full) with live referral counts pulled from the
 * shared workflow case store, so the primary view is "how many
 * citizens have been referred where, and what's the outcome" rather
 * than bed/staff/ambulance management.
 */
export async function fetchReferralMonitoring() {
  const { fetchAllCases } = await import('./workflowApi');
  const cases = await fetchAllCases();
  return mockRequest(() =>
    officerHospitalsFixture.map((facility) => {
      const referrals = cases.filter((c) => c.hospitalReferral === facility.name);
      const pending = referrals.filter((c) => c.status !== 'Completed').length;
      const completed = referrals.filter((c) => c.status === 'Completed').length;
      const isPHC = facility.type === 'PHC' || /PHC|Community Health Centre|CHC/i.test(facility.name);
      return {
        id: facility.id,
        name: facility.name,
        facilityType: isPHC ? 'PHC' : facility.type,
        currentLoadPercent: Math.round(((facility.totalBeds - facility.availableBeds) / facility.totalBeds) * 100),
        totalReferrals: referrals.length,
        pendingReferrals: pending,
        completedReferrals: completed,
        recentReferrals: referrals.slice(0, 5).map((c) => ({
          citizenName: c.citizenName,
          disease: c.disease,
          riskLevel: c.riskLevel,
          status: c.status,
          referredAt: c.createdDate,
        })),
      };
    })
  );
}

// ---- Vaccination monitor ----

export async function fetchVaccinationMonitor() {
  return mockRequest(vaccinationMonitorFixture);
}

// ---- Emergency center ----

export async function fetchEmergencyCenter() {
  return mockRequest(emergencyCenterFixture);
}

// ---- Reports ----

export async function generateOfficerReport(reportType) {
  return mockRequest(() => {
    const base = {
      daily: { newCases: 34, recoveries: 41, alertsIssued: 2 },
      weekly: { newCases: 218, recoveries: 260, alertsIssued: 6 },
      monthly: { newCases: 940, recoveries: 1120, alertsIssued: 19 },
      district: {
        population: districtOverviewFixture.totalPopulation,
        hospitals: districtOverviewFixture.hospitals,
        phcs: districtOverviewFixture.phcs,
        ashaWorkers: districtOverviewFixture.ashaWorkers,
      },
      disease: {
        highestBurden: diseaseMonitoringFixture.sort((a, b) => b.activeCases - a.activeCases)[0].name,
        totalActiveCases: diseaseMonitoringFixture.reduce((sum, d) => sum + d.activeCases, 0),
      },
    };
    return {
      reportType,
      generatedAt: new Date().toISOString(),
      summary: base[reportType] || {},
    };
  }, { latency: 700 });
}

// ---- Profile ----

export async function fetchOfficerProfile() {
  return mockRequest(officerProfileFixture);
}

// ---- Unique features ----

// Live Health Command Center — a compact "as of now" pulse combining
// several signals into one glanceable feed.
export async function fetchCommandCenterPulse() {
  return mockRequest(() => ({
    activeOutbreaks: emergencyCenterFixture.outbreakAlerts.length,
    hospitalsNearCapacity: officerHospitalsFixture.filter((h) => h.emergencyStatus !== 'Operational').length,
    pendingAmbulanceRequests: emergencyCenterFixture.ambulanceRequests.filter((a) => a.status === 'Pending').length,
    campaignsActive: campaignsFixture.filter((c) => c.status === 'active').length,
    lastUpdated: new Date().toISOString(),
  }));
}

// District Health Score — composite score from disease burden,
// vaccination coverage, and hospital capacity.
export async function fetchDistrictHealthScore() {
  return mockRequest(() => {
    const avgRecovery = Math.round(
      diseaseMonitoringFixture.reduce((sum, d) => sum + d.recoveryRate, 0) / diseaseMonitoringFixture.length
    );
    const capacityHealth =
      100 -
      Math.round(
        (officerHospitalsFixture.filter((h) => h.emergencyStatus !== 'Operational').length / officerHospitalsFixture.length) * 100
      );
    const score = Math.round(avgRecovery * 0.4 + vaccinationMonitorFixture.coverage * 0.4 + capacityHealth * 0.2);
    return {
      score: Math.max(0, Math.min(100, score)),
      breakdown: [
        { label: 'Avg. recovery rate', value: avgRecovery },
        { label: 'Vaccination coverage', value: vaccinationMonitorFixture.coverage },
        { label: 'Hospital capacity health', value: capacityHealth },
      ],
    };
  });
}

// AI Outbreak Prediction — mock forward-looking projection per
// disease based on current trend direction.
export async function fetchOutbreakPrediction() {
  return mockRequest(() =>
    diseaseMonitoringFixture.map((d) => {
      const trend = d.trend;
      const recentSlope = trend[trend.length - 1].cases - trend[trend.length - 2].cases;
      const projected = Math.max(0, Math.round(d.activeCases + recentSlope * 2));
      return {
        disease: d.name,
        currentCases: d.activeCases,
        projectedCases2Weeks: projected,
        direction: recentSlope > 0 ? 'rising' : recentSlope < 0 ? 'falling' : 'steady',
      };
    })
  );
}

// Emergency Response Timeline — chronological feed across the
// emergency center's alert types.
export async function fetchEmergencyResponseTimeline() {
  return mockRequest(() => {
    const events = [
      ...emergencyCenterFixture.outbreakAlerts.map((a) => ({
        id: a.id,
        label: `${a.disease} outbreak reported in ${a.area}`,
        time: '2026-07-05T08:00:00+05:30',
        type: 'outbreak',
      })),
      ...emergencyCenterFixture.ambulanceRequests.map((a) => ({
        id: a.id,
        label: `Ambulance ${a.status.toLowerCase()} — ${a.location}`,
        time: a.requestedAt,
        type: 'ambulance',
      })),
      ...emergencyCenterFixture.disasterAlerts.map((d) => ({
        id: d.id,
        label: `${d.type} issued for ${d.area}`,
        time: `${d.issuedOn}T06:00:00+05:30`,
        type: 'disaster',
      })),
    ];
    return events.sort((a, b) => new Date(b.time) - new Date(a.time));
  });
}

// Resource Allocation Dashboard — beds/ICU/ambulance capacity summary
// across all monitored facilities.
export async function fetchResourceAllocation() {
  return mockRequest(() => ({
    totalBeds: officerHospitalsFixture.reduce((s, h) => s + h.totalBeds, 0),
    availableBeds: officerHospitalsFixture.reduce((s, h) => s + h.availableBeds, 0),
    totalIcuBeds: officerHospitalsFixture.reduce((s, h) => s + h.icuBeds, 0),
    availableIcuBeds: officerHospitalsFixture.reduce((s, h) => s + h.icuAvailable, 0),
    totalAmbulances: officerHospitalsFixture.reduce((s, h) => s + h.ambulances, 0),
    byFacility: officerHospitalsFixture.map((h) => ({
      name: h.name,
      bedOccupancy: Math.round(((h.totalBeds - h.availableBeds) / h.totalBeds) * 100),
      icuOccupancy: h.icuBeds > 0 ? Math.round(((h.icuBeds - h.icuAvailable) / h.icuBeds) * 100) : 0,
    })),
  }));
}

// Medicine Demand Prediction — mock forecast derived from disease
// burden (higher active-case diseases drive higher predicted demand
// for their typical treatment medicines).
export async function fetchMedicineDemandPrediction() {
  return mockRequest(() => {
    const map = {
      Dengue: 'Paracetamol & ORS',
      Malaria: 'Antimalarials',
      'COVID-19': 'Antipyretics & Vitamin C',
      Tuberculosis: 'Anti-TB combination therapy',
      Cholera: 'ORS & IV fluids',
      Typhoid: 'Antibiotics (Azithromycin class)',
    };
    return diseaseMonitoringFixture
      .map((d) => ({
        medicine: map[d.name] || 'General supportive care',
        disease: d.name,
        demandLevel: d.activeCases > 300 ? 'High' : d.activeCases > 100 ? 'Medium' : 'Low',
      }))
      .sort((a, b) => (a.demandLevel === 'High' ? -1 : 1));
  });
}

// Vaccination recommendations — mock guidance based on age-group
// coverage gaps.
export async function fetchVaccinationRecommendations() {
  return mockRequest(() =>
    vaccinationMonitorFixture.populationByAgeGroup
      .filter((g) => g.covered < 85)
      .map((g) => ({
        ageGroup: g.ageGroup,
        recommendation: `Prioritize outreach for ${g.ageGroup} — coverage at ${g.covered}%, below the 85% target.`,
      }))
  );
}

// Hospital Load Prediction — mock projection of bed occupancy based
// on current active case trajectory.
export async function fetchHospitalLoadPrediction() {
  return mockRequest(() =>
    officerHospitalsFixture.map((h) => {
      const occupancy = Math.round(((h.totalBeds - h.availableBeds) / h.totalBeds) * 100);
      const projected = Math.min(100, occupancy + (h.emergencyStatus === 'Critical' ? 15 : h.emergencyStatus === 'Near Capacity' ? 8 : 3));
      return { name: h.name, currentOccupancy: occupancy, projectedOccupancy7d: projected };
    })
  );
}

// Campaign Success Analytics — reach vs. target-style summary derived
// from the shared campaigns fixture.
export async function fetchCampaignSuccessAnalytics() {
  return mockRequest(() =>
    campaignsFixture.map((c) => ({
      id: c.id,
      title: c.title,
      type: c.type,
      status: c.status,
      progress: c.progress ?? 0,
      reach: c.reach,
    }))
  );
}

// AI Decision Support Panel — a small set of mock recommended actions
// synthesized from current district signals.
export async function fetchAIDecisionSupport() {
  return mockRequest(() => [
    {
      id: 'dec_1',
      priority: 'High',
      recommendation: 'Deploy additional ASHA teams to Ward 3 given rising dengue cases and high-risk zone status.',
    },
    {
      id: 'dec_2',
      priority: 'High',
      recommendation: 'Redirect non-critical admissions away from Sulur Community Health Centre — bed occupancy critical.',
    },
    {
      id: 'dec_3',
      priority: 'Medium',
      recommendation: 'Schedule a catch-up vaccination drive for the 60+ age group to close the coverage gap.',
    },
    {
      id: 'dec_4',
      priority: 'Medium',
      recommendation: 'Pre-position ORS and IV fluid stock ahead of the heavy rain advisory.',
    },
  ]);
}

// ---- AI Health Insights (chat-style, mirrors other roles' assistants) ----

const INSIGHT_TOPICS = {
  prediction: 'Disease trends suggest dengue cases may rise further over the next two weeks based on current trajectory — consider proactive vector control in high-risk wards.',
  highRiskAreas: 'Ward 3 (Periyanaickenpalayam) and Ward 9 (Singanallur) currently show the highest concentration of active cases and warrant focused monitoring.',
  medicineDemand: 'Expect elevated demand for antipyretics, ORS, and antimalarials given current disease burden — recommend reviewing stock at facilities serving high-risk wards.',
  vaccination: 'Coverage among the 60+ age group is below target — a targeted booster camp could close this gap efficiently.',
  hospitalLoad: 'Sulur Community Health Centre is at critical capacity; redistributing non-emergency cases to nearby facilities is advised.',
};

export async function sendHealthInsightQuery({ message, topic }) {
  return mockRequest(() => ({
    id: `oimsg_${Date.now()}`,
    role: 'assistant',
    content:
      INSIGHT_TOPICS[topic] ||
      'I can help with disease prediction, high-risk area identification, medicine demand forecasts, vaccination recommendations, and hospital load prediction. Select a topic or ask a question.',
    inReplyTo: message,
  }), { latency: 850 });
}

// ---- AI Emergency Prediction ----

/**
 * Mock 24-48h emergency-load prediction derived from current
 * outbreak alerts, disaster advisories, and hospital capacity strain
 * — distinct from the disease-level AI Outbreak Prediction above.
 * Demo heuristic only, not a real forecasting model.
 */
export async function fetchEmergencyPrediction() {
  return mockRequest(() => {
    const criticalFacilities = officerHospitalsFixture.filter((h) => h.emergencyStatus === 'Critical').length;
    const nearCapacity = officerHospitalsFixture.filter((h) => h.emergencyStatus === 'Near Capacity').length;
    const activeOutbreaks = emergencyCenterFixture.outbreakAlerts.length;
    const activeDisasters = emergencyCenterFixture.disasterAlerts.filter((d) => d.status === 'Active').length;

    let score = 20 + criticalFacilities * 22 + nearCapacity * 10 + activeOutbreaks * 12 + activeDisasters * 15;
    score = Math.max(5, Math.min(97, Math.round(score)));

    const riskLevel = score >= 65 ? 'High' : score >= 35 ? 'Medium' : 'Low';

    const factors = [
      { label: 'Facilities at critical capacity', value: criticalFacilities },
      { label: 'Facilities near capacity', value: nearCapacity },
      { label: 'Active outbreak alerts', value: activeOutbreaks },
      { label: 'Active disaster advisories', value: activeDisasters },
    ].filter((f) => f.value > 0);

    return {
      likelihoodPercent: score,
      riskLevel,
      window: 'Next 24–48 hours',
      factors,
      recommendation:
        riskLevel === 'High'
          ? 'Pre-position additional ambulances and alert nearby facilities to prepare surge capacity.'
          : riskLevel === 'Medium'
          ? 'Monitor closely and confirm on-call staffing is adequate for the next shift.'
          : 'No immediate action needed — continue routine monitoring.',
    };
  }, { latency: 700 });
}

/**
 * AI Module 8 (adjacent) analytics for the Health Officer dashboard —
 * aggregates the live case store into disease-category breakdown,
 * urgency distribution, AI-escalation counts, and ward/village-wise
 * trends. Reuses fetchAllCases() rather than re-deriving case data,
 * so it always agrees with what ASHA/Admin see.
 */
export async function fetchAIPipelineAnalytics() {
  const { fetchAllCases } = await import('./workflowApi');
  const cases = await fetchAllCases();

  return mockRequest(() => {
    const byCategory = {};
    const byUrgency = { Low: 0, Medium: 0, High: 0, Critical: 0 };
    const byWard = {};
    let criticalEscalations = 0;
    let highEscalations = 0;

    cases.forEach((c) => {
      const category = c.diseaseCategory || 'Uncategorized';
      byCategory[category] = (byCategory[category] || 0) + 1;

      if (byUrgency[c.riskLevel] !== undefined) byUrgency[c.riskLevel] += 1;

      const ward = c.ward || 'Unassigned';
      byWard[ward] = (byWard[ward] || 0) + 1;

      if (c.riskLevel === 'Critical') criticalEscalations += 1;
      if (c.riskLevel === 'High') highEscalations += 1;
    });

    return {
      totalAICases: cases.length,
      diseaseCategoryBreakdown: Object.entries(byCategory).map(([category, count]) => ({ category, count })),
      urgencyDistribution: Object.entries(byUrgency).map(([level, count]) => ({ level, count })),
      escalationAnalytics: {
        criticalEscalations,
        highEscalations,
        criticalEscalationRate: cases.length ? Math.round((criticalEscalations / cases.length) * 100) : 0,
      },
      wardTrends: Object.entries(byWard)
        .map(([ward, count]) => ({ ward, count }))
        .sort((a, b) => b.count - a.count),
    };
  });
}
