package com.healthguard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * Response DTO for Campaign Report.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CampaignReportResponse {

    private String reportTitle;
    private LocalDateTime generatedAt;
    private Map<String, Object> appliedFilters;

    private long totalCampaigns;
    private long activeCampaigns;
    private long totalReach;
    private double averageProgress;
    private Map<String, Long> campaignStatusBreakdown;
    private Map<String, Long> campaignTypeBreakdown;
    private Map<String, Long> districtBreakdown;
}
