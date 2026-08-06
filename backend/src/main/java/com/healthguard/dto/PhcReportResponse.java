package com.healthguard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * Response DTO for PHC Report.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PhcReportResponse {

    private String reportTitle;
    private LocalDateTime generatedAt;
    private Map<String, Object> appliedFilters;

    private long totalPhcs;
    private Map<String, Long> districtBreakdown;
    private Map<String, Long> villageBreakdown;
    private long totalAssignedAshaWorkers;
}
