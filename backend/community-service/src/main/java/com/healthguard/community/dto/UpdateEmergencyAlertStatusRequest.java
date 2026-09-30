package com.healthguard.community.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateEmergencyAlertStatusRequest {
    private String status;
    private String notes;
    private String performedBy;
    private String performedRole;
}
