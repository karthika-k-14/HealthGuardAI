package com.healthguard.controller;

import com.healthguard.dto.AssignCitizenRequest;
import com.healthguard.dto.PrescriptionRequest;
import com.healthguard.dto.PrescriptionResponse;
import com.healthguard.dto.PrescriptionStatusUpdateRequest;
import com.healthguard.dto.PrescriptionUpdateRequest;
import com.healthguard.entity.Citizen;
import com.healthguard.entity.PrescriptionStatus;
import com.healthguard.exception.BadRequestException;
import com.healthguard.security.UserPrincipal;
import com.healthguard.service.PrescriptionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Controller for Prescription module endpoints (Phase 11A).
 * <p>
 * Handles prescription creation, updates, deletion, lookup, history, citizen assignment,
 * citizen prescription viewing, status changes, and dispensing workflow.
 * Protected using JWT authentication (.anyRequest().authenticated()).
 */
@RestController
@RequestMapping("/prescriptions")
@RequiredArgsConstructor
@Tag(name = "Prescriptions", description = "Prescription management, history, assignment, dispensing, and status updates")
public class PrescriptionController {

    private final PrescriptionService prescriptionService;

    @PostMapping
    @Operation(summary = "Create a new prescription", description = "Submits a new prescription into the system.")
    public ResponseEntity<PrescriptionResponse> createPrescription(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody PrescriptionRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(prescriptionService.createPrescription(request, principal));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an existing prescription", description = "Updates prescription details, medicines, items, notes, or patient info.")
    public ResponseEntity<PrescriptionResponse> updatePrescription(
            @PathVariable Long id,
            @Valid @RequestBody PrescriptionUpdateRequest request) {
        return ResponseEntity.ok(prescriptionService.updatePrescription(id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a prescription by ID", description = "Removes a prescription record from the system.")
    public ResponseEntity<Void> deletePrescription(@PathVariable Long id) {
        prescriptionService.deletePrescription(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a prescription by ID", description = "Fetches complete details for a single prescription.")
    public ResponseEntity<PrescriptionResponse> getPrescriptionById(@PathVariable Long id) {
        return ResponseEntity.ok(prescriptionService.getPrescriptionById(id));
    }

    @GetMapping
    @Operation(summary = "List prescriptions", description = "Lists all prescriptions, with optional status, citizenId, and search filters.")
    public ResponseEntity<List<PrescriptionResponse>> listPrescriptions(
            @Parameter(description = "Filter by status: PENDING, VERIFIED, DISPENSED, REJECTED")
            @RequestParam(required = false) PrescriptionStatus status,
            @Parameter(description = "Filter by assigned citizen ID")
            @RequestParam(required = false) Long citizenId,
            @Parameter(description = "Search by patient name or referred doctor")
            @RequestParam(required = false) String search) {
        return ResponseEntity.ok(prescriptionService.listPrescriptions(status, citizenId, search));
    }

    @GetMapping("/history")
    @Operation(summary = "Prescription history", description = "Returns historical prescription records filtered by status, citizen, or search query.")
    public ResponseEntity<List<PrescriptionResponse>> getPrescriptionHistory(
            @Parameter(description = "Filter by status: PENDING, VERIFIED, DISPENSED, REJECTED")
            @RequestParam(required = false) PrescriptionStatus status,
            @Parameter(description = "Filter by citizen ID")
            @RequestParam(required = false) Long citizenId,
            @Parameter(description = "Search query")
            @RequestParam(required = false) String search) {
        return ResponseEntity.ok(prescriptionService.getPrescriptionHistory(status, citizenId, search));
    }

    @PutMapping("/{id}/assign/{citizenId}")
    @Operation(summary = "Assign a prescription to a citizen", description = "Links a prescription record to a specific citizen.")
    public ResponseEntity<PrescriptionResponse> assignPrescriptionToCitizen(
            @PathVariable Long id,
            @PathVariable Long citizenId) {
        return ResponseEntity.ok(prescriptionService.assignPrescriptionToCitizen(id, citizenId));
    }

    @PatchMapping("/{id}/assign/{citizenId}")
    @Operation(summary = "Assign a prescription to a citizen (PATCH alias)", description = "Links a prescription record to a specific citizen.")
    public ResponseEntity<PrescriptionResponse> assignPrescriptionToCitizenPatch(
            @PathVariable Long id,
            @PathVariable Long citizenId) {
        return ResponseEntity.ok(prescriptionService.assignPrescriptionToCitizen(id, citizenId));
    }

    @PutMapping("/{id}/assign")
    @Operation(summary = "Assign a prescription to a citizen (Request Body variant)")
    public ResponseEntity<PrescriptionResponse> assignPrescriptionWithBody(
            @PathVariable Long id,
            @Valid @RequestBody AssignCitizenRequest request) {
        return ResponseEntity.ok(prescriptionService.assignPrescriptionToCitizen(id, request.getCitizenId()));
    }

    @GetMapping("/citizen/{citizenId}")
    @Operation(summary = "View citizen prescriptions by citizen ID", description = "Returns all prescriptions assigned to a specific citizen.")
    public ResponseEntity<List<PrescriptionResponse>> getCitizenPrescriptions(@PathVariable Long citizenId) {
        return ResponseEntity.ok(prescriptionService.getCitizenPrescriptions(citizenId));
    }

    @GetMapping("/citizen")
    @Operation(summary = "View logged-in citizen prescriptions or by query parameter")
    public ResponseEntity<List<PrescriptionResponse>> getLoggedInCitizenPrescriptions(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) Long citizenId) {
        Long targetCitizenId = citizenId;
        if (targetCitizenId == null && principal != null && principal.getUser() instanceof Citizen citizen) {
            targetCitizenId = citizen.getId();
        }
        if (targetCitizenId == null) {
            throw new BadRequestException("Citizen ID must be provided or user must be logged in as a citizen");
        }
        return ResponseEntity.ok(prescriptionService.getCitizenPrescriptions(targetCitizenId));
    }

    @PatchMapping("/{id}/dispense")
    @Operation(summary = "Dispense a prescription", description = "Marks prescription as DISPENSED, records timestamp, and deducts medicine inventory stock.")
    public ResponseEntity<PrescriptionResponse> dispensePrescription(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @RequestBody(required = false) PrescriptionStatusUpdateRequest request) {
        return ResponseEntity.ok(prescriptionService.dispensePrescription(id, request, principal));
    }

    @PostMapping("/{id}/dispense")
    @Operation(summary = "Dispense a prescription (POST alias)")
    public ResponseEntity<PrescriptionResponse> dispensePrescriptionPost(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @RequestBody(required = false) PrescriptionStatusUpdateRequest request) {
        return ResponseEntity.ok(prescriptionService.dispensePrescription(id, request, principal));
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Update prescription status", description = "Updates prescription status (PENDING, VERIFIED, DISPENSED, REJECTED) and notes.")
    public ResponseEntity<PrescriptionResponse> updatePrescriptionStatus(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @RequestBody(required = false) PrescriptionStatusUpdateRequest request,
            @RequestParam(required = false) PrescriptionStatus status) {
        PrescriptionStatus targetStatus = (request != null && request.getStatus() != null) ? request.getStatus() : status;
        String notes = (request != null) ? request.getNotes() : null;
        return ResponseEntity.ok(prescriptionService.updatePrescriptionStatus(id, targetStatus, notes, principal));
    }

    @PutMapping("/{id}/status")
    @Operation(summary = "Update prescription status (PUT alias)")
    public ResponseEntity<PrescriptionResponse> updatePrescriptionStatusPut(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @RequestBody(required = false) PrescriptionStatusUpdateRequest request,
            @RequestParam(required = false) PrescriptionStatus status) {
        PrescriptionStatus targetStatus = (request != null && request.getStatus() != null) ? request.getStatus() : status;
        String notes = (request != null) ? request.getNotes() : null;
        return ResponseEntity.ok(prescriptionService.updatePrescriptionStatus(id, targetStatus, notes, principal));
    }
}
