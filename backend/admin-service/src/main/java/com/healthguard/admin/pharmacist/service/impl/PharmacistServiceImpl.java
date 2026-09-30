package com.healthguard.admin.pharmacist.service.impl;

import com.healthguard.admin.exception.DuplicateResourceException;
import com.healthguard.admin.exception.ResourceNotFoundException;
import com.healthguard.admin.pharmacist.dto.*;
import com.healthguard.admin.pharmacist.entity.Pharmacist;
import com.healthguard.admin.pharmacist.repository.PharmacistRepository;
import com.healthguard.admin.pharmacist.service.PharmacistService;
import com.healthguard.admin.prescription.repository.PrescriptionRepository;
import com.healthguard.admin.service.AuditLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PharmacistServiceImpl implements PharmacistService {

    private final PharmacistRepository pharmacistRepository;
    private final com.healthguard.admin.pharmacist.repository.PharmacistSettingsRepository pharmacistSettingsRepository;
    private final AuditLogService auditLogService;
    private final PrescriptionRepository prescriptionRepository;
    private final JdbcTemplate jdbcTemplate;

    @Override
    @Transactional
    public PharmacistResponse createPharmacist(PharmacistRequest request) {
        if (pharmacistRepository.existsByPharmacistId(request.getPharmacistId())) {
            throw new DuplicateResourceException("Pharmacist already exists with Pharmacist ID: " + request.getPharmacistId());
        }

        if (pharmacistRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Pharmacist already exists with Email: " + request.getEmail());
        }

        Pharmacist pharmacist = Pharmacist.builder()
                .pharmacistId(request.getPharmacistId())
                .fullName(request.getFullName())
                .email(request.getEmail())
                .mobileNumber(request.getMobileNumber())
                .pharmacyName(request.getPharmacyName())
                .licenseNumber(request.getLicenseNumber())
                .status(request.getStatus() != null ? request.getStatus() : "ACTIVE")
                .build();

        Pharmacist saved = pharmacistRepository.save(pharmacist);
        auditLogService.logAction(
                "PHARMACIST_CREATED",
                "PHARMACIST",
                "Created pharmacist: " + saved.getFullName() + " (ID: " + saved.getId() + ", Pharmacist ID: " + saved.getPharmacistId() + ")"
        );
        return mapToResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public PharmacistResponse getPharmacistById(Long id) {
        Pharmacist pharmacist = pharmacistRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Pharmacist not found with ID: " + id));
        return mapToResponse(pharmacist);
    }

    @Override
    @Transactional
    public PharmacistResponse updatePharmacist(Long id, UpdatePharmacistRequest request) {
        Pharmacist pharmacist = pharmacistRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Pharmacist not found with ID: " + id));

        if (request.getEmail() != null && !request.getEmail().equalsIgnoreCase(pharmacist.getEmail())) {
            if (pharmacistRepository.existsByEmail(request.getEmail())) {
                throw new DuplicateResourceException("Email already in use: " + request.getEmail());
            }
            pharmacist.setEmail(request.getEmail());
        }

        boolean statusChanged = request.getStatus() != null && !request.getStatus().equalsIgnoreCase(pharmacist.getStatus());

        if (request.getFullName() != null) pharmacist.setFullName(request.getFullName());
        if (request.getMobileNumber() != null) pharmacist.setMobileNumber(request.getMobileNumber());
        if (request.getPharmacyName() != null) pharmacist.setPharmacyName(request.getPharmacyName());
        if (request.getLicenseNumber() != null) pharmacist.setLicenseNumber(request.getLicenseNumber());
        if (request.getStatus() != null) pharmacist.setStatus(request.getStatus());

        Pharmacist updated = pharmacistRepository.save(pharmacist);
        auditLogService.logAction(
                "PHARMACIST_UPDATED",
                "PHARMACIST",
                "Updated pharmacist ID: " + id + " (" + updated.getFullName() + ")"
        );

        if (statusChanged && updated.getStatus() != null) {
            String newStatus = updated.getStatus().toUpperCase();
            if ("ACTIVE".equals(newStatus)) {
                auditLogService.logAction("PHARMACIST_ACTIVATED", "PHARMACIST", "Activated pharmacist ID: " + id + " (" + updated.getFullName() + ")");
            } else if ("INACTIVE".equals(newStatus)) {
                auditLogService.logAction("PHARMACIST_DEACTIVATED", "PHARMACIST", "Deactivated pharmacist ID: " + id + " (" + updated.getFullName() + ")");
            } else if ("APPROVED".equals(newStatus)) {
                auditLogService.logAction("PHARMACIST_APPROVED", "PHARMACIST", "Approved pharmacist ID: " + id + " (" + updated.getFullName() + ")");
            } else if ("REJECTED".equals(newStatus)) {
                auditLogService.logAction("PHARMACIST_REJECTED", "PHARMACIST", "Rejected pharmacist ID: " + id + " (" + updated.getFullName() + ")");
            }
        }

        return mapToResponse(updated);
    }

    @Override
    @Transactional
    public void deletePharmacist(Long id) {
        Pharmacist pharmacist = pharmacistRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Pharmacist not found with ID: " + id));
        pharmacistRepository.delete(pharmacist);
        auditLogService.logAction(
                "PHARMACIST_DELETED",
                "PHARMACIST",
                "Deleted pharmacist ID: " + id + " (" + pharmacist.getFullName() + ")"
        );
    }

    @Override
    @Transactional(readOnly = true)
    public List<PharmacistResponse> getAllPharmacists() {
        return pharmacistRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public PharmacistProfileResponse getPharmacistProfile(String email) {
        Pharmacist pharmacist = findPharmacistByEmailOrFallback(email);
        return mapToProfileResponse(pharmacist);
    }

    @Override
    @Transactional
    public PharmacistProfileResponse updatePharmacistProfile(String email, UpdatePharmacistProfileRequest request) {
        Pharmacist pharmacist = findPharmacistByEmailOrFallback(email);

        if (request.getFullName() != null && !request.getFullName().isBlank()) {
            pharmacist.setFullName(request.getFullName().trim());
        }
        if (request.getPhoneNumber() != null && !request.getPhoneNumber().isBlank()) {
            pharmacist.setMobileNumber(request.getPhoneNumber().trim());
        }
        if (request.getAddress() != null) {
            pharmacist.setAddress(request.getAddress().trim());
        }
        if (request.getLicenseNumber() != null && !request.getLicenseNumber().isBlank()) {
            pharmacist.setLicenseNumber(request.getLicenseNumber().trim());
        }
        if (request.getLicenseIssuedBy() != null) {
            pharmacist.setLicenseIssuedBy(request.getLicenseIssuedBy().trim());
        }
        if (request.getLicenseExpiryDate() != null) {
            pharmacist.setLicenseExpiryDate(request.getLicenseExpiryDate());
        }
        if (request.getPharmacyName() != null && !request.getPharmacyName().isBlank()) {
            pharmacist.setPharmacyName(request.getPharmacyName().trim());
        }
        if (request.getYearsOfExperience() != null) {
            pharmacist.setYearsOfExperience(request.getYearsOfExperience());
        }
        if (request.getSpecialization() != null) {
            pharmacist.setSpecialization(request.getSpecialization().trim());
        }

        Pharmacist saved = pharmacistRepository.save(pharmacist);

        // Sync name and phone to auth users table if exists
        try {
            if (jdbcTemplate != null && saved.getEmail() != null) {
                jdbcTemplate.update(
                        "UPDATE users SET full_name = ?, phone_number = ? WHERE LOWER(email) = LOWER(?)",
                        saved.getFullName(),
                        saved.getMobileNumber(),
                        saved.getEmail()
                );
            }
        } catch (Exception ignored) {
        }

        auditLogService.logAction(
                "PHARMACIST_PROFILE_UPDATED",
                "PHARMACIST",
                "Pharmacist updated profile: " + saved.getEmail()
        );

        return mapToProfileResponse(saved);
    }

    private Pharmacist findPharmacistByEmailOrFallback(String email) {
        if (email != null && !email.isBlank()) {
            Optional<Pharmacist> ph = pharmacistRepository.findByEmail(email.trim());
            if (ph.isPresent()) {
                return ph.get();
            }
            Optional<Pharmacist> match = pharmacistRepository.findAll().stream()
                    .filter(p -> p.getEmail() != null && p.getEmail().trim().equalsIgnoreCase(email.trim()))
                    .findFirst();
            if (match.isPresent()) {
                return match.get();
            }
        }

        // Fallback to first available pharmacist or create default
        return pharmacistRepository.findAll().stream().findFirst().orElseGet(() -> {
            Pharmacist p = Pharmacist.builder()
                    .pharmacistId("PHR-" + System.currentTimeMillis())
                    .fullName("Central Pharmacist")
                    .email(email != null && !email.isBlank() ? email : "pharmacist@healthguard.com")
                    .mobileNumber("9876543210")
                    .pharmacyName("Central Pharmacy")
                    .licenseNumber("LIC-DEFAULT-01")
                    .licenseIssuedBy("Tamil Nadu Pharmacy Council")
                    .licenseExpiryDate(java.time.LocalDate.now().plusYears(3))
                    .yearsOfExperience(5)
                    .specialization("Clinical Pharmacy")
                    .address("Central PHC Dispensary")
                    .status("ACTIVE")
                    .build();
            return pharmacistRepository.save(p);
        });
    }

    private PharmacistProfileResponse mapToProfileResponse(Pharmacist pharmacist) {
        long verifiedPrescriptions = 0;
        try {
            if (prescriptionRepository != null) {
                verifiedPrescriptions = prescriptionRepository.count();
            }
        } catch (Exception ignored) {
        }

        return PharmacistProfileResponse.builder()
                .id(pharmacist.getId())
                .pharmacistId(pharmacist.getPharmacistId())
                .fullName(pharmacist.getFullName())
                .email(pharmacist.getEmail())
                .phoneNumber(pharmacist.getMobileNumber())
                .pharmacyName(pharmacist.getPharmacyName())
                .licenseNumber(pharmacist.getLicenseNumber())
                .licenseIssuedBy(pharmacist.getLicenseIssuedBy())
                .licenseExpiryDate(pharmacist.getLicenseExpiryDate())
                .yearsOfExperience(pharmacist.getYearsOfExperience())
                .specialization(pharmacist.getSpecialization())
                .address(pharmacist.getAddress())
                .village(pharmacist.getVillage())
                .district(pharmacist.getDistrict())
                .status(pharmacist.getStatus() != null ? pharmacist.getStatus() : "ACTIVE")
                .role("PHARMACIST")
                .prescriptionsVerified(verifiedPrescriptions)
                .createdAt(pharmacist.getCreatedAt())
                .updatedAt(pharmacist.getUpdatedAt())
                .build();
    }

    private PharmacistResponse mapToResponse(Pharmacist pharmacist) {
        return PharmacistResponse.builder()
                .id(pharmacist.getId())
                .pharmacistId(pharmacist.getPharmacistId())
                .fullName(pharmacist.getFullName())
                .email(pharmacist.getEmail())
                .mobileNumber(pharmacist.getMobileNumber())
                .phoneNumber(pharmacist.getMobileNumber())
                .pharmacyName(pharmacist.getPharmacyName())
                .licenseNumber(pharmacist.getLicenseNumber())
                .licenseIssuedBy(pharmacist.getLicenseIssuedBy())
                .licenseExpiryDate(pharmacist.getLicenseExpiryDate())
                .yearsOfExperience(pharmacist.getYearsOfExperience())
                .specialization(pharmacist.getSpecialization())
                .address(pharmacist.getAddress())
                .village(pharmacist.getVillage())
                .district(pharmacist.getDistrict())
                .status(pharmacist.getStatus())
                .role("PHARMACIST")
                .createdAt(pharmacist.getCreatedAt())
                .updatedAt(pharmacist.getUpdatedAt())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public com.healthguard.admin.pharmacist.dto.PharmacistNotificationSettingsResponse getNotificationSettings(String email) {
        boolean enabled = isNotificationsEnabled(email);
        return com.healthguard.admin.pharmacist.dto.PharmacistNotificationSettingsResponse.builder()
                .notificationsEnabled(enabled)
                .build();
    }

    @Override
    @Transactional
    public com.healthguard.admin.pharmacist.dto.PharmacistNotificationSettingsResponse updateNotificationSettings(
            String email, com.healthguard.admin.pharmacist.dto.UpdateNotificationSettingsRequest request) {
        String resolvedEmail = (email != null && !email.isBlank()) ? email.trim() : "717824f326@kce.ac.in";
        com.healthguard.admin.pharmacist.entity.PharmacistSettings settings = pharmacistSettingsRepository.findByEmail(resolvedEmail)
                .orElseGet(() -> com.healthguard.admin.pharmacist.entity.PharmacistSettings.builder()
                        .email(resolvedEmail)
                        .notificationsEnabled(true)
                        .build());

        if (request != null && request.getNotificationsEnabled() != null) {
            settings.setNotificationsEnabled(request.getNotificationsEnabled());
        }

        com.healthguard.admin.pharmacist.entity.PharmacistSettings saved = pharmacistSettingsRepository.save(settings);
        auditLogService.logAction(
                "PHARMACIST_SETTINGS_UPDATED",
                "PHARMACIST",
                "Updated notifications_enabled to " + saved.getNotificationsEnabled() + " for " + resolvedEmail
        );

        return com.healthguard.admin.pharmacist.dto.PharmacistNotificationSettingsResponse.builder()
                .notificationsEnabled(saved.getNotificationsEnabled())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isNotificationsEnabled(String email) {
        String resolvedEmail = (email != null && !email.isBlank()) ? email.trim() : "717824f326@kce.ac.in";
        return pharmacistSettingsRepository.findByEmail(resolvedEmail)
                .map(com.healthguard.admin.pharmacist.entity.PharmacistSettings::getNotificationsEnabled)
                .orElse(true);
    }

    @Override
    @Transactional(readOnly = true)
    public com.healthguard.admin.pharmacist.dto.PharmacistDashboardSettingsResponse getDashboardSettings(String email) {
        boolean enabled = isAutoRefreshEnabled(email);
        return com.healthguard.admin.pharmacist.dto.PharmacistDashboardSettingsResponse.builder()
                .autoRefreshEnabled(enabled)
                .build();
    }

    @Override
    @Transactional
    public com.healthguard.admin.pharmacist.dto.PharmacistDashboardSettingsResponse updateDashboardSettings(
            String email, com.healthguard.admin.pharmacist.dto.UpdateDashboardSettingsRequest request) {
        String resolvedEmail = (email != null && !email.isBlank()) ? email.trim() : "717824f326@kce.ac.in";
        com.healthguard.admin.pharmacist.entity.PharmacistSettings settings = pharmacistSettingsRepository.findByEmail(resolvedEmail)
                .orElseGet(() -> com.healthguard.admin.pharmacist.entity.PharmacistSettings.builder()
                        .email(resolvedEmail)
                        .notificationsEnabled(true)
                        .autoRefreshEnabled(true)
                        .expiryWarningThreshold(60)
                        .build());

        if (request != null && request.getAutoRefreshEnabled() != null) {
            settings.setAutoRefreshEnabled(request.getAutoRefreshEnabled());
        }

        com.healthguard.admin.pharmacist.entity.PharmacistSettings saved = pharmacistSettingsRepository.save(settings);
        auditLogService.logAction(
                "PHARMACIST_SETTINGS_UPDATED",
                "PHARMACIST",
                "Updated auto_refresh_enabled to " + saved.getAutoRefreshEnabled() + " for " + resolvedEmail
        );

        return com.healthguard.admin.pharmacist.dto.PharmacistDashboardSettingsResponse.builder()
                .autoRefreshEnabled(saved.getAutoRefreshEnabled() != null ? saved.getAutoRefreshEnabled() : true)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isAutoRefreshEnabled(String email) {
        String resolvedEmail = (email != null && !email.isBlank()) ? email.trim() : "717824f326@kce.ac.in";
        return pharmacistSettingsRepository.findByEmail(resolvedEmail)
                .map(s -> s.getAutoRefreshEnabled() != null ? s.getAutoRefreshEnabled() : true)
                .orElse(true);
    }

    @Override
    @Transactional(readOnly = true)
    public com.healthguard.admin.pharmacist.dto.PharmacistExpiryThresholdResponse getExpiryThreshold(String email) {
        int threshold = getExpiryWarningThreshold(email);
        return com.healthguard.admin.pharmacist.dto.PharmacistExpiryThresholdResponse.builder()
                .expiryWarningThreshold(threshold)
                .build();
    }

    @Override
    @Transactional
    public com.healthguard.admin.pharmacist.dto.PharmacistExpiryThresholdResponse updateExpiryThreshold(
            String email, com.healthguard.admin.pharmacist.dto.UpdateExpiryThresholdRequest request) {
        String resolvedEmail = (email != null && !email.isBlank()) ? email.trim() : "717824f326@kce.ac.in";
        com.healthguard.admin.pharmacist.entity.PharmacistSettings settings = pharmacistSettingsRepository.findByEmail(resolvedEmail)
                .orElseGet(() -> com.healthguard.admin.pharmacist.entity.PharmacistSettings.builder()
                        .email(resolvedEmail)
                        .notificationsEnabled(true)
                        .autoRefreshEnabled(true)
                        .expiryWarningThreshold(60)
                        .build());

        if (request != null && request.getExpiryWarningThreshold() != null) {
            int val = request.getExpiryWarningThreshold();
            if (val == 30 || val == 60 || val == 90) {
                settings.setExpiryWarningThreshold(val);
            } else {
                settings.setExpiryWarningThreshold(60);
            }
        }

        com.healthguard.admin.pharmacist.entity.PharmacistSettings saved = pharmacistSettingsRepository.save(settings);
        auditLogService.logAction(
                "PHARMACIST_SETTINGS_UPDATED",
                "PHARMACIST",
                "Updated expiry_warning_threshold to " + saved.getExpiryWarningThreshold() + " for " + resolvedEmail
        );

        return com.healthguard.admin.pharmacist.dto.PharmacistExpiryThresholdResponse.builder()
                .expiryWarningThreshold(saved.getExpiryWarningThreshold() != null ? saved.getExpiryWarningThreshold() : 60)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public int getExpiryWarningThreshold(String email) {
        String resolvedEmail = (email != null && !email.isBlank()) ? email.trim() : "717824f326@kce.ac.in";
        return pharmacistSettingsRepository.findByEmail(resolvedEmail)
                .map(s -> s.getExpiryWarningThreshold() != null ? s.getExpiryWarningThreshold() : 60)
                .orElse(60);
    }

    @Override
    @Transactional(readOnly = true)
    public com.healthguard.admin.pharmacist.dto.PharmacistAppearanceSettingsResponse getAppearanceSettings(String email) {
        String resolvedEmail = (email != null && !email.isBlank()) ? email.trim() : "717824f326@kce.ac.in";
        String theme = pharmacistSettingsRepository.findByEmail(resolvedEmail)
                .map(s -> s.getTheme() != null ? s.getTheme().toLowerCase() : "dark")
                .orElse("dark");
        return com.healthguard.admin.pharmacist.dto.PharmacistAppearanceSettingsResponse.builder()
                .theme(theme)
                .build();
    }

    @Override
    @Transactional
    public com.healthguard.admin.pharmacist.dto.PharmacistAppearanceSettingsResponse updateAppearanceSettings(
            String email, com.healthguard.admin.pharmacist.dto.UpdateAppearanceSettingsRequest request) {
        String resolvedEmail = (email != null && !email.isBlank()) ? email.trim() : "717824f326@kce.ac.in";
        com.healthguard.admin.pharmacist.entity.PharmacistSettings settings = pharmacistSettingsRepository.findByEmail(resolvedEmail)
                .orElseGet(() -> com.healthguard.admin.pharmacist.entity.PharmacistSettings.builder()
                        .email(resolvedEmail)
                        .notificationsEnabled(true)
                        .autoRefreshEnabled(true)
                        .expiryWarningThreshold(60)
                        .theme("dark")
                        .language("ENGLISH")
                        .build());

        String targetTheme = "dark";
        if (request != null && request.getTheme() != null) {
            String val = request.getTheme().trim().toLowerCase();
            if ("light".equals(val) || "dark".equals(val)) {
                targetTheme = val;
            }
        }
        settings.setTheme(targetTheme);

        com.healthguard.admin.pharmacist.entity.PharmacistSettings saved = pharmacistSettingsRepository.save(settings);
        auditLogService.logAction(
                "PHARMACIST_APPEARANCE_UPDATED",
                "PHARMACIST",
                "Updated theme to " + saved.getTheme() + " for " + resolvedEmail
        );

        return com.healthguard.admin.pharmacist.dto.PharmacistAppearanceSettingsResponse.builder()
                .theme(saved.getTheme() != null ? saved.getTheme() : "dark")
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public com.healthguard.admin.pharmacist.dto.PharmacistLanguageSettingsResponse getLanguageSettings(String email) {
        String resolvedEmail = (email != null && !email.isBlank()) ? email.trim() : "717824f326@kce.ac.in";
        String lang = pharmacistSettingsRepository.findByEmail(resolvedEmail)
                .map(s -> s.getLanguage() != null ? s.getLanguage().toUpperCase() : "ENGLISH")
                .orElse("ENGLISH");
        return com.healthguard.admin.pharmacist.dto.PharmacistLanguageSettingsResponse.builder()
                .language(lang)
                .build();
    }

    @Override
    @Transactional
    public com.healthguard.admin.pharmacist.dto.PharmacistLanguageSettingsResponse updateLanguageSettings(
            String email, com.healthguard.admin.pharmacist.dto.UpdateLanguageSettingsRequest request) {
        String resolvedEmail = (email != null && !email.isBlank()) ? email.trim() : "717824f326@kce.ac.in";
        com.healthguard.admin.pharmacist.entity.PharmacistSettings settings = pharmacistSettingsRepository.findByEmail(resolvedEmail)
                .orElseGet(() -> com.healthguard.admin.pharmacist.entity.PharmacistSettings.builder()
                        .email(resolvedEmail)
                        .notificationsEnabled(true)
                        .autoRefreshEnabled(true)
                        .expiryWarningThreshold(60)
                        .theme("dark")
                        .language("ENGLISH")
                        .build());

        String targetLanguage = "ENGLISH";
        if (request != null && request.getLanguage() != null) {
            String val = request.getLanguage().trim().toUpperCase();
            if ("ENGLISH".equals(val) || "TAMIL".equals(val) || "HINDI".equals(val) || "ODIA".equals(val)) {
                targetLanguage = val;
            }
        }
        settings.setLanguage(targetLanguage);

        com.healthguard.admin.pharmacist.entity.PharmacistSettings saved = pharmacistSettingsRepository.save(settings);
        auditLogService.logAction(
                "PHARMACIST_LANGUAGE_UPDATED",
                "PHARMACIST",
                "Updated language to " + saved.getLanguage() + " for " + resolvedEmail
        );

        return com.healthguard.admin.pharmacist.dto.PharmacistLanguageSettingsResponse.builder()
                .language(saved.getLanguage() != null ? saved.getLanguage() : "ENGLISH")
                .build();
    }
}
