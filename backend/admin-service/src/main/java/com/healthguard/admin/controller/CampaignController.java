package com.healthguard.admin.controller;

import com.healthguard.admin.entity.Campaign;
import com.healthguard.admin.enums.NotificationType;
import com.healthguard.admin.repository.CampaignRepository;
import com.healthguard.admin.service.AuditLogService;
import com.healthguard.admin.util.ApiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@Slf4j
@RestController
@RequestMapping({"/api/campaigns", "/campaigns"})
@RequiredArgsConstructor
public class CampaignController {

    private final CampaignRepository campaignRepository;
    private final AuditLogService auditLogService;
    private final com.healthguard.admin.service.NotificationService notificationService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Campaign>>> getAllCampaigns() {
        List<Campaign> list = campaignRepository.findAll();
        return ResponseEntity.ok(ApiResponse.success("Campaigns retrieved successfully", list));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Campaign>> getCampaignById(@PathVariable("id") Long id) {
        Optional<Campaign> opt = campaignRepository.findById(id);
        if (opt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Campaign not found"));
        }
        return ResponseEntity.ok(ApiResponse.success("Campaign details retrieved", opt.get()));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Campaign>> createCampaign(@RequestBody Campaign campaign) {
        log.info("=== CREATE CAMPAIGN REQUEST ===");
        log.info("Title: {}", campaign.getTitle());
        log.info("Type: {}", campaign.getType());
        log.info("VillageName received: '{}'", campaign.getVillageName());
        log.info("District: {}", campaign.getDistrict());
        log.info("StartDate: {}", campaign.getStartDate());
        log.info("EndDate: {}", campaign.getEndDate());
        log.info("Description: {}", campaign.getDescription());

        Campaign saved = campaignRepository.save(campaign);
        log.info("=== CAMPAIGN SAVED ===");
        log.info("Saved ID: {}", saved.getId());
        log.info("Saved VillageName: '{}'", saved.getVillageName());

        auditLogService.logAction("CAMPAIGN_CREATED", "ADMIN", "Created awareness campaign: " + saved.getTitle());
        notificationService.createNotification(
                "Campaign Published",
                "New awareness campaign \"" + saved.getTitle() + "\" has been published.",
                NotificationType.CAMPAIGN.name()
        );
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Campaign created successfully", saved));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Campaign>> updateCampaign(@PathVariable("id") Long id, @RequestBody Campaign changes) {
        Optional<Campaign> opt = campaignRepository.findById(id);
        if (opt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Campaign not found"));
        }
        Campaign c = opt.get();
        if (changes.getTitle() != null) c.setTitle(changes.getTitle());
        if (changes.getType() != null) c.setType(changes.getType());
        if (changes.getDescription() != null) c.setDescription(changes.getDescription());
        if (changes.getStatus() != null) c.setStatus(changes.getStatus());
        if (changes.getProgress() != null) c.setProgress(changes.getProgress());
        if (changes.getVillageName() != null) c.setVillageName(changes.getVillageName());
        if (changes.getDistrict() != null) c.setDistrict(changes.getDistrict());
        if (changes.getStartDate() != null) c.setStartDate(changes.getStartDate());
        if (changes.getEndDate() != null) c.setEndDate(changes.getEndDate());

        Campaign updated = campaignRepository.save(c);
        auditLogService.logAction("CAMPAIGN_UPDATED", "ADMIN", "Updated awareness campaign ID: " + id);
        return ResponseEntity.ok(ApiResponse.success("Campaign updated successfully", updated));
    }

    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<ApiResponse<Void>> deleteCampaign(@PathVariable("id") Long id) {
        log.info("Deleting campaign {}", id);

        boolean existsBefore = campaignRepository.existsById(id);
        log.info("Exists before delete: {}", existsBefore);

        if (existsBefore) {
            campaignRepository.deleteById(id);
            campaignRepository.flush();
            auditLogService.logAction("CAMPAIGN_DELETED", "ADMIN", "Deleted awareness campaign ID: " + id);
        }

        boolean existsAfter = campaignRepository.existsById(id);
        log.info("Exists after delete: {}", existsAfter);

        return ResponseEntity.ok(ApiResponse.success("Campaign deleted successfully"));
    }
}
