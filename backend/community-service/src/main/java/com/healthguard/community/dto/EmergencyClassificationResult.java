package com.healthguard.community.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmergencyClassificationResult {
    private String urgencyLevel; // LOW, MEDIUM, HIGH, CRITICAL
    private Double urgencyScore;
    private Boolean isLifeThreatening;
    private String recommendedAction;
    private String rationale;
}
