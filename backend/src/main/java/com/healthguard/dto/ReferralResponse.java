package com.healthguard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * A referral as returned by the Referral CRUD endpoints
 * ({@code /admin/referrals/**}).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReferralResponse {

    private Long id;
    private UUID uuid;
    private String citizenName;
    private String referredBy;
    private String fromFacility;
    private String toFacility;
    private String reason;
    private String notes;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
