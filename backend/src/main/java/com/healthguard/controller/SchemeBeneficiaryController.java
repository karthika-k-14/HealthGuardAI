package com.healthguard.controller;

import com.healthguard.dto.SchemeApplicationResponse;
import com.healthguard.dto.SchemeApplicationReviewRequest;
import com.healthguard.service.SchemeApplicationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Admin-only Scheme Beneficiary Management endpoints: reviewing applications
 * and moving them through the eligibility / approval / rejection workflow.
 * Covered by the existing "/admin/**" -&gt; ROLE_ADMIN matcher in
 * {@code SecurityConfig}.
 */
@RestController
@RequestMapping("/admin/scheme-applications")
@RequiredArgsConstructor
@Tag(name = "Scheme Beneficiary Management (Admin)",
        description = "Review scheme applications: eligible citizens, approved and rejected beneficiaries")
public class SchemeBeneficiaryController {

    private final SchemeApplicationService schemeApplicationService;

    @GetMapping
    @Operation(summary = "List all scheme applications, across every status")
    public ResponseEntity<List<SchemeApplicationResponse>> getAllApplications() {
        return ResponseEntity.ok(schemeApplicationService.getAllApplications());
    }

    @GetMapping("/eligible")
    @Operation(summary = "List citizens marked eligible, pending final approval")
    public ResponseEntity<List<SchemeApplicationResponse>> getEligibleCitizens() {
        return ResponseEntity.ok(schemeApplicationService.getEligibleCitizens());
    }

    @GetMapping("/approved")
    @Operation(summary = "List approved beneficiaries")
    public ResponseEntity<List<SchemeApplicationResponse>> getApprovedBeneficiaries() {
        return ResponseEntity.ok(schemeApplicationService.getApprovedBeneficiaries());
    }

    @GetMapping("/rejected")
    @Operation(summary = "List rejected beneficiaries")
    public ResponseEntity<List<SchemeApplicationResponse>> getRejectedBeneficiaries() {
        return ResponseEntity.ok(schemeApplicationService.getRejectedBeneficiaries());
    }

    @PutMapping("/{applicationId}/mark-eligible")
    @Operation(summary = "Mark a pending application as eligible")
    public ResponseEntity<SchemeApplicationResponse> markEligible(
            @PathVariable Long applicationId,
            @RequestBody(required = false) SchemeApplicationReviewRequest request) {
        return ResponseEntity.ok(schemeApplicationService.markEligible(applicationId, request));
    }

    @PutMapping("/{applicationId}/approve")
    @Operation(summary = "Approve a pending or eligible application, making the citizen a beneficiary")
    public ResponseEntity<SchemeApplicationResponse> approve(
            @PathVariable Long applicationId,
            @RequestBody(required = false) SchemeApplicationReviewRequest request) {
        return ResponseEntity.ok(schemeApplicationService.approve(applicationId, request));
    }

    @PutMapping("/{applicationId}/reject")
    @Operation(summary = "Reject an application")
    public ResponseEntity<SchemeApplicationResponse> reject(
            @PathVariable Long applicationId,
            @RequestBody(required = false) SchemeApplicationReviewRequest request) {
        return ResponseEntity.ok(schemeApplicationService.reject(applicationId, request));
    }
}
