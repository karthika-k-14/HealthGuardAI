package com.healthguard.admin.pharmacist.service;

import com.healthguard.admin.pharmacist.dto.PharmacistProfileResponse;
import com.healthguard.admin.pharmacist.dto.PharmacistRequest;
import com.healthguard.admin.pharmacist.dto.PharmacistResponse;
import com.healthguard.admin.pharmacist.dto.UpdatePharmacistProfileRequest;
import com.healthguard.admin.pharmacist.dto.UpdatePharmacistRequest;

import java.util.List;

public interface PharmacistService {

    PharmacistResponse createPharmacist(PharmacistRequest request);

    PharmacistResponse getPharmacistById(Long id);

    PharmacistResponse updatePharmacist(Long id, UpdatePharmacistRequest request);

    void deletePharmacist(Long id);

    List<PharmacistResponse> getAllPharmacists();

    PharmacistProfileResponse getPharmacistProfile(String email);

    PharmacistProfileResponse updatePharmacistProfile(String email, UpdatePharmacistProfileRequest request);

    com.healthguard.admin.pharmacist.dto.PharmacistNotificationSettingsResponse getNotificationSettings(String email);

    com.healthguard.admin.pharmacist.dto.PharmacistNotificationSettingsResponse updateNotificationSettings(String email, com.healthguard.admin.pharmacist.dto.UpdateNotificationSettingsRequest request);

    boolean isNotificationsEnabled(String email);

    com.healthguard.admin.pharmacist.dto.PharmacistDashboardSettingsResponse getDashboardSettings(String email);

    com.healthguard.admin.pharmacist.dto.PharmacistDashboardSettingsResponse updateDashboardSettings(String email, com.healthguard.admin.pharmacist.dto.UpdateDashboardSettingsRequest request);

    boolean isAutoRefreshEnabled(String email);

    com.healthguard.admin.pharmacist.dto.PharmacistExpiryThresholdResponse getExpiryThreshold(String email);

    com.healthguard.admin.pharmacist.dto.PharmacistExpiryThresholdResponse updateExpiryThreshold(String email, com.healthguard.admin.pharmacist.dto.UpdateExpiryThresholdRequest request);

    int getExpiryWarningThreshold(String email);

    com.healthguard.admin.pharmacist.dto.PharmacistAppearanceSettingsResponse getAppearanceSettings(String email);

    com.healthguard.admin.pharmacist.dto.PharmacistAppearanceSettingsResponse updateAppearanceSettings(String email, com.healthguard.admin.pharmacist.dto.UpdateAppearanceSettingsRequest request);

    com.healthguard.admin.pharmacist.dto.PharmacistLanguageSettingsResponse getLanguageSettings(String email);

    com.healthguard.admin.pharmacist.dto.PharmacistLanguageSettingsResponse updateLanguageSettings(String email, com.healthguard.admin.pharmacist.dto.UpdateLanguageSettingsRequest request);
}
