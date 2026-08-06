package com.healthguard.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Line item request payload for creating/updating prescription items.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PrescriptionItemRequest {

    private Long medicineId;

    @NotBlank(message = "Medicine name is required")
    private String medicineName;

    private String dosage;

    private String frequency;

    private String duration;

    private Integer quantity;

    private String instructions;
}
