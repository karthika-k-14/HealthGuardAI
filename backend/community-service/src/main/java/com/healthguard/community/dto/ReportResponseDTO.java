package com.healthguard.community.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReportResponseDTO {
    private String reportType;
    private String reportTitle;
    private String reportPeriod;
    private LocalDateTime generatedAt;
    private Boolean isEmpty;

    private Map<String, Object> summary;
    private Map<String, Object> metrics;
    private Map<String, Object> todayActivitiesSummary;

    private Map<String, Long> chronicDiseaseDistribution;
    private Map<String, Long> affectedPersonTypeDistribution;
    private Map<String, Long> severityDistribution;
    private Map<String, Long> monthlyRegistrationBreakdown;
    private Map<String, Long> visitStatusDistribution;
    private Map<String, Long> visitTypeBreakdown;
    private Map<String, Object> vaccinationCoverage;
    private Map<String, Object> childHealthSummary;

    private Map<String, Long> genderBreakdown;
    private Map<String, Long> genderAnalytics;
    private Map<String, Long> ageGroupBreakdown;
    private Map<String, Long> ageGroupAnalytics;
    private Map<String, Long> categoryBreakdown;
    private Map<String, String> summaryOverview;
    private Map<String, String> appliedFilters;

    private List<Map<String, Object>> timeSeriesTrend;
    private List<Map<String, Object>> records;
}
