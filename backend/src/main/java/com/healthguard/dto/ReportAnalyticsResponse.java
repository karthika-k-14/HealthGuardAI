package com.healthguard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Analytics response for periodic reports (Monthly, Weekly, Daily).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReportAnalyticsResponse {

    private String reportType;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private long newCitizensRegistered;
    private long newHealthRecordsCreated;
    private long prescriptionsCreated;
    private long prescriptionsDispensed;
    private long notificationsSent;
    private long activeCampaigns;
    private long newMedicinesAdded;
}
