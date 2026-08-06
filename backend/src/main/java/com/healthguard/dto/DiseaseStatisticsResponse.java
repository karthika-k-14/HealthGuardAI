package com.healthguard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

/**
 * Disease monitoring and health condition analytics response.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DiseaseStatisticsResponse {

    private long citizensWithChronicDiseasesCount;
    private Map<String, Long> chronicDiseaseDistribution;
    private Map<String, Long> healthRecordsByType;
    private long highRiskCitizensCount;
}
