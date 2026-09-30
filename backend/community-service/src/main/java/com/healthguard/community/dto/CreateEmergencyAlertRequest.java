package com.healthguard.community.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateEmergencyAlertRequest {
    private Long citizenId;
    private String citizenName;
    private Long assignedAshaWorkerId;
    private String assignedAshaWorkerName;
    private String symptoms;
    private String diseaseCategory;
    private String urgencyLevel;
    private Double urgencyScore;
    private String village;
    private String district;
    private String notes;
}
