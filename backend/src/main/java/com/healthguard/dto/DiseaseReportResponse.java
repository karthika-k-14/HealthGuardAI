package com.healthguard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * Response DTO for Disease Report.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DiseaseReportResponse {

    private String reportTitle;
    private LocalDateTime generatedAt;
    private Map<String, Object> appliedFilters;

    private long totalHealthRecords;
    private long citizensWithChronicDiseasesCount;
    private long highRiskCitizensCount;
    private Map<String, Long> chronicDiseaseDistribution;
    private Map<String, Long> healthRecordsByType;
}
