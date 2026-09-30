package com.healthguard.admin.prescription.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdatePrescriptionRequest {

    private String doctorName;

    private String medicineName;

    private String dosage;

    private String duration;

    private String status;
}
