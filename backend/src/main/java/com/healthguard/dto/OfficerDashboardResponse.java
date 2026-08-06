package com.healthguard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Summary returned by {@code GET /officer/dashboard} - the authenticated
 * Health Officer's district-level counts across every village under their
 * supervision.
 * <p>
 * {@code highRiskPatients} is approximated as citizens with a non-blank
 * chronic-disease entry (no dedicated risk score exists yet).
 * {@code pendingCases} and {@code diseaseAlerts} always read 0: the data
 * model has no case-workflow or disease/outbreak entity yet, so there is
 * nothing to count. They are still returned (rather than omitted) so the
 * response shape matches the spec and is ready to populate once those
 * entities exist.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OfficerDashboardResponse {

    private long totalVillages;
    private long totalPhcs;
    private long activeAshaWorkers;
    private long citizensCovered;
    private long highRiskPatients;
    private long pendingCases;
    private long todaysReports;
    private long diseaseAlerts;
}
