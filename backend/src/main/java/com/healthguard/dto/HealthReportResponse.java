package com.healthguard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Map;

/**
 * Returned by {@code GET /officer/reports/{reportType}} - a summary report
 * covering the authenticated Health Officer's villages for the requested
 * period. {@code reportType} is one of {@code daily}, {@code weekly}, or
 * {@code monthly}.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HealthReportResponse {

    private String reportType;
    private LocalDateTime generatedAt;
    private LocalDate periodStart;
    private LocalDate periodEnd;

    private long villagesCovered;
    private long phcsCovered;
    private long activeAshaWorkers;
    private long citizensCovered;
    private long healthRecordsLogged;

    private Map<String, Long> byRecordType;
}
