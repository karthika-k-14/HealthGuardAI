package com.healthguard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Response DTO for referral workflow tracking.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReferralTrackingResponse {

    private Long referralId;
    private String citizenName;
    private String referredBy;
    private String fromFacility;
    private String toFacility;
    private String referralReason;
    private String referralStatus;
    private List<WorkflowResponse> associatedWorkflows;
}
