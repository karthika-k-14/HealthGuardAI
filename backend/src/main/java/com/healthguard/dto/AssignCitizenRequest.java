package com.healthguard.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request payload for assigning a prescription to a specific citizen.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AssignCitizenRequest {

    @NotNull(message = "Citizen ID is required")
    private Long citizenId;
}
