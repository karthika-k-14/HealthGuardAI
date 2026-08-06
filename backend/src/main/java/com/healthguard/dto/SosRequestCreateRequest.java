package com.healthguard.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Request body for a citizen creating a new {@link com.healthguard.entity.SosRequest}.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SosRequestCreateRequest {

    @NotBlank(message = "Emergency type is required")
    private String emergencyType;

    private String description;

    private Double latitude;

    private Double longitude;
}
