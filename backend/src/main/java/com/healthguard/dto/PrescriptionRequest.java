package com.healthguard.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

/**
 * Request body for submitting/creating a new prescription.
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PrescriptionRequest {

    @NotBlank(message = "Patient name is required")
    private String patientName;

    @Min(value = 0, message = "Patient age cannot be negative")
    private Integer patientAge;

    private String referredBy;

    private List<String> medicines;

    private List<PrescriptionItemRequest> items;

    private String notes;

    private Long citizenId;
}
