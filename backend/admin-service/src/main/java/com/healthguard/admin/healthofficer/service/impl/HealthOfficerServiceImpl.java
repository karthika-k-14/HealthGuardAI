package com.healthguard.admin.healthofficer.service.impl;

import com.healthguard.admin.exception.DuplicateResourceException;
import com.healthguard.admin.exception.ResourceNotFoundException;
import com.healthguard.admin.healthofficer.dto.HealthOfficerRequest;
import com.healthguard.admin.healthofficer.dto.HealthOfficerResponse;
import com.healthguard.admin.healthofficer.dto.UpdateHealthOfficerRequest;
import com.healthguard.admin.healthofficer.entity.HealthOfficer;
import com.healthguard.admin.healthofficer.repository.HealthOfficerRepository;
import com.healthguard.admin.healthofficer.service.HealthOfficerService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class HealthOfficerServiceImpl implements HealthOfficerService {

    private final HealthOfficerRepository healthOfficerRepository;

    @Override
    @Transactional
    public HealthOfficerResponse createOfficer(HealthOfficerRequest request) {
        if (healthOfficerRepository.existsByOfficerId(request.getOfficerId())) {
            throw new DuplicateResourceException("Health Officer already exists with Officer ID: " + request.getOfficerId());
        }

        if (healthOfficerRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Health Officer already exists with Email: " + request.getEmail());
        }

        HealthOfficer officer = HealthOfficer.builder()
                .officerId(request.getOfficerId())
                .fullName(request.getFullName())
                .email(request.getEmail())
                .mobileNumber(request.getMobileNumber())
                .district(request.getDistrict())
                .designation(request.getDesignation())
                .status(request.getStatus() != null ? request.getStatus() : "ACTIVE")
                .build();

        HealthOfficer saved = healthOfficerRepository.save(officer);
        return mapToResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public HealthOfficerResponse getOfficerById(Long id) {
        HealthOfficer officer = healthOfficerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Health Officer not found with ID: " + id));
        return mapToResponse(officer);
    }

    @Override
    @Transactional
    public HealthOfficerResponse updateOfficer(Long id, UpdateHealthOfficerRequest request) {
        HealthOfficer officer = healthOfficerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Health Officer not found with ID: " + id));

        if (request.getEmail() != null && !request.getEmail().equalsIgnoreCase(officer.getEmail())) {
            if (healthOfficerRepository.existsByEmail(request.getEmail())) {
                throw new DuplicateResourceException("Email already in use: " + request.getEmail());
            }
            officer.setEmail(request.getEmail());
        }

        if (request.getFullName() != null) officer.setFullName(request.getFullName());
        if (request.getMobileNumber() != null) officer.setMobileNumber(request.getMobileNumber());
        if (request.getDistrict() != null) officer.setDistrict(request.getDistrict());
        if (request.getDesignation() != null) officer.setDesignation(request.getDesignation());
        if (request.getStatus() != null) officer.setStatus(request.getStatus());

        HealthOfficer updated = healthOfficerRepository.save(officer);
        return mapToResponse(updated);
    }

    @Override
    @Transactional
    public void deleteOfficer(Long id) {
        HealthOfficer officer = healthOfficerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Health Officer not found with ID: " + id));
        healthOfficerRepository.delete(officer);
    }

    @Override
    @Transactional(readOnly = true)
    public List<HealthOfficerResponse> getAllOfficers() {
        return healthOfficerRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private HealthOfficerResponse mapToResponse(HealthOfficer officer) {
        return HealthOfficerResponse.builder()
                .id(officer.getId())
                .officerId(officer.getOfficerId())
                .fullName(officer.getFullName())
                .email(officer.getEmail())
                .mobileNumber(officer.getMobileNumber())
                .district(officer.getDistrict())
                .designation(officer.getDesignation())
                .status(officer.getStatus())
                .createdAt(officer.getCreatedAt())
                .updatedAt(officer.getUpdatedAt())
                .build();
    }
}
