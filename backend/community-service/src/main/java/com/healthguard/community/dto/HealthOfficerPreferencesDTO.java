package com.healthguard.community.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HealthOfficerPreferencesDTO {
    private Long id;
    private Long userId;
    private Boolean diseaseSurveillanceAlerts;
    private Boolean highRiskCaseNotifications;
    private Boolean referralEscalationAlerts;
    private Boolean outbreakDetectionAlerts;
    private Boolean campaignUpdateNotifications;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
