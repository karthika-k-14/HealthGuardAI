package com.healthguard.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

/**
 * Pharmacist self-registration. Account starts PENDING until an Admin
 * approves it. PHC/pharmacy assignment is done later by an Admin, not at
 * signup time.
 */
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class PharmacistRegisterRequest extends BaseRegisterRequest {

    @NotBlank(message = "Employee ID is required")
    private String employeeId;

    @NotBlank(message = "License number is required")
    private String licenseNumber;
}
