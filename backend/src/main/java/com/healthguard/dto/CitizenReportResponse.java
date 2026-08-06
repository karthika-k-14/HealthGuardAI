package com.healthguard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * Response DTO for Citizen Report.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CitizenReportResponse {

    private String reportTitle;
    private LocalDateTime generatedAt;
    private Map<String, Object> appliedFilters;

    private long totalCitizens;
    private long activeCitizens;
    private Map<String, Long> genderBreakdown;
    private Map<String, Long> ageGroupBreakdown;
    private long citizensWithChronicDiseases;
    private long citizensWithAllergies;
    private Map<String, Long> villageBreakdown;
}
