package com.healthguard.admin.pharmacist.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PharmacistExpiryThresholdResponse {
    private Integer expiryWarningThreshold;
}
