package com.healthguard.dto;

import com.healthguard.entity.PrescriptionStatus;
import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Request body for updating an existing prescription.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PrescriptionUpdateRequest {

    private String patientName;

    @Min(value = 0, message = "Patient age cannot be negative")
    private Integer patientAge;

    private String referredBy;

    private List<String> medicines;

    private List<PrescriptionItemRequest> items;

    private PrescriptionStatus status;

    private String notes;

    private Long citizenId;
}
