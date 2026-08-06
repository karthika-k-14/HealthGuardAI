package com.healthguard.dto;

import com.healthguard.entity.PrescriptionStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * Returned response DTO for {@link com.healthguard.entity.Prescription}.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PrescriptionResponse {

    private Long id;
    private UUID uuid;
    private String patientName;
    private Integer patientAge;
    private String referredBy;
    private List<String> medicines;
    private List<PrescriptionItemResponse> items;
    private PrescriptionStatus status;
    private String notes;
    private Long citizenId;
    private String citizenName;
    private String handledByName;
    private LocalDateTime verifiedAt;
    private LocalDateTime dispensedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
