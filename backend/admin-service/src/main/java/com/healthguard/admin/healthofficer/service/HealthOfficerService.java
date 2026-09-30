package com.healthguard.admin.healthofficer.service;

import com.healthguard.admin.healthofficer.dto.HealthOfficerRequest;
import com.healthguard.admin.healthofficer.dto.HealthOfficerResponse;
import com.healthguard.admin.healthofficer.dto.UpdateHealthOfficerRequest;

import java.util.List;

public interface HealthOfficerService {

    HealthOfficerResponse createOfficer(HealthOfficerRequest request);

    HealthOfficerResponse getOfficerById(Long id);

    HealthOfficerResponse updateOfficer(Long id, UpdateHealthOfficerRequest request);

    void deleteOfficer(Long id);

    List<HealthOfficerResponse> getAllOfficers();
}
