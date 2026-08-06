package com.healthguard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * Response DTO for Daily Report.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DailyReportResponse {

    private String reportTitle;
    private String reportPeriod;
    private LocalDateTime generatedAt;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private Map<String, Object> appliedFilters;

    private long newCitizensRegistered;
    private long newHealthRecordsCreated;
    private long prescriptionsCreated;
    private long prescriptionsDispensed;
    private long activeCampaigns;
    private long newMedicinesAdded;
    private long sosRequestsCount;

    private Map<String, Object> summaryOverview;
}
