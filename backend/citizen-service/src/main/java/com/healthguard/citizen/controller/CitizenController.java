package com.healthguard.citizen.controller;

import com.healthguard.citizen.dto.*;
import com.healthguard.citizen.service.CitizenService;
import com.healthguard.citizen.service.FamilyMemberService;
import com.healthguard.citizen.service.HealthRecordService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/citizens")
@RequiredArgsConstructor
public class CitizenController {

    private final CitizenService citizenService;
    private final FamilyMemberService familyMemberService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<CitizenResponse>>> getAllCitizens() {
        List<CitizenResponse> citizens = citizenService.getAllCitizens();
        return ResponseEntity.ok(ApiResponse.success("Citizens list retrieved successfully", citizens));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<CitizenResponse>> createCitizen(@Valid @RequestBody CitizenRequest request) {
        CitizenResponse response = citizenService.createCitizen(request);
        return new ResponseEntity<>(
                ApiResponse.success("Citizen profile created successfully", response),
                HttpStatus.CREATED
        );
    }

    @GetMapping("/{id:\\d+}")
    public ResponseEntity<ApiResponse<CitizenResponse>> getCitizenById(@PathVariable Long id) {
        CitizenResponse response = citizenService.getCitizenById(id);
        return ResponseEntity.ok(ApiResponse.success("Citizen profile retrieved successfully", response));
    }

    @GetMapping("/{userId:\\d+}/profile")
    public ResponseEntity<ApiResponse<CitizenResponse>> getCitizenByUserId(
            @PathVariable Long userId,
            @RequestHeader(value = "X-User-Id", required = false) String headerUserId,
            @RequestHeader(value = "X-User-Role", required = false) String headerUserRole) {
        if ("CITIZEN".equalsIgnoreCase(headerUserRole) && headerUserId != null && !headerUserId.isBlank()) {
            Long callerId = Long.valueOf(headerUserId);
            if (!callerId.equals(userId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(ApiResponse.error("Access Denied: You cannot view another citizen's profile"));
            }
        }
        CitizenResponse response = citizenService.getCitizenByUserId(userId);
        return ResponseEntity.ok(ApiResponse.success("Citizen profile retrieved successfully", response));
    }

    @PutMapping("/{userId:\\d+}/profile")
    public ResponseEntity<ApiResponse<CitizenResponse>> updateCitizen(
            @PathVariable Long userId,
            @RequestHeader(value = "X-User-Id", required = false) String headerUserId,
            @RequestHeader(value = "X-User-Role", required = false) String headerUserRole,
            @Valid @RequestBody UpdateCitizenRequest request) {
        if ("CITIZEN".equalsIgnoreCase(headerUserRole) && headerUserId != null && !headerUserId.isBlank()) {
            Long callerId = Long.valueOf(headerUserId);
            if (!callerId.equals(userId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(ApiResponse.error("Access Denied: You cannot update another citizen's profile"));
            }
        }
        CitizenResponse response = citizenService.updateCitizen(userId, request);
        return ResponseEntity.ok(ApiResponse.success("Citizen profile updated successfully", response));
    }

    @DeleteMapping("/{userId:\\d+}/profile")
    public ResponseEntity<ApiResponse<Void>> deleteCitizen(
            @PathVariable Long userId,
            @RequestHeader(value = "X-User-Id", required = false) String headerUserId,
            @RequestHeader(value = "X-User-Role", required = false) String headerUserRole) {
        if ("CITIZEN".equalsIgnoreCase(headerUserRole) && headerUserId != null && !headerUserId.isBlank()) {
            Long callerId = Long.valueOf(headerUserId);
            if (!callerId.equals(userId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(ApiResponse.error("Access Denied: You cannot delete another citizen's profile"));
            }
        }
        citizenService.deleteCitizen(userId);
        return ResponseEntity.ok(ApiResponse.success("Citizen profile deleted successfully"));
    }

}
