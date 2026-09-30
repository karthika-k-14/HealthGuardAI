package com.healthguard.community.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReferralStatisticsDTO {

    private long totalReferrals;
    private long pendingReferrals;
    private long underReviewReferrals;
    private long approvedReferrals;
    private long rejectedReferrals;
    private double averageVerificationTimeHours;
    private String formattedAverageVerificationTime;

    private List<Map<String, Object>> referralsByVillage;
    private List<Map<String, Object>> referralsByDisease;
    private List<Map<String, Object>> monthlyTrends;

    private List<String> availableVillages;
    private List<String> availableDiseases;
}
