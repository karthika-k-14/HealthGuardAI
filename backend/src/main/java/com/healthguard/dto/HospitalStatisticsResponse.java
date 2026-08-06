package com.healthguard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

/**
 * Statistics breakdown for hospitals and health centers.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HospitalStatisticsResponse {

    private long totalHospitals;
    private long totalBeds;
    private long emergencyServicesHospitals;
    private Map<String, Long> hospitalTypeBreakdown;
    private Map<String, Long> hospitalStatusBreakdown;
    private long totalPhcs;
}
