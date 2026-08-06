package com.healthguard.controller;

import com.healthguard.dto.ReferralRequest;
import com.healthguard.dto.ReferralResponse;
import com.healthguard.service.ReferralService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Admin-only Referral CRUD endpoints. Covered by the existing
 * "/admin/**" -> ROLE_ADMIN matcher in {@code SecurityConfig}, so no
 * security configuration changes are needed for this module.
 */
@RestController
@RequestMapping("/admin/referrals")
@RequiredArgsConstructor
@Tag(name = "Referrals", description = "Admin referral management endpoints")
public class ReferralController {

    private final ReferralService referralService;

    @GetMapping
    @Operation(summary = "List all referrals", description = "Returns a list of all patient referrals.")
    public ResponseEntity<List<ReferralResponse>> getAllReferrals() {
        return ResponseEntity.ok(referralService.getAllReferrals());
    }

    @GetMapping("/{referralId}")
    @Operation(summary = "Get referral by ID", description = "Returns details for a single referral record.")
    public ResponseEntity<ReferralResponse> getReferralById(@PathVariable Long referralId) {
        return ResponseEntity.ok(referralService.getReferralById(referralId));
    }

    @PostMapping
    @Operation(summary = "Create a referral", description = "Creates a new patient referral.")
    public ResponseEntity<ReferralResponse> createReferral(@Valid @RequestBody ReferralRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(referralService.createReferral(request));
    }

    @PutMapping("/{referralId}")
    @Operation(summary = "Update a referral", description = "Updates details of an existing referral.")
    public ResponseEntity<ReferralResponse> updateReferral(@PathVariable Long referralId,
                                                             @Valid @RequestBody ReferralRequest request) {
        return ResponseEntity.ok(referralService.updateReferral(referralId, request));
    }

    @DeleteMapping("/{referralId}")
    @Operation(summary = "Delete a referral", description = "Deletes a referral record by ID.")
    public ResponseEntity<Void> deleteReferral(@PathVariable Long referralId) {
        referralService.deleteReferral(referralId);
        return ResponseEntity.noContent().build();
    }
}

