package com.healthguard.admin.healthofficer.controller;

import com.healthguard.admin.healthofficer.dto.HealthOfficerRequest;
import com.healthguard.admin.healthofficer.dto.HealthOfficerResponse;
import com.healthguard.admin.healthofficer.dto.UpdateHealthOfficerRequest;
import com.healthguard.admin.healthofficer.service.HealthOfficerService;
import com.healthguard.admin.util.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/health-officers")
@RequiredArgsConstructor
public class HealthOfficerController {

    private final HealthOfficerService healthOfficerService;
    private final com.healthguard.admin.service.AuditLogService auditLogService;

    @PostMapping
    public ResponseEntity<ApiResponse<HealthOfficerResponse>> createOfficer(@Valid @RequestBody HealthOfficerRequest request) {
        HealthOfficerResponse response = healthOfficerService.createOfficer(request);
        auditLogService.logAction("HEALTH_OFFICER_CREATED", "HEALTH_OFFICER", "Created health officer: " + (response.getFullName() != null ? response.getFullName() : response.getOfficerId()));
        return new ResponseEntity<>(
                ApiResponse.success("Health Officer created successfully", response),
                HttpStatus.CREATED
        );
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<HealthOfficerResponse>>> getAllOfficers() {
        List<HealthOfficerResponse> response = healthOfficerService.getAllOfficers();
        return ResponseEntity.ok(ApiResponse.success("Health Officers list retrieved successfully", response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<HealthOfficerResponse>> getOfficerById(@PathVariable Long id) {
        HealthOfficerResponse response = healthOfficerService.getOfficerById(id);
        return ResponseEntity.ok(ApiResponse.success("Health Officer details retrieved successfully", response));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<HealthOfficerResponse>> updateOfficer(
            @PathVariable Long id,
            @Valid @RequestBody UpdateHealthOfficerRequest request) {
        HealthOfficerResponse response = healthOfficerService.updateOfficer(id, request);
        if (request.getStatus() != null && "ACTIVE".equalsIgnoreCase(request.getStatus())) {
            auditLogService.logAction("HEALTH_OFFICER_ACTIVATED", "HEALTH_OFFICER", "Activated health officer ID: " + id);
        } else if (request.getStatus() != null && ("INACTIVE".equalsIgnoreCase(request.getStatus()) || "DEACTIVATED".equalsIgnoreCase(request.getStatus()))) {
            auditLogService.logAction("HEALTH_OFFICER_DEACTIVATED", "HEALTH_OFFICER", "Deactivated health officer ID: " + id);
        } else {
            auditLogService.logAction("HEALTH_OFFICER_UPDATED", "HEALTH_OFFICER", "Updated health officer ID: " + id);
        }
        return ResponseEntity.ok(ApiResponse.success("Health Officer updated successfully", response));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteOfficer(@PathVariable Long id) {
        healthOfficerService.deleteOfficer(id);
        auditLogService.logAction("HEALTH_OFFICER_DELETED", "HEALTH_OFFICER", "Deleted health officer ID: " + id);
        return ResponseEntity.ok(ApiResponse.success("Health Officer deleted successfully"));
    }
}
