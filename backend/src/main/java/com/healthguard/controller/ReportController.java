package com.healthguard.controller;

import com.healthguard.dto.CampaignReportResponse;
import com.healthguard.dto.CitizenReportResponse;
import com.healthguard.dto.DailyReportResponse;
import com.healthguard.dto.DiseaseReportResponse;
import com.healthguard.dto.HospitalReportResponse;
import com.healthguard.dto.MedicineReportResponse;
import com.healthguard.dto.MonthlyReportResponse;
import com.healthguard.dto.PhcReportResponse;
import com.healthguard.dto.ReportFilterRequest;
import com.healthguard.dto.WeeklyReportResponse;
import com.healthguard.dto.YearlyReportResponse;
import com.healthguard.service.ReportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * REST Controller exposing endpoints for system-wide, periodic, and domain-specific report generation.
 * All endpoints support filtering by Date, Village, PHC, Hospital, District, Health Officer, and ASHA Worker.
 */
@RestController
@RequestMapping("/reports")
@RequiredArgsConstructor
@Tag(name = "Reports", description = "Report Generation & Dynamic Multi-Criteria Analytics REST APIs")
public class ReportController {

    private final ReportService reportService;

    @GetMapping("/daily")
    @Operation(summary = "Get Daily Report", description = "Generates a daily activity and health summary report with optional multi-criteria filters.")
    public ResponseEntity<DailyReportResponse> getDailyReport(@ModelAttribute ReportFilterRequest filter) {
        return ResponseEntity.ok(reportService.getDailyReport(filter));
    }

    @GetMapping("/weekly")
    @Operation(summary = "Get Weekly Report", description = "Generates a weekly health operational report with optional multi-criteria filters.")
    public ResponseEntity<WeeklyReportResponse> getWeeklyReport(@ModelAttribute ReportFilterRequest filter) {
        return ResponseEntity.ok(reportService.getWeeklyReport(filter));
    }

    @GetMapping("/monthly")
    @Operation(summary = "Get Monthly Report", description = "Generates a monthly comprehensive health analytics report with optional multi-criteria filters.")
    public ResponseEntity<MonthlyReportResponse> getMonthlyReport(@ModelAttribute ReportFilterRequest filter) {
        return ResponseEntity.ok(reportService.getMonthlyReport(filter));
    }

    @GetMapping("/yearly")
    @Operation(summary = "Get Yearly Report", description = "Generates an annual performance report with monthly breakdowns and optional multi-criteria filters.")
    public ResponseEntity<YearlyReportResponse> getYearlyReport(@ModelAttribute ReportFilterRequest filter) {
        return ResponseEntity.ok(reportService.getYearlyReport(filter));
    }

    @GetMapping("/disease")
    @Operation(summary = "Get Disease Report", description = "Generates an epidemiological and chronic disease surveillance report.")
    public ResponseEntity<DiseaseReportResponse> getDiseaseReport(@ModelAttribute ReportFilterRequest filter) {
        return ResponseEntity.ok(reportService.getDiseaseReport(filter));
    }

    @GetMapping("/medicine")
    @Operation(summary = "Get Medicine Report", description = "Generates a pharmaceutical inventory, stock status, and prescription report.")
    public ResponseEntity<MedicineReportResponse> getMedicineReport(@ModelAttribute ReportFilterRequest filter) {
        return ResponseEntity.ok(reportService.getMedicineReport(filter));
    }

    @GetMapping("/citizen")
    @Operation(summary = "Get Citizen Report", description = "Generates a demographic, gender, age group, and population health report.")
    public ResponseEntity<CitizenReportResponse> getCitizenReport(@ModelAttribute ReportFilterRequest filter) {
        return ResponseEntity.ok(reportService.getCitizenReport(filter));
    }

    @GetMapping("/hospital")
    @Operation(summary = "Get Hospital Report", description = "Generates a hospital facility, bed capacity, and status report.")
    public ResponseEntity<HospitalReportResponse> getHospitalReport(@ModelAttribute ReportFilterRequest filter) {
        return ResponseEntity.ok(reportService.getHospitalReport(filter));
    }

    @GetMapping("/phc")
    @Operation(summary = "Get PHC Report", description = "Generates a Primary Health Centre distribution and staffing report.")
    public ResponseEntity<PhcReportResponse> getPhcReport(@ModelAttribute ReportFilterRequest filter) {
        return ResponseEntity.ok(reportService.getPhcReport(filter));
    }

    @GetMapping("/campaign")
    @Operation(summary = "Get Campaign Report", description = "Generates a public health campaign outreach, reach, and progress report.")
    public ResponseEntity<CampaignReportResponse> getCampaignReport(@ModelAttribute ReportFilterRequest filter) {
        return ResponseEntity.ok(reportService.getCampaignReport(filter));
    }
}
