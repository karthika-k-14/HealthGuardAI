package com.healthguard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

/**
 * Statistics breakdown for health campaigns and outreach drives.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CampaignStatisticsResponse {

    private long totalCampaigns;
    private Map<String, Long> campaignStatusBreakdown;
    private long totalReach;
    private double averageProgress;
    private Map<String, Long> campaignTypeBreakdown;
}
