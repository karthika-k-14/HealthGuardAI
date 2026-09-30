package com.healthguard.community.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmergencyStatisticsDTO {
    private long totalHighUrgencyCases;
    private long totalCriticalCases;
    private long pendingAlerts;
    private long escalatedCases;
    private long resolvedCases;
    private String averageResponseTime;
    private long casesResolvedToday;
    private long criticalCasesThisWeek;
    private double escalationRate;
    private List<Map<String, Object>> topEmergencySymptoms;
}
