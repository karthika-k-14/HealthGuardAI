package com.healthguard.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

/**
 * ASHA Worker self-registration. Account starts PENDING until an Admin
 * approves it. Village/PHC assignment is done later by an Admin, not at
 * signup time.
 */
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class AshaRegisterRequest extends BaseRegisterRequest {

    @NotBlank(message = "Employee ID is required")
    private String employeeId;
}
