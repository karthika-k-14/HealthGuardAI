package com.healthguard.admin.prescription.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PrescriptionRequest {

    @NotNull(message = "Citizen ID is required")
    private Long citizenId;

    @NotBlank(message = "Doctor Name is required")
    private String doctorName;

    @NotBlank(message = "Medicine Name is required")
    private String medicineName;

    @NotBlank(message = "Dosage is required")
    private String dosage;

    private String duration;

    private String status;
}
