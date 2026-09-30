package com.healthguard.community.service;

import com.healthguard.community.dto.HealthOfficerPreferencesDTO;
import com.healthguard.community.entity.HealthOfficerPreferences;

public interface HealthOfficerPreferencesService {
    HealthOfficerPreferences getPreferencesByUserId(Long userId);
    HealthOfficerPreferences updatePreferences(Long userId, HealthOfficerPreferencesDTO dto);
    HealthOfficerPreferencesDTO toDTO(HealthOfficerPreferences entity);
}
