package com.healthguard.controller;

import com.healthguard.dto.AshaDashboardResponse;
import com.healthguard.dto.AssignedCitizenDetailResponse;
import com.healthguard.dto.AssignedCitizenResponse;
import com.healthguard.dto.AssignedVillageResponse;
import com.healthguard.entity.AshaWorker;
import com.healthguard.exception.BadRequestException;
import com.healthguard.security.UserPrincipal;
import com.healthguard.service.AshaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * ASHA Module (Phase 2A): the authenticated ASHA worker's own dashboard
 * summary, plus read-only access to the citizens and village assigned to
 * them.
 * <p>
 * Every endpoint here requires an authenticated ROLE_ASHA_WORKER caller -
 * see the "/asha/**" matcher in {@code SecurityConfig}. This phase is
 * deliberately read-only and scoped to the caller's own assignment; it
 * does not cover pregnancy tracking, vaccination, home visits, surveys,
 * follow-up, or reports, which are out of scope until a later phase.
 */
@RestController
@RequestMapping("/asha")
@RequiredArgsConstructor
@Tag(name = "ASHA", description = "ASHA worker dashboard and assigned citizens/villages")
public class AshaController {

    private final AshaService ashaService;

    @GetMapping("/dashboard")
    @Operation(summary = "Get the authenticated ASHA worker's dashboard summary",
            description = "Returns the ASHA worker's identity, assigned village/PHC, and total assigned citizen count.")
    public ResponseEntity<AshaDashboardResponse> getDashboard(@AuthenticationPrincipal UserPrincipal principal) {
        AshaWorker asha = requireAshaWorker(principal);
        return ResponseEntity.ok(ashaService.getDashboard(asha));
    }

    @GetMapping("/citizens")
    @Operation(summary = "List citizens assigned to the authenticated ASHA worker",
            description = "Returns every citizen registered in the ASHA worker's assigned village. Empty if the worker has no assigned village yet.")
    public ResponseEntity<List<AssignedCitizenResponse>> getAssignedCitizens(
            @AuthenticationPrincipal UserPrincipal principal) {
        AshaWorker asha = requireAshaWorker(principal);
        return ResponseEntity.ok(ashaService.getAssignedCitizens(asha));
    }

    @GetMapping("/citizens/{citizenId}")
    @Operation(summary = "Get full details for one assigned citizen",
            description = "Returns the citizen's profile, family members, and health records - but only if the citizen belongs to the ASHA worker's assigned village.")
    public ResponseEntity<AssignedCitizenDetailResponse> getAssignedCitizenDetails(
            @AuthenticationPrincipal UserPrincipal principal,
            @Parameter(description = "Internal id of the assigned citizen") @PathVariable Long citizenId) {
        AshaWorker asha = requireAshaWorker(principal);
        return ResponseEntity.ok(ashaService.getAssignedCitizenDetails(asha, citizenId));
    }

    @GetMapping("/villages")
    @Operation(summary = "List villages assigned to the authenticated ASHA worker",
            description = "An ASHA worker currently has exactly one assigned village; returned as a list (empty if not yet assigned) for consistency with other roles.")
    public ResponseEntity<List<AssignedVillageResponse>> getAssignedVillages(
            @AuthenticationPrincipal UserPrincipal principal) {
        AshaWorker asha = requireAshaWorker(principal);
        return ResponseEntity.ok(ashaService.getAssignedVillages(asha));
    }

    // ---- Helpers -----------------------------------------------------

    /**
     * Every endpoint here is already restricted to ROLE_ASHA_WORKER by
     * {@code SecurityConfig}, so this cast should always succeed; the
     * explicit check just guards against that invariant ever changing
     * without also updating this controller.
     */
    private AshaWorker requireAshaWorker(UserPrincipal principal) {
        if (principal.getUser() instanceof AshaWorker asha) {
            return asha;
        }
        throw new BadRequestException("Only ASHA workers can access this resource");
    }
}
