package com.healthguard.community.controller;

import com.healthguard.community.dto.*;
import com.healthguard.community.service.EmergencyAlertService;
import com.healthguard.community.service.EmergencyClassificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/emergency-alerts")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class EmergencyAlertController {

    private final EmergencyAlertService emergencyAlertService;
    private final EmergencyClassificationService classificationService;

    /**
     * Analyze symptoms without saving (used for live UI advice).
     */
    @PostMapping("/analyze")
    public ResponseEntity<ApiResponse<EmergencyClassificationResult>> analyzeSymptoms(
            @RequestBody CreateEmergencyAlertRequest request) {
        EmergencyClassificationResult result = classificationService.analyzeSymptoms(
                request.getSymptoms(),
                request.getDiseaseCategory(),
                request.getUrgencyScore()
        );
        return ResponseEntity.ok(ApiResponse.success("Symptom urgency analysis completed", result));
    }

    /**
     * Create or update an emergency alert automatically based on AI detection.
     */
    @PostMapping("/create")
    public ResponseEntity<ApiResponse<EmergencyAlertDTO>> createEmergencyAlert(
            @RequestHeader(value = "X-User-Id", required = false) String headerUserId,
            @RequestBody CreateEmergencyAlertRequest request) {

        if (request.getCitizenId() == null && headerUserId != null && !headerUserId.isBlank()) {
            try {
                request.setCitizenId(Long.parseLong(headerUserId));
            } catch (Exception ignored) {}
        }

        EmergencyAlertDTO alert = emergencyAlertService.createAlert(request);
        return new ResponseEntity<>(
                ApiResponse.success("Emergency alert processed and escalated successfully", alert),
                HttpStatus.CREATED
        );
    }

    /**
     * Get emergency alerts (by citizenId query/header, or all if officer/admin).
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<EmergencyAlertDTO>>> getEmergencyAlerts(
            @RequestParam(value = "citizenId", required = false) Long citizenId,
            @RequestHeader(value = "X-User-Id", required = false) String headerUserId) {
        Long targetCitizenId = citizenId;
        if (targetCitizenId == null && headerUserId != null && !headerUserId.isBlank()) {
            try {
                targetCitizenId = Long.parseLong(headerUserId);
            } catch (Exception ignored) {}
        }
        List<EmergencyAlertDTO> alerts = (targetCitizenId != null && targetCitizenId > 0)
                ? emergencyAlertService.getAlertsForCitizen(targetCitizenId)
                : emergencyAlertService.getAlertsForOfficer();
        return ResponseEntity.ok(ApiResponse.success("Emergency alerts retrieved", alerts));
    }

    /**
     * Get alerts specifically for a citizen ID.
     */
    @GetMapping("/citizen/{citizenId}")
    public ResponseEntity<ApiResponse<List<EmergencyAlertDTO>>> getCitizenAlerts(@PathVariable Long citizenId) {
        List<EmergencyAlertDTO> alerts = emergencyAlertService.getAlertsForCitizen(citizenId);
        return ResponseEntity.ok(ApiResponse.success("Citizen emergency alerts retrieved", alerts));
    }

    /**
     * Get alerts assigned to a specific ASHA worker.
     */
    @GetMapping("/asha/{ashaId}")
    public ResponseEntity<ApiResponse<List<EmergencyAlertDTO>>> getAshaAlerts(
            @PathVariable Long ashaId) {
        List<EmergencyAlertDTO> alerts = emergencyAlertService.getAlertsForAsha(ashaId);
        return ResponseEntity.ok(ApiResponse.success("Assigned emergency alerts retrieved", alerts));
    }

    /**
     * Get alerts for Health Officer monitoring center.
     */
    @GetMapping("/officer")
    public ResponseEntity<ApiResponse<List<EmergencyAlertDTO>>> getOfficerAlerts() {
        List<EmergencyAlertDTO> alerts = emergencyAlertService.getAlertsForOfficer();
        return ResponseEntity.ok(ApiResponse.success("Officer emergency monitoring feed retrieved", alerts));
    }

    /**
     * Get specific emergency alert by ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<EmergencyAlertDTO>> getAlertById(@PathVariable Long id) {
        EmergencyAlertDTO alert = emergencyAlertService.getAlertById(id);
        return ResponseEntity.ok(ApiResponse.success("Emergency alert details retrieved", alert));
    }

    /**
     * Update emergency alert status (CONTACTED, VISIT_SCHEDULED, VISITED, ESCALATED, RESOLVED).
     */
    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse<EmergencyAlertDTO>> updateAlertStatus(
            @PathVariable Long id,
            @RequestBody UpdateEmergencyAlertStatusRequest request) {
        EmergencyAlertDTO updated = emergencyAlertService.updateStatus(id, request);
        return ResponseEntity.ok(ApiResponse.success("Emergency alert status updated successfully", updated));
    }

    /**
     * Escalate emergency alert to Health Officer.
     */
    @PutMapping("/{id}/escalate")
    public ResponseEntity<ApiResponse<EmergencyAlertDTO>> escalateToOfficer(
            @PathVariable Long id,
            @RequestBody EscalateEmergencyAlertRequest request) {
        EmergencyAlertDTO escalated = emergencyAlertService.escalateToOfficer(id, request);
        return ResponseEntity.ok(ApiResponse.success("Emergency alert escalated to Health Officer", escalated));
    }

    /**
     * Resolve emergency alert case.
     */
    @PutMapping("/{id}/resolve")
    public ResponseEntity<ApiResponse<EmergencyAlertDTO>> resolveAlert(
            @PathVariable Long id,
            @RequestParam(value = "notes", required = false) String notes,
            @RequestParam(value = "performedBy", required = false, defaultValue = "ASHA Worker") String performedBy) {
        EmergencyAlertDTO resolved = emergencyAlertService.resolveAlert(id, notes, performedBy);
        return ResponseEntity.ok(ApiResponse.success("Emergency alert resolved successfully", resolved));
    }

    /**
     * Get summary statistics for Emergency Monitoring Center widgets.
     */
    @GetMapping("/statistics")
    public ResponseEntity<ApiResponse<EmergencyStatisticsDTO>> getStatistics() {
        EmergencyStatisticsDTO stats = emergencyAlertService.getStatistics();
        return ResponseEntity.ok(ApiResponse.success("Emergency response statistics retrieved", stats));
    }
}
