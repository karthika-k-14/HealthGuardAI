package com.healthguard.service;

import com.healthguard.dto.CampaignRequest;
import com.healthguard.dto.CampaignResponse;
import com.healthguard.entity.Campaign;
import com.healthguard.entity.CampaignStatus;
import com.healthguard.exception.ResourceNotFoundException;
import com.healthguard.mapper.CampaignMapper;
import com.healthguard.repository.CampaignRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Business logic for the Campaign CRUD module ({@code /campaigns/**} for
 * reads, {@code /admin/campaigns/**} for writes).
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CampaignService {

    private final CampaignRepository campaignRepository;
    private final CampaignMapper campaignMapper;

    public List<CampaignResponse> getAllCampaigns() {
        return campaignRepository.findAllByOrderByStartDateDesc().stream()
                .map(campaignMapper::toResponse)
                .toList();
    }

    public CampaignResponse getCampaignById(Long campaignId) {
        return campaignMapper.toResponse(findCampaignOrThrow(campaignId));
    }

    @Transactional
    public CampaignResponse createCampaign(CampaignRequest request) {
        Campaign campaign = Campaign.builder()
                .title(request.getTitle())
                .type(request.getType())
                .status(request.getStatus() != null ? request.getStatus() : CampaignStatus.DRAFT)
                .district(request.getDistrict())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .reach(request.getReach() != null ? request.getReach() : 0)
                .progress(request.getProgress() != null ? request.getProgress() : 0)
                .build();

        return campaignMapper.toResponse(campaignRepository.save(campaign));
    }

    @Transactional
    public CampaignResponse updateCampaign(Long campaignId, CampaignRequest request) {
        Campaign campaign = findCampaignOrThrow(campaignId);

        campaign.setTitle(request.getTitle());
        campaign.setType(request.getType());
        if (request.getStatus() != null) {
            campaign.setStatus(request.getStatus());
        }
        campaign.setDistrict(request.getDistrict());
        campaign.setStartDate(request.getStartDate());
        campaign.setEndDate(request.getEndDate());
        if (request.getReach() != null) {
            campaign.setReach(request.getReach());
        }
        if (request.getProgress() != null) {
            campaign.setProgress(request.getProgress());
        }

        return campaignMapper.toResponse(campaignRepository.save(campaign));
    }

    @Transactional
    public void deleteCampaign(Long campaignId) {
        Campaign campaign = findCampaignOrThrow(campaignId);
        campaignRepository.delete(campaign);
    }

    private Campaign findCampaignOrThrow(Long campaignId) {
        return campaignRepository.findById(campaignId)
                .orElseThrow(() -> new ResourceNotFoundException("Campaign not found with id: " + campaignId));
    }
}
