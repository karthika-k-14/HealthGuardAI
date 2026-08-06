package com.healthguard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

/**
 * Returned by {@code GET /officer/disease-monitoring}.
 * <p>
 * There is no dedicated disease/outbreak entity in the data model yet, so
 * this is deliberately built as a "case monitoring" view derived from the
 * health records citizens have logged in the officer's villages, grouped
 * by record type and by village. {@code outbreakAlerts} always reads
 * empty for the same reason {@code diseaseAlerts} is 0 on the dashboard -
 * nothing exists yet to trigger a real alert from.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DiseaseMonitoringResponse {

    private long totalHealthRecords;
    private long recordsToday;
    private long recordsThisWeek;
    private long recordsThisMonth;

    /** Record count grouped by {@code HealthRecordType} (e.g. CONSULTATION, LAB_REPORT). */
    private Map<String, Long> byRecordType;

    /** Area-wise statistics: record count per village under the officer's supervision. */
    private List<VillageCaseStat> byVillage;

    private List<String> outbreakAlerts;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class VillageCaseStat {
        private Long villageId;
        private String villageName;
        private long recordCount;
    }
}
