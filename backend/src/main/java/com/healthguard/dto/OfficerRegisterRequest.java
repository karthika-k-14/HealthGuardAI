package com.healthguard.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

/**
 * Health Officer self-registration. Account starts PENDING until an Admin
 * approves it. District/village oversight is assigned later by an Admin,
 * not at signup time.
 */
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class OfficerRegisterRequest extends BaseRegisterRequest {

    @NotBlank(message = "Employee ID is required")
    private String employeeId;
}
