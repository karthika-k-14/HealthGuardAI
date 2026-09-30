package com.healthguard.citizen.service.impl;

import com.healthguard.citizen.dto.HealthRecordRequest;
import com.healthguard.citizen.dto.HealthRecordResponse;
import com.healthguard.citizen.entity.HealthRecord;
import com.healthguard.citizen.exception.ResourceNotFoundException;
import com.healthguard.citizen.repository.HealthRecordRepository;
import com.healthguard.citizen.service.HealthRecordService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class HealthRecordServiceImpl implements HealthRecordService {

    private final HealthRecordRepository healthRecordRepository;

    @Override
    @Transactional(readOnly = true)
    public List<HealthRecordResponse> getHealthRecordsByUserId(Long userId) {
        Long targetUserId = (userId != null && userId > 0) ? userId : 1L;
        List<HealthRecord> records = healthRecordRepository.findByUserId(targetUserId);
        if (records == null || records.isEmpty()) {
            return Collections.emptyList();
        }
        return records.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public HealthRecordResponse addHealthRecord(Long userId, HealthRecordRequest request) {
        Long targetUserId = (userId != null && userId > 0) ? userId : (request != null && request.getUserId() != null ? request.getUserId() : 1L);
        LocalDate recordDate = (request != null && request.getRecordDate() != null) ? request.getRecordDate() : LocalDate.now();

        HealthRecord record = HealthRecord.builder()
                .userId(targetUserId)
                .recordType(request != null && request.getRecordType() != null ? request.getRecordType() : "GENERAL")
                .title(request != null && request.getTitle() != null ? request.getTitle() : "Health Record")
                .description(request != null ? request.getDescription() : null)
                .doctorName(request != null ? request.getDoctorName() : null)
                .hospitalName(request != null ? request.getHospitalName() : null)
                .recordDate(recordDate)
                .attachmentUrl(request != null ? request.getAttachmentUrl() : null)
                .build();
        HealthRecord saved = healthRecordRepository.save(record);
        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public HealthRecordResponse updateHealthRecord(Long id, HealthRecordRequest request) {
        HealthRecord record = healthRecordRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Health record not found with ID: " + id));

        if (request != null) {
            if (request.getRecordType() != null) record.setRecordType(request.getRecordType());
            if (request.getTitle() != null) record.setTitle(request.getTitle());
            if (request.getDescription() != null) record.setDescription(request.getDescription());
            if (request.getDoctorName() != null) record.setDoctorName(request.getDoctorName());
            if (request.getHospitalName() != null) record.setHospitalName(request.getHospitalName());
            if (request.getRecordDate() != null) record.setRecordDate(request.getRecordDate());
            if (request.getAttachmentUrl() != null) record.setAttachmentUrl(request.getAttachmentUrl());
        }

        HealthRecord updated = healthRecordRepository.save(record);
        return mapToResponse(updated);
    }

    @Override
    @Transactional
    public void deleteHealthRecord(Long id) {
        HealthRecord record = healthRecordRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Health record not found with ID: " + id));
        healthRecordRepository.delete(record);
    }

    private HealthRecordResponse mapToResponse(HealthRecord record) {
        return HealthRecordResponse.builder()
                .id(record.getId())
                .userId(record.getUserId())
                .recordType(record.getRecordType())
                .title(record.getTitle())
                .description(record.getDescription())
                .doctorName(record.getDoctorName())
                .hospitalName(record.getHospitalName())
                .recordDate(record.getRecordDate())
                .attachmentUrl(record.getAttachmentUrl())
                .createdAt(record.getCreatedAt())
                .updatedAt(record.getUpdatedAt())
                .build();
    }
}
