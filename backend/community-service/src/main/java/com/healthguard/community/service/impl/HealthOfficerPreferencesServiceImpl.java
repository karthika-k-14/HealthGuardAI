package com.healthguard.community.service.impl;

import com.healthguard.community.dto.HealthOfficerPreferencesDTO;
import com.healthguard.community.entity.HealthOfficerPreferences;
import com.healthguard.community.repository.HealthOfficerPreferencesRepository;
import com.healthguard.community.service.HealthOfficerPreferencesService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class HealthOfficerPreferencesServiceImpl implements HealthOfficerPreferencesService {

    private final HealthOfficerPreferencesRepository preferencesRepository;

    @Override
    @Transactional
    public HealthOfficerPreferences getPreferencesByUserId(Long userId) {
        if (userId == null) {
            userId = 27L; // Default fallback Health Officer ID
        }
        final Long resolvedUserId = userId;
        return preferencesRepository.findByUserId(resolvedUserId)
                .orElseGet(() -> {
                    log.info("No preferences found for officer ID {}. Initializing default preferences with all enabled.", resolvedUserId);
                    HealthOfficerPreferences defaultPrefs = HealthOfficerPreferences.builder()
                            .userId(resolvedUserId)
                            .diseaseSurveillanceAlerts(true)
                            .highRiskCaseNotifications(true)
                            .referralEscalationAlerts(true)
                            .outbreakDetectionAlerts(true)
                            .campaignUpdateNotifications(true)
                            .createdAt(LocalDateTime.now())
                            .updatedAt(LocalDateTime.now())
                            .build();
                    return preferencesRepository.save(defaultPrefs);
                });
    }

    @Override
    @Transactional
    public HealthOfficerPreferences updatePreferences(Long userId, HealthOfficerPreferencesDTO dto) {
        if (userId == null) {
            userId = 27L;
        }
        HealthOfficerPreferences prefs = getPreferencesByUserId(userId);

        if (dto.getDiseaseSurveillanceAlerts() != null) {
            prefs.setDiseaseSurveillanceAlerts(dto.getDiseaseSurveillanceAlerts());
        }
        if (dto.getHighRiskCaseNotifications() != null) {
            prefs.setHighRiskCaseNotifications(dto.getHighRiskCaseNotifications());
        }
        if (dto.getReferralEscalationAlerts() != null) {
            prefs.setReferralEscalationAlerts(dto.getReferralEscalationAlerts());
        }
        if (dto.getOutbreakDetectionAlerts() != null) {
            prefs.setOutbreakDetectionAlerts(dto.getOutbreakDetectionAlerts());
        }
        if (dto.getCampaignUpdateNotifications() != null) {
            prefs.setCampaignUpdateNotifications(dto.getCampaignUpdateNotifications());
        }

        prefs.setUpdatedAt(LocalDateTime.now());
        HealthOfficerPreferences saved = preferencesRepository.save(prefs);
        log.info("Successfully updated Health Officer preferences for user ID {}", userId);
        return saved;
    }

    @Override
    public HealthOfficerPreferencesDTO toDTO(HealthOfficerPreferences entity) {
        if (entity == null) return null;
        return HealthOfficerPreferencesDTO.builder()
                .id(entity.getId())
                .userId(entity.getUserId())
                .diseaseSurveillanceAlerts(entity.getDiseaseSurveillanceAlerts())
                .highRiskCaseNotifications(entity.getHighRiskCaseNotifications())
                .referralEscalationAlerts(entity.getReferralEscalationAlerts())
                .outbreakDetectionAlerts(entity.getOutbreakDetectionAlerts())
                .campaignUpdateNotifications(entity.getCampaignUpdateNotifications())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}
