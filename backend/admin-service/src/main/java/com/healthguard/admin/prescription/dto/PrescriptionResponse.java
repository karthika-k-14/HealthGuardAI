package com.healthguard.admin.prescription.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PrescriptionResponse {

    private Long id;
    private Long citizenId;
    private String doctorName;
    private String medicineName;
    private String dosage;
    private String duration;
    private String status;
    private LocalDateTime createdAt;
}
