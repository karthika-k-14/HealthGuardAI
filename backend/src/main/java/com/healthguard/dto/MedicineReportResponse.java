package com.healthguard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * Response DTO for Medicine Report.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MedicineReportResponse {

    private String reportTitle;
    private LocalDateTime generatedAt;
    private Map<String, Object> appliedFilters;

    private long totalMedicines;
    private long totalStockQuantity;
    private long lowStockCount;
    private long outOfStockCount;
    private long expiredCount;
    private Map<String, Long> categoryBreakdown;
    private long prescriptionsTotal;
    private long prescriptionsPending;
    private long prescriptionsDispensed;
}
