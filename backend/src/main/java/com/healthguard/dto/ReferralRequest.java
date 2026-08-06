package com.healthguard.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request body for {@code POST /admin/referrals} and
 * {@code PUT /admin/referrals/{referralId}}.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReferralRequest {

    @NotBlank(message = "Citizen name is required")
    private String citizenName;

    private String referredBy;

    private String fromFacility;

    private String toFacility;

    private String reason;

    private String notes;

    /** Pending / Completed / Cancelled. Defaults to Pending when omitted. */
    private String status;
}
