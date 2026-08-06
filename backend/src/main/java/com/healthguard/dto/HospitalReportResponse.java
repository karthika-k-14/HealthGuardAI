package com.healthguard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * Response DTO for Hospital Report.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HospitalReportResponse {

    private String reportTitle;
    private LocalDateTime generatedAt;
    private Map<String, Object> appliedFilters;

    private long totalHospitals;
    private long totalBeds;
    private long emergencyServicesHospitals;
    private Map<String, Long> hospitalTypeBreakdown;
    private Map<String, Long> hospitalStatusBreakdown;
    private Map<String, Long> districtBreakdown;
}
