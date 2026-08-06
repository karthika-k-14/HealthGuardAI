package com.healthguard.dto;

import com.healthguard.entity.CampaignStatus;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * Request body for {@code POST /admin/campaigns} and
 * {@code PUT /admin/campaigns/{campaignId}}.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CampaignRequest {

    @NotBlank(message = "Campaign title is required")
    private String title;

    private String type;

    private CampaignStatus status;

    private String district;

    private LocalDate startDate;

    private LocalDate endDate;

    private Integer reach;

    private Integer progress;
}
