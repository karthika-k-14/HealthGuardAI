package com.healthguard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * Line item response payload for prescription details.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PrescriptionItemResponse {

    private Long id;
    private UUID uuid;
    private Long medicineId;
    private String medicineName;
    private String dosage;
    private String frequency;
    private String duration;
    private Integer quantity;
    private String instructions;
}
