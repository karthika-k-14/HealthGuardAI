package com.healthguard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

/**
 * Statistics breakdown for pharmacy inventory and medicines.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MedicineStatisticsResponse {

    private long totalMedicines;
    private long totalStockQuantity;
    private long lowStockCount;
    private long outOfStockCount;
    private long expiredCount;
    private Map<String, Long> categoryBreakdown;
}
