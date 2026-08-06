package com.healthguard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

/**
 * High-level summary response backing the central Analytics Dashboard.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardSummaryResponse {

    private long totalCitizens;
    private long totalAshaWorkers;
    private long totalHealthOfficers;
    private long totalPharmacists;
    private long totalHospitals;
    private long totalPhcs;
    private long totalVillages;
    private long totalMedicines;
    private long totalPrescriptions;
    private long totalCampaigns;
    private long totalNotifications;

    private Map<String, Object> summaryOverview;
}
