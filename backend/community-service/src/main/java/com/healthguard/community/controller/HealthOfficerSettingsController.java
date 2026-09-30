package com.healthguard.community.controller;

import com.healthguard.community.dto.ApiResponse;
import com.healthguard.community.dto.HealthOfficerSettingsDTO;
import com.healthguard.community.entity.HealthOfficerSettings;
import com.healthguard.community.repository.HealthOfficerSettingsRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
@Slf4j
public class HealthOfficerSettingsController {

    private final HealthOfficerSettingsRepository settingsRepository;

    @GetMapping({"/api/health-officer/settings", "/api/officer/settings"})
    public ResponseEntity<?> getSettings(
            @RequestHeader(value = "X-User-Id", required = false) String userId,
            @RequestHeader(value = "X-User-Email", required = false) String userEmail
    ) {
        HealthOfficerSettings settings = findOrCreateSettings(userId, userEmail);
        return ResponseEntity.ok(ApiResponse.success("Health Officer settings retrieved", mapToDTO(settings)));
    }

    @PutMapping({"/api/health-officer/settings", "/api/officer/settings"})
    public ResponseEntity<?> updateSettings(
            @RequestBody HealthOfficerSettingsDTO dto,
            @RequestHeader(value = "X-User-Id", required = false) String userId,
            @RequestHeader(value = "X-User-Email", required = false) String userEmail
    ) {
        HealthOfficerSettings settings = findOrCreateSettings(userId, userEmail);

        // Update Campaign Management Settings
        if (dto.getDefaultCampaignDuration() != null) {
            settings.setDefaultCampaignDuration(dto.getDefaultCampaignDuration());
        }
        if (dto.getAutoArchiveCompletedCampaigns() != null) {
            settings.setAutoArchiveCompletedCampaigns(dto.getAutoArchiveCompletedCampaigns());
        }
        if (dto.getCampaignProgressAlerts() != null) {
            settings.setCampaignProgressAlerts(dto.getCampaignProgressAlerts());
        }
        if (dto.getCampaignProgressMilestones() != null) {
            settings.setCampaignProgressMilestones(dto.getCampaignProgressMilestones());
        }
        if (dto.getCampaignPerformanceSummary() != null) {
            settings.setCampaignPerformanceSummary(dto.getCampaignPerformanceSummary());
        }

        // Update Broadcast Notification Settings
        if (dto.getEnableBroadcastNotifications() != null) {
            settings.setEnableBroadcastNotifications(dto.getEnableBroadcastNotifications());
        }
        if (dto.getEmergencyAlerts() != null) {
            settings.setEmergencyAlerts(dto.getEmergencyAlerts());
        }
        if (dto.getDiseaseOutbreakAlerts() != null) {
            settings.setDiseaseOutbreakAlerts(dto.getDiseaseOutbreakAlerts());
        }
        if (dto.getVaccinationDriveAlerts() != null) {
            settings.setVaccinationDriveAlerts(dto.getVaccinationDriveAlerts());
        }
        if (dto.getCampaignAwarenessAlerts() != null) {
            settings.setCampaignAwarenessAlerts(dto.getCampaignAwarenessAlerts());
        }
        if (dto.getReferralEscalationAlerts() != null) {
            settings.setReferralEscalationAlerts(dto.getReferralEscalationAlerts());
        }

        settings.setUpdatedAt(LocalDateTime.now());
        HealthOfficerSettings saved = settingsRepository.save(settings);
        log.info("Updated Health Officer settings for user {} / {}", userId, userEmail);

        return ResponseEntity.ok(ApiResponse.success("Health Officer settings updated", mapToDTO(saved)));
    }

    private HealthOfficerSettings findOrCreateSettings(String userId, String userEmail) {
        if (userId != null && !userId.isBlank()) {
            var opt = settingsRepository.findFirstByUserId(userId);
            if (opt.isPresent()) return opt.get();
        }
        if (userEmail != null && !userEmail.isBlank()) {
            var opt = settingsRepository.findFirstByUserEmail(userEmail);
            if (opt.isPresent()) return opt.get();
        }

        // Check if there's already an existing default record
        var existing = settingsRepository.findFirstByOrderByIdAsc();
        if (existing.isPresent()) {
            HealthOfficerSettings s = existing.get();
            if ((s.getUserId() == null || s.getUserId().isBlank()) && userId != null) {
                s.setUserId(userId);
                s.setUserEmail(userEmail);
                return settingsRepository.save(s);
            }
            return s;
        }

        // Create new default record
        HealthOfficerSettings newSettings = HealthOfficerSettings.builder()
                .userId(userId)
                .userEmail(userEmail)
                .defaultCampaignDuration("14 Days")
                .autoArchiveCompletedCampaigns(true)
                .campaignProgressAlerts(true)
                .campaignProgressMilestones("25,50,75,100")
                .campaignPerformanceSummary(true)
                .enableBroadcastNotifications(true)
                .emergencyAlerts(true)
                .diseaseOutbreakAlerts(true)
                .vaccinationDriveAlerts(true)
                .campaignAwarenessAlerts(true)
                .referralEscalationAlerts(true)
                .build();

        return settingsRepository.save(newSettings);
    }

    private HealthOfficerSettingsDTO mapToDTO(HealthOfficerSettings s) {
        return HealthOfficerSettingsDTO.builder()
                .id(s.getId())
                .userId(s.getUserId())
                .userEmail(s.getUserEmail())
                .defaultCampaignDuration(s.getDefaultCampaignDuration())
                .autoArchiveCompletedCampaigns(s.getAutoArchiveCompletedCampaigns())
                .campaignProgressAlerts(s.getCampaignProgressAlerts())
                .campaignProgressMilestones(s.getCampaignProgressMilestones())
                .campaignPerformanceSummary(s.getCampaignPerformanceSummary())
                .enableBroadcastNotifications(s.getEnableBroadcastNotifications())
                .emergencyAlerts(s.getEmergencyAlerts())
                .diseaseOutbreakAlerts(s.getDiseaseOutbreakAlerts())
                .vaccinationDriveAlerts(s.getVaccinationDriveAlerts())
                .campaignAwarenessAlerts(s.getCampaignAwarenessAlerts())
                .referralEscalationAlerts(s.getReferralEscalationAlerts())
                .updatedAt(s.getUpdatedAt())
                .build();
    }
}
