package com.healthguard.citizen.service;

import com.healthguard.citizen.dto.GovernmentSchemeDTO;

import java.util.List;

public interface GovernmentSchemeService {

    List<GovernmentSchemeDTO> getAllSchemes(String category, String state, String search);

    GovernmentSchemeDTO getSchemeById(Long id);

    List<GovernmentSchemeDTO> getEligibleSchemesForCitizen(Long citizenId);

    List<String> getCategories();

    List<String> getStates();
}
