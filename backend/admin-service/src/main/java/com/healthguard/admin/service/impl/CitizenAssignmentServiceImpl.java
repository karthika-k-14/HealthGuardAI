package com.healthguard.admin.service.impl;

import com.healthguard.admin.entity.CitizenAssignment;
import com.healthguard.admin.repository.CitizenAssignmentRepository;
import com.healthguard.admin.service.CitizenAssignmentService;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class CitizenAssignmentServiceImpl implements CitizenAssignmentService {

    private final CitizenAssignmentRepository assignmentRepository;

    public CitizenAssignmentServiceImpl(CitizenAssignmentRepository assignmentRepository) {
        this.assignmentRepository = assignmentRepository;
    }



    private Map<String, Object> toMap(CitizenAssignment entity) {
        if (entity == null) return null;
        Map<String, Object> map = new HashMap<>();
        map.put("assignmentId", entity.getId());
        map.put("id", entity.getId());
        map.put("citizenId", entity.getCitizenId());
        map.put("ashaWorkerId", entity.getAshaWorkerId());
        map.put("assignedByAdminId", entity.getAssignedByAdminId());
        map.put("citizenName", entity.getCitizenName());
        map.put("ashaWorkerName", entity.getAshaWorkerName());
        map.put("village", entity.getVillage());
        map.put("status", entity.getStatus() != null ? entity.getStatus() : "ACTIVE");
        map.put("assignedDate", entity.getAssignedDate() != null ? entity.getAssignedDate().toString() : LocalDateTime.now().toString());
        map.put("assignedAt", entity.getAssignedDate() != null ? entity.getAssignedDate().toString() : LocalDateTime.now().toString());
        return map;
    }

    @Override
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getAllAssignments() {
        return assignmentRepository.findAll().stream()
                .map(this::toMap)
                .collect(Collectors.toList());
    }

    @Override
    public Map<String, Object> createAssignment(Long citizenId, Long ashaWorkerId, Long adminId, String citizenName, String ashaWorkerName, String village) {
        List<CitizenAssignment> existingList = assignmentRepository.findAllByCitizenId(citizenId);
        CitizenAssignment assignment;
        if (existingList != null && !existingList.isEmpty()) {
            assignment = existingList.get(0);
            for (int i = 1; i < existingList.size(); i++) {
                try {
                    assignmentRepository.delete(existingList.get(i));
                } catch (Exception ignored) {}
            }
            assignment.setAshaWorkerId(ashaWorkerId);
            if (ashaWorkerName != null) assignment.setAshaWorkerName(ashaWorkerName);
            if (citizenName != null) assignment.setCitizenName(citizenName);
            if (village != null) assignment.setVillage(village);
            if (adminId != null) assignment.setAssignedByAdminId(adminId);
            assignment.setStatus("ACTIVE");
            assignment.setAssignedDate(LocalDateTime.now());
        } else {
            if (adminId == null) adminId = 1L;
            assignment = CitizenAssignment.builder()
                    .citizenId(citizenId)
                    .ashaWorkerId(ashaWorkerId)
                    .assignedByAdminId(adminId)
                    .citizenName(citizenName != null ? citizenName : "Citizen #" + citizenId)
                    .ashaWorkerName(ashaWorkerName != null ? ashaWorkerName : "ASHA #" + ashaWorkerId)
                    .village(village != null ? village : "Assigned Village")
                    .status("ACTIVE")
                    .assignedDate(LocalDateTime.now())
                    .build();
        }

        CitizenAssignment saved = assignmentRepository.save(assignment);
        return toMap(saved);
    }

    @Override
    public Map<String, Object> reassignCitizen(Long assignmentId, Long ashaWorkerId, String ashaWorkerName) {
        Optional<CitizenAssignment> existing = assignmentRepository.findById(assignmentId);
        if (existing.isEmpty()) {
            return null;
        }

        CitizenAssignment assignment = existing.get();
        assignment.setAshaWorkerId(ashaWorkerId);
        if (ashaWorkerName != null) {
            assignment.setAshaWorkerName(ashaWorkerName);
        }
        assignment.setAssignedDate(LocalDateTime.now());

        CitizenAssignment saved = assignmentRepository.save(assignment);
        return toMap(saved);
    }

    @Override
    public Map<String, Object> removeAssignment(Long assignmentId) {
        Optional<CitizenAssignment> existing = assignmentRepository.findById(assignmentId);
        if (existing.isEmpty()) {
            return null;
        }

        CitizenAssignment assignment = existing.get();
        assignmentRepository.delete(assignment);
        return toMap(assignment);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getAssignedCitizensForAsha(Long ashaWorkerId) {
        return assignmentRepository.findByAshaWorkerId(ashaWorkerId).stream()
                .map(this::toMap)
                .collect(Collectors.toList());
    }
}
