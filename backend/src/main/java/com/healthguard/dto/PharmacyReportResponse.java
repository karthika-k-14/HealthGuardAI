package com.healthguard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Map;

/**
 * Returned by {@code GET /pharmacist/reports/{reportType}} - a summary
 * report for the requested period. {@code reportType} is one of
 * {@code daily}, {@code weekly}, {@code monthly}, or {@code usage}
 * (medicine usage report).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PharmacyReportResponse {

    private String reportType;
    private LocalDateTime generatedAt;
    private LocalDate periodStart;
    private LocalDate periodEnd;

    private long medicinesStockedIn;
    private long medicinesStockedOut;
    private long prescriptionsVerified;
    private long prescriptionsDispensed;
    private long totalMedicines;
    private long lowStockMedicines;
    private long outOfStockMedicines;

    /** Top medicine names -> quantity dispensed in the period. */
    private Map<String, Long> medicineUsage;
}
