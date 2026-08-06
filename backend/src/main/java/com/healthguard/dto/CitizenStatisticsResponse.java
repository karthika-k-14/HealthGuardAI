package com.healthguard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

/**
 * Statistics breakdown for citizens across the platform.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CitizenStatisticsResponse {

    private long totalCitizens;
    private long activeCitizens;
    private long inactiveCitizens;
    private Map<String, Long> genderBreakdown;
    private Map<String, Long> ageGroupBreakdown;
    private long citizensWithChronicDiseases;
    private long citizensWithAllergies;
}
