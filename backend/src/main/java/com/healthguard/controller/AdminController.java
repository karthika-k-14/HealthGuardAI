package com.healthguard.controller;

import com.healthguard.dto.AdminRegisterRequest;
import com.healthguard.dto.ApprovalStatsResponse;
import com.healthguard.dto.AssignAshaRequest;
import com.healthguard.dto.AssignOfficerRequest;
import com.healthguard.dto.AssignPharmacistRequest;
import com.healthguard.dto.PendingUserResponse;
import com.healthguard.dto.RejectRequest;
import com.healthguard.dto.UserSummaryResponse;
import com.healthguard.service.AdminService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Admin-only endpoints: reviewing and acting on pending staff
 * registrations, assigning villages/PHCs/districts, and creating further
 * Admin accounts.
 * <p>
 * Every endpoint here requires an authenticated ROLE_ADMIN caller - see the
 * "/admin/**" matcher in {@code SecurityConfig}. There is deliberately no
 * public Admin registration page; {@code /admin/admins} is how (and the
 * only way) new Admin accounts get created.
 */
@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
@Tag(name = "Admin", description = "Admin-only staff approvals, assignments, and account creation")
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/approvals/pending")
    @Operation(summary = "List pending staff registration approvals", description = "Returns a list of all staff accounts pending admin approval.")
    public ResponseEntity<List<PendingUserResponse>> pendingApprovals() {
        return ResponseEntity.ok(adminService.listPending());
    }

    @GetMapping("/approvals/stats")
    @Operation(summary = "Get registration approval statistics", description = "Returns total pending, approved, and rejected registration counts.")
    public ResponseEntity<ApprovalStatsResponse> approvalStats() {
        return ResponseEntity.ok(adminService.approvalStats());
    }

    @PostMapping("/approvals/{userId}/approve")
    @Operation(summary = "Approve a pending staff registration", description = "Approves a pending staff account, activating their access.")
    public ResponseEntity<UserSummaryResponse> approve(@PathVariable Long userId) {
        return ResponseEntity.ok(adminService.approve(userId));
    }

    @PostMapping("/approvals/{userId}/reject")
    @Operation(summary = "Reject a pending staff registration", description = "Rejects a pending staff account with an optional rejection reason.")
    public ResponseEntity<UserSummaryResponse> reject(@PathVariable Long userId,
                                                       @RequestBody(required = false) RejectRequest request) {
        return ResponseEntity.ok(adminService.reject(userId, request));
    }

    @PostMapping("/approvals/{userId}/suspend")
    @Operation(summary = "Suspend an active user account", description = "Suspends an active account, temporarily revoking login privileges.")
    public ResponseEntity<UserSummaryResponse> suspend(@PathVariable Long userId) {
        return ResponseEntity.ok(adminService.suspend(userId));
    }

    @PostMapping("/approvals/{userId}/deactivate")
    @Operation(summary = "Deactivate a user account", description = "Deactivates a user account permanently.")
    public ResponseEntity<UserSummaryResponse> deactivate(@PathVariable Long userId) {
        return ResponseEntity.ok(adminService.deactivate(userId));
    }

    @PostMapping("/assign/asha/{userId}")
    @Operation(summary = "Assign village to an ASHA worker", description = "Assigns a specific village to an ASHA worker.")
    public ResponseEntity<UserSummaryResponse> assignAsha(@PathVariable Long userId,
                                                           @Valid @RequestBody AssignAshaRequest request) {
        return ResponseEntity.ok(adminService.assignAsha(userId, request));
    }

    @PostMapping("/assign/officer/{userId}")
    @Operation(summary = "Assign villages/district to a Health Officer", description = "Assigns supervised villages and district to a Health Officer.")
    public ResponseEntity<UserSummaryResponse> assignOfficer(@PathVariable Long userId,
                                                              @Valid @RequestBody AssignOfficerRequest request) {
        return ResponseEntity.ok(adminService.assignOfficer(userId, request));
    }

    @PostMapping("/assign/pharmacist/{userId}")
    @Operation(summary = "Assign PHC to a Pharmacist", description = "Assigns a Primary Health Centre to a Pharmacist.")
    public ResponseEntity<UserSummaryResponse> assignPharmacist(@PathVariable Long userId,
                                                                 @RequestBody AssignPharmacistRequest request) {
        return ResponseEntity.ok(adminService.assignPharmacist(userId, request));
    }

    @PostMapping("/admins")
    @Operation(summary = "Create a new Admin account", description = "Creates a new Admin user account.")
    public ResponseEntity<UserSummaryResponse> createAdmin(@Valid @RequestBody AdminRegisterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(adminService.createAdmin(request));
    }
}

