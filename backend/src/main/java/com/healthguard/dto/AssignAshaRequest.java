package com.healthguard.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Admin-only: assigns an ASHA Worker to a village and (optionally) a PHC.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AssignAshaRequest {

    @NotNull(message = "Village is required")
    private Long villageId;

    private Long phcId;
}
