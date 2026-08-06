package com.healthguard.mapper;

import com.healthguard.dto.CampaignResponse;
import com.healthguard.entity.Campaign;
import org.springframework.stereotype.Component;

/**
 * Converts between {@link Campaign} and its DTOs for the Campaign CRUD
 * module.
 */
@Component
public class CampaignMapper {

    public CampaignResponse toResponse(Campaign campaign) {
        return CampaignResponse.builder()
                .id(campaign.getId())
                .uuid(campaign.getUuid())
                .title(campaign.getTitle())
                .type(campaign.getType())
                .status(campaign.getStatus())
                .district(campaign.getDistrict())
                .startDate(campaign.getStartDate())
                .endDate(campaign.getEndDate())
                .reach(campaign.getReach())
                .progress(campaign.getProgress())
                .createdAt(campaign.getCreatedAt())
                .updatedAt(campaign.getUpdatedAt())
                .build();
    }
}
