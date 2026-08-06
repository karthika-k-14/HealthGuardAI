package com.healthguard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Summary returned by {@code GET /pharmacist/dashboard}.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PharmacistDashboardResponse {

    private long totalMedicines;
    private long lowStockMedicines;
    private long outOfStockMedicines;
    private long expiringMedicines;
    private long todaysPrescriptions;
    private long medicinesDispensedToday;
    private long pendingPrescriptionRequests;
}
