package com.healthguard.dto;

import com.healthguard.entity.CampaignStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * A campaign as returned by the Campaign CRUD endpoints
 * ({@code /campaigns/**}, {@code /admin/campaigns/**}).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CampaignResponse {

    private Long id;
    private UUID uuid;
    private String title;
    private String type;
    private CampaignStatus status;
    private String district;
    private LocalDate startDate;
    private LocalDate endDate;
    private Integer reach;
    private Integer progress;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
