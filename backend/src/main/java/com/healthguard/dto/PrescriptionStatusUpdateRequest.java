package com.healthguard.dto;

import com.healthguard.entity.PrescriptionStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Request body for updating prescription status or submitting verification/dispensing notes.
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PrescriptionStatusUpdateRequest {

    private PrescriptionStatus status;
    private String notes;
}
