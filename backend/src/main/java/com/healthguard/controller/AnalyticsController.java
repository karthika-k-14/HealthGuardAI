package com.healthguard.controller;

import com.healthguard.dto.CampaignStatisticsResponse;
import com.healthguard.dto.CitizenStatisticsResponse;
import com.healthguard.dto.DashboardSummaryResponse;
import com.healthguard.dto.DiseaseStatisticsResponse;
import com.healthguard.dto.HospitalStatisticsResponse;
import com.healthguard.dto.MedicineStatisticsResponse;
import com.healthguard.dto.ReportAnalyticsResponse;
import com.healthguard.dto.TotalCountResponse;
import com.healthguard.service.AnalyticsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Controller exposing endpoints for system-wide analytics, counts, entity statistics, and reports.
 */
@RestController
@RequestMapping("/analytics")
@RequiredArgsConstructor
@Tag(name = "Analytics", description = "System Analytics, Totals, Domain Statistics & Periodic Reports")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping("/dashboard-summary")
    @Operation(summary = "Get overall dashboard summary", description = "Returns system totals and overview metrics.")
    public ResponseEntity<DashboardSummaryResponse> getDashboardSummary() {
        return ResponseEntity.ok(analyticsService.getDashboardSummary());
    }

    @GetMapping("/total-citizens")
    @Operation(summary = "Get total citizens count")
    public ResponseEntity<TotalCountResponse> getTotalCitizens() {
        return ResponseEntity.ok(analyticsService.getTotalCitizens());
    }

    @GetMapping("/total-asha-workers")
    @Operation(summary = "Get total ASHA workers count")
    public ResponseEntity<TotalCountResponse> getTotalAshaWorkers() {
        return ResponseEntity.ok(analyticsService.getTotalAshaWorkers());
    }

    @GetMapping("/total-health-officers")
    @Operation(summary = "Get total health officers count")
    public ResponseEntity<TotalCountResponse> getTotalHealthOfficers() {
        return ResponseEntity.ok(analyticsService.getTotalHealthOfficers());
    }

    @GetMapping("/total-pharmacists")
    @Operation(summary = "Get total pharmacists count")
    public ResponseEntity<TotalCountResponse> getTotalPharmacists() {
        return ResponseEntity.ok(analyticsService.getTotalPharmacists());
    }

    @GetMapping("/total-hospitals")
    @Operation(summary = "Get total hospitals count")
    public ResponseEntity<TotalCountResponse> getTotalHospitals() {
        return ResponseEntity.ok(analyticsService.getTotalHospitals());
    }

    @GetMapping("/total-phcs")
    @Operation(summary = "Get total PHCs count")
    public ResponseEntity<TotalCountResponse> getTotalPhcs() {
        return ResponseEntity.ok(analyticsService.getTotalPhcs());
    }

    @GetMapping("/total-villages")
    @Operation(summary = "Get total villages count")
    public ResponseEntity<TotalCountResponse> getTotalVillages() {
        return ResponseEntity.ok(analyticsService.getTotalVillages());
    }

    @GetMapping("/total-medicines")
    @Operation(summary = "Get total medicines count")
    public ResponseEntity<TotalCountResponse> getTotalMedicines() {
        return ResponseEntity.ok(analyticsService.getTotalMedicines());
    }

    @GetMapping("/total-prescriptions")
    @Operation(summary = "Get total prescriptions count")
    public ResponseEntity<TotalCountResponse> getTotalPrescriptions() {
        return ResponseEntity.ok(analyticsService.getTotalPrescriptions());
    }

    @GetMapping("/total-campaigns")
    @Operation(summary = "Get total campaigns count")
    public ResponseEntity<TotalCountResponse> getTotalCampaigns() {
        return ResponseEntity.ok(analyticsService.getTotalCampaigns());
    }

    @GetMapping("/total-notifications")
    @Operation(summary = "Get total notifications count")
    public ResponseEntity<TotalCountResponse> getTotalNotifications() {
        return ResponseEntity.ok(analyticsService.getTotalNotifications());
    }

    @GetMapping("/citizen-statistics")
    @Operation(summary = "Get citizen statistics", description = "Returns demographic, gender, age, and chronic disease breakdowns.")
    public ResponseEntity<CitizenStatisticsResponse> getCitizenStatistics() {
        return ResponseEntity.ok(analyticsService.getCitizenStatistics());
    }

    @GetMapping("/medicine-statistics")
    @Operation(summary = "Get medicine statistics", description = "Returns inventory status, low stock, out of stock, and category counts.")
    public ResponseEntity<MedicineStatisticsResponse> getMedicineStatistics() {
        return ResponseEntity.ok(analyticsService.getMedicineStatistics());
    }

    @GetMapping("/disease-statistics")
    @Operation(summary = "Get disease statistics", description = "Returns disease prevalence and health record type breakdowns.")
    public ResponseEntity<DiseaseStatisticsResponse> getDiseaseStatistics() {
        return ResponseEntity.ok(analyticsService.getDiseaseStatistics());
    }

    @GetMapping("/hospital-statistics")
    @Operation(summary = "Get hospital statistics", description = "Returns hospital counts, bed capacity, type, and status breakdowns.")
    public ResponseEntity<HospitalStatisticsResponse> getHospitalStatistics() {
        return ResponseEntity.ok(analyticsService.getHospitalStatistics());
    }

    @GetMapping("/campaign-statistics")
    @Operation(summary = "Get campaign statistics", description = "Returns campaign status, reach, progress, and type breakdowns.")
    public ResponseEntity<CampaignStatisticsResponse> getCampaignStatistics() {
        return ResponseEntity.ok(analyticsService.getCampaignStatistics());
    }

    @GetMapping("/reports/monthly")
    @Operation(summary = "Get monthly report analytics")
    public ResponseEntity<ReportAnalyticsResponse> getMonthlyReport() {
        return ResponseEntity.ok(analyticsService.getMonthlyReport());
    }

    @GetMapping("/reports/weekly")
    @Operation(summary = "Get weekly report analytics")
    public ResponseEntity<ReportAnalyticsResponse> getWeeklyReport() {
        return ResponseEntity.ok(analyticsService.getWeeklyReport());
    }

    @GetMapping("/reports/daily")
    @Operation(summary = "Get daily report analytics")
    public ResponseEntity<ReportAnalyticsResponse> getDailyReport() {
        return ResponseEntity.ok(analyticsService.getDailyReport());
    }
}
