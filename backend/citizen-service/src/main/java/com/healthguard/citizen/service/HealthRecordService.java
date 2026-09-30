package com.healthguard.citizen.service;

import com.healthguard.citizen.dto.HealthRecordRequest;
import com.healthguard.citizen.dto.HealthRecordResponse;

import java.util.List;

public interface HealthRecordService {

    List<HealthRecordResponse> getHealthRecordsByUserId(Long userId);

    HealthRecordResponse addHealthRecord(Long userId, HealthRecordRequest request);

    HealthRecordResponse updateHealthRecord(Long id, HealthRecordRequest request);

    void deleteHealthRecord(Long id);
}
