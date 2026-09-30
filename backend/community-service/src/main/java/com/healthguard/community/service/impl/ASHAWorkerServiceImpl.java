package com.healthguard.community.service.impl;

import com.healthguard.community.dto.ASHAWorkerRequest;
import com.healthguard.community.dto.ASHAWorkerResponse;
import com.healthguard.community.dto.UpdateASHAWorkerRequest;
import com.healthguard.community.entity.ASHAWorker;
import com.healthguard.community.exception.DuplicateResourceException;
import com.healthguard.community.exception.ResourceNotFoundException;
import com.healthguard.community.repository.ASHAWorkerRepository;
import com.healthguard.community.service.ASHAWorkerService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ASHAWorkerServiceImpl implements ASHAWorkerService {

    private final ASHAWorkerRepository ashaWorkerRepository;

    @Override
    @Transactional
    public ASHAWorkerResponse createWorker(ASHAWorkerRequest request) {
        if (ashaWorkerRepository.existsByWorkerId(request.getWorkerId())) {
            throw new DuplicateResourceException("ASHA Worker already exists with Worker ID: " + request.getWorkerId());
        }

        if (ashaWorkerRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("ASHA Worker already exists with email: " + request.getEmail());
        }

        ASHAWorker worker = ASHAWorker.builder()
                .workerId(request.getWorkerId())
                .fullName(request.getFullName())
                .mobileNumber(request.getMobileNumber())
                .email(request.getEmail())
                .district(request.getDistrict())
                .village(request.getVillage())
                .qualification(request.getQualification())
                .assignedPHC(request.getAssignedPHC())
                .status(request.getStatus() != null ? request.getStatus() : "ACTIVE")
                .build();

        ASHAWorker savedWorker = ashaWorkerRepository.save(worker);
        return mapToResponse(savedWorker);
    }

    @Override
    @Transactional(readOnly = true)
    public ASHAWorkerResponse getWorkerById(Long id) {
        ASHAWorker worker = ashaWorkerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ASHA Worker not found with ID: " + id));
        return mapToResponse(worker);
    }

    @Override
    @Transactional(readOnly = true)
    public ASHAWorkerResponse getWorkerByWorkerId(String workerId) {
        ASHAWorker worker = ashaWorkerRepository.findByWorkerId(workerId)
                .orElseThrow(() -> new ResourceNotFoundException("ASHA Worker not found with Worker ID: " + workerId));
        return mapToResponse(worker);
    }

    @Override
    @Transactional
    public ASHAWorkerResponse updateWorker(Long id, UpdateASHAWorkerRequest request) {
        ASHAWorker worker = ashaWorkerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ASHA Worker not found with ID: " + id));

        if (request.getEmail() != null && !request.getEmail().equalsIgnoreCase(worker.getEmail())) {
            if (ashaWorkerRepository.existsByEmail(request.getEmail())) {
                throw new DuplicateResourceException("Email already in use: " + request.getEmail());
            }
            worker.setEmail(request.getEmail());
        }

        if (request.getFullName() != null) worker.setFullName(request.getFullName());
        if (request.getMobileNumber() != null) worker.setMobileNumber(request.getMobileNumber());
        if (request.getDistrict() != null) worker.setDistrict(request.getDistrict());
        if (request.getVillage() != null) worker.setVillage(request.getVillage());
        if (request.getQualification() != null) worker.setQualification(request.getQualification());
        if (request.getAssignedPHC() != null) worker.setAssignedPHC(request.getAssignedPHC());
        if (request.getStatus() != null) worker.setStatus(request.getStatus());

        ASHAWorker updatedWorker = ashaWorkerRepository.save(worker);
        return mapToResponse(updatedWorker);
    }

    @Override
    @Transactional
    public void deleteWorker(Long id) {
        ASHAWorker worker = ashaWorkerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ASHA Worker not found with ID: " + id));
        ashaWorkerRepository.delete(worker);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ASHAWorkerResponse> getAllWorkers(String district) {
        List<ASHAWorker> workers;
        if (district != null && !district.isBlank()) {
            workers = ashaWorkerRepository.findByDistrict(district);
        } else {
            workers = ashaWorkerRepository.findAll();
        }
        return workers.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    private ASHAWorkerResponse mapToResponse(ASHAWorker worker) {
        return ASHAWorkerResponse.builder()
                .id(worker.getId())
                .workerId(worker.getWorkerId())
                .fullName(worker.getFullName())
                .mobileNumber(worker.getMobileNumber())
                .email(worker.getEmail())
                .district(worker.getDistrict())
                .village(worker.getVillage())
                .qualification(worker.getQualification())
                .assignedPHC(worker.getAssignedPHC())
                .status(worker.getStatus())
                .createdAt(worker.getCreatedAt())
                .updatedAt(worker.getUpdatedAt())
                .build();
    }
}
