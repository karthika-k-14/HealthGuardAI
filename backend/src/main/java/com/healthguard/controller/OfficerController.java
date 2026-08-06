package com.healthguard.controller;

import com.healthguard.dto.DiseaseMonitoringResponse;
import com.healthguard.dto.HealthReportResponse;
import com.healthguard.dto.OfficerAshaWorkerResponse;
import com.healthguard.dto.OfficerDashboardResponse;
import com.healthguard.dto.OfficerPhcResponse;
import com.healthguard.dto.OfficerPhcUpdateRequest;
import com.healthguard.dto.OfficerVillageDetailResponse;
import com.healthguard.dto.OfficerVillageResponse;
import com.healthguard.entity.HealthOfficer;
import com.healthguard.exception.BadRequestException;
import com.healthguard.security.UserPrincipal;
import com.healthguard.service.OfficerService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Health Officer Module (Phase 3): dashboard summary, PHC management,
 * village management, disease monitoring, ASHA monitoring, and health
 * reports for the villages supervised by the authenticated Health Officer.
 * <p>
 * Every endpoint here requires an authenticated ROLE_HEALTH_OFFICER caller
 * - see the "/officer/**" matcher in {@code SecurityConfig}. All lookups
 * are scoped to the caller's own assigned villages, so one officer can
 * never read another officer's district.
 */
@RestController
@RequestMapping("/officer")
@RequiredArgsConstructor
@Tag(name = "Health Officer", description = "Health Officer dashboard, PHC/village management, disease monitoring, ASHA monitoring, and reports")
public class OfficerController {

    private final OfficerService officerService;

    // ---- Dashboard -----------------------------------------------------

    @GetMapping("/dashboard")
    @Operation(summary = "Get the authenticated Health Officer's dashboard summary",
            description = "Returns village/PHC/ASHA/citizen counts, high-risk patients, pending cases, "
                    + "today's reports, and disease alerts across every village supervised by the officer.")
    public ResponseEntity<OfficerDashboardResponse> getDashboard(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(officerService.getDashboard(requireHealthOfficer(principal)));
    }

    // ---- PHC management --------------------------------------------------

    @GetMapping("/phcs")
    @Operation(summary = "List PHCs in the officer's supervised villages")
    public ResponseEntity<List<OfficerPhcResponse>> getPhcs(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(officerService.getPhcs(requireHealthOfficer(principal)));
    }

    @GetMapping("/phcs/{phcId}")
    @Operation(summary = "Get details for one PHC",
            description = "Returns the PHC's details, but only if it is located in a village supervised by the caller.")
    public ResponseEntity<OfficerPhcResponse> getPhcDetail(
            @AuthenticationPrincipal UserPrincipal principal,
            @Parameter(description = "Internal id of the PHC") @PathVariable Long phcId) {
        return ResponseEntity.ok(officerService.getPhcDetail(requireHealthOfficer(principal), phcId));
    }

    @PutMapping("/phcs/{phcId}")
    @Operation(summary = "Update a PHC's details",
            description = "Updates name/address/district/phone/coordinates for a PHC in the officer's supervised villages.")
    public ResponseEntity<OfficerPhcResponse> updatePhc(
            @AuthenticationPrincipal UserPrincipal principal,
            @Parameter(description = "Internal id of the PHC") @PathVariable Long phcId,
            @Valid @RequestBody OfficerPhcUpdateRequest request) {
        return ResponseEntity.ok(officerService.updatePhc(requireHealthOfficer(principal), phcId, request));
    }

    // ---- Village management -----------------------------------------------

    @GetMapping("/villages")
    @Operation(summary = "List villages supervised by the authenticated Health Officer")
    public ResponseEntity<List<OfficerVillageResponse>> getVillages(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(officerService.getVillages(requireHealthOfficer(principal)));
    }

    @GetMapping("/villages/{villageId}")
    @Operation(summary = "Get full detail for one supervised village",
            description = "Returns the village's stats plus the ASHA workers and PHCs based there.")
    public ResponseEntity<OfficerVillageDetailResponse> getVillageDetail(
            @AuthenticationPrincipal UserPrincipal principal,
            @Parameter(description = "Internal id of the village") @PathVariable Long villageId) {
        return ResponseEntity.ok(officerService.getVillageDetail(requireHealthOfficer(principal), villageId));
    }

    // ---- Disease monitoring ------------------------------------------------

    @GetMapping("/disease-monitoring")
    @Operation(summary = "Get disease/case monitoring statistics",
            description = "Case monitoring and area-wise statistics derived from health records logged in the "
                    + "officer's villages. Outbreak alerting is not yet backed by a dedicated entity, so "
                    + "outbreakAlerts is always empty.")
    public ResponseEntity<DiseaseMonitoringResponse> getDiseaseMonitoring(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(officerService.getDiseaseMonitoring(requireHealthOfficer(principal)));
    }

    // ---- ASHA monitoring ----------------------------------------------------

    @GetMapping("/asha-workers")
    @Operation(summary = "List ASHA workers in the officer's supervised villages",
            description = "Returns each worker's identity, assignment, and assigned citizen count as a "
                    + "performance summary proxy.")
    public ResponseEntity<List<OfficerAshaWorkerResponse>> getAshaWorkers(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(officerService.getAshaWorkers(requireHealthOfficer(principal)));
    }

    // ---- Health reports -----------------------------------------------------

    @GetMapping("/reports/{reportType}")
    @Operation(summary = "Generate a health report",
            description = "reportType must be one of: daily, weekly, monthly.")
    public ResponseEntity<HealthReportResponse> getHealthReport(
            @AuthenticationPrincipal UserPrincipal principal,
            @Parameter(description = "daily, weekly, or monthly") @PathVariable String reportType) {
        return ResponseEntity.ok(officerService.getHealthReport(requireHealthOfficer(principal), reportType));
    }

    @GetMapping("/reports/{reportType}/export")
    @Operation(summary = "Export a health report as CSV",
            description = "reportType must be one of: daily, weekly, monthly.")
    public ResponseEntity<byte[]> exportHealthReport(
            @AuthenticationPrincipal UserPrincipal principal,
            @Parameter(description = "daily, weekly, or monthly") @PathVariable String reportType) {
        byte[] csv = officerService.exportHealthReport(requireHealthOfficer(principal), reportType);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType("text/csv"))
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        ContentDisposition.attachment().filename(reportType + "-health-report.csv").build().toString())
                .body(csv);
    }

    // ---- Helpers -----------------------------------------------------

    /**
     * Every endpoint here is already restricted to ROLE_HEALTH_OFFICER by
     * {@code SecurityConfig}, so this cast should always succeed; the
     * explicit check just guards against that invariant ever changing
     * without also updating this controller.
     */
    private HealthOfficer requireHealthOfficer(UserPrincipal principal) {
        if (principal.getUser() instanceof HealthOfficer officer) {
            return officer;
        }
        throw new BadRequestException("Only Health Officers can access this resource");
    }
}
