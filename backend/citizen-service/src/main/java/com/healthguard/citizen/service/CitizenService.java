package com.healthguard.citizen.service;

import java.util.List;

import com.healthguard.citizen.dto.CitizenRequest;
import com.healthguard.citizen.dto.CitizenResponse;
import com.healthguard.citizen.dto.UpdateCitizenRequest;

public interface CitizenService {

    CitizenResponse createCitizen(CitizenRequest request);

    CitizenResponse updateCitizen(Long userId, UpdateCitizenRequest request);

    void deleteCitizen(Long userId);

    CitizenResponse getCitizenById(Long id);

    CitizenResponse getCitizenByUserId(Long userId);

    CitizenResponse getCitizenProfileByUserId(Long userId);
    
    List<CitizenResponse> getAllCitizens();
}
