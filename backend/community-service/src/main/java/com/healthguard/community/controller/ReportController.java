package com.healthguard.community.controller;

import com.healthguard.community.dto.ApiResponse;
import com.healthguard.community.dto.ReportResponseDTO;
import com.healthguard.community.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    @GetMapping({"/api/reports/daily", "/api/asha/reports/daily"})
    public ResponseEntity<?> getDailyReport(
            @RequestParam Map<String, String> filters,
            @RequestParam(value = "ashaWorkerId", required = false) Long ashaWorkerId,
            @RequestHeader(value = "X-User-Id", required = false) String headerUserId,
            @RequestHeader(value = "X-User-Email", required = false) String headerUserEmail,
            @RequestHeader(value = "X-User-Role", required = false) String headerUserRole) {
        ReportResponseDTO report = reportService.getDailyReport(filters, ashaWorkerId, headerUserId, headerUserEmail, headerUserRole);
        return ResponseEntity.ok(ApiResponse.success("Daily report generated successfully", report));
    }

    @GetMapping({"/api/reports/weekly", "/api/asha/reports/weekly"})
    public ResponseEntity<?> getWeeklyReport(
            @RequestParam Map<String, String> filters,
            @RequestParam(value = "ashaWorkerId", required = false) Long ashaWorkerId,
            @RequestHeader(value = "X-User-Id", required = false) String headerUserId,
            @RequestHeader(value = "X-User-Email", required = false) String headerUserEmail,
            @RequestHeader(value = "X-User-Role", required = false) String headerUserRole) {
        ReportResponseDTO report = reportService.getWeeklyReport(filters, ashaWorkerId, headerUserId, headerUserEmail, headerUserRole);
        return ResponseEntity.ok(ApiResponse.success("Weekly report generated successfully", report));
    }

    @GetMapping({"/api/reports/monthly", "/api/asha/reports/monthly"})
    public ResponseEntity<?> getMonthlyReport(
            @RequestParam Map<String, String> filters,
            @RequestParam(value = "ashaWorkerId", required = false) Long ashaWorkerId,
            @RequestHeader(value = "X-User-Id", required = false) String headerUserId,
            @RequestHeader(value = "X-User-Email", required = false) String headerUserEmail,
            @RequestHeader(value = "X-User-Role", required = false) String headerUserRole) {
        ReportResponseDTO report = reportService.getMonthlyReport(filters, ashaWorkerId, headerUserId, headerUserEmail, headerUserRole);
        return ResponseEntity.ok(ApiResponse.success("Monthly report generated successfully", report));
    }

    @GetMapping({"/api/reports/yearly", "/api/asha/reports/yearly"})
    public ResponseEntity<?> getYearlyReport(
            @RequestParam Map<String, String> filters,
            @RequestParam(value = "ashaWorkerId", required = false) Long ashaWorkerId,
            @RequestHeader(value = "X-User-Id", required = false) String headerUserId,
            @RequestHeader(value = "X-User-Email", required = false) String headerUserEmail,
            @RequestHeader(value = "X-User-Role", required = false) String headerUserRole) {
        ReportResponseDTO report = reportService.getYearlyReport(filters, ashaWorkerId, headerUserId, headerUserEmail, headerUserRole);
        return ResponseEntity.ok(ApiResponse.success("Yearly report generated successfully", report));
    }

    @GetMapping({"/api/reports/disease", "/api/asha/reports/disease"})
    public ResponseEntity<?> getDiseaseReport(
            @RequestParam Map<String, String> filters,
            @RequestParam(value = "ashaWorkerId", required = false) Long ashaWorkerId,
            @RequestHeader(value = "X-User-Id", required = false) String headerUserId,
            @RequestHeader(value = "X-User-Email", required = false) String headerUserEmail,
            @RequestHeader(value = "X-User-Role", required = false) String headerUserRole) {
        ReportResponseDTO report = reportService.getDiseaseReport(filters, ashaWorkerId, headerUserId, headerUserEmail, headerUserRole);
        return ResponseEntity.ok(ApiResponse.success("Disease report generated successfully", report));
    }

    @GetMapping({"/api/reports/citizen", "/api/reports/citizens", "/api/asha/reports/citizen"})
    public ResponseEntity<?> getCitizenReport(
            @RequestParam Map<String, String> filters,
            @RequestParam(value = "ashaWorkerId", required = false) Long ashaWorkerId,
            @RequestHeader(value = "X-User-Id", required = false) String headerUserId,
            @RequestHeader(value = "X-User-Email", required = false) String headerUserEmail,
            @RequestHeader(value = "X-User-Role", required = false) String headerUserRole) {
        ReportResponseDTO report = reportService.getCitizenReport(filters, ashaWorkerId, headerUserId, headerUserEmail, headerUserRole);
        return ResponseEntity.ok(ApiResponse.success("Citizen report generated successfully", report));
    }

    @GetMapping({"/api/reports/vaccination", "/api/reports/phc", "/api/asha/reports/vaccination"})
    public ResponseEntity<?> getVaccinationReport(
            @RequestParam Map<String, String> filters,
            @RequestParam(value = "ashaWorkerId", required = false) Long ashaWorkerId,
            @RequestHeader(value = "X-User-Id", required = false) String headerUserId,
            @RequestHeader(value = "X-User-Email", required = false) String headerUserEmail,
            @RequestHeader(value = "X-User-Role", required = false) String headerUserRole) {
        ReportResponseDTO report = reportService.getVaccinationReport(filters, ashaWorkerId, headerUserId, headerUserEmail, headerUserRole);
        return ResponseEntity.ok(ApiResponse.success("Vaccination & health report generated successfully", report));
    }

    @GetMapping({"/api/reports/home-visit", "/api/reports/visit", "/api/asha/reports/home-visit", "/api/asha/reports/visit"})
    public ResponseEntity<?> getHomeVisitReport(
            @RequestParam Map<String, String> filters,
            @RequestParam(value = "ashaWorkerId", required = false) Long ashaWorkerId,
            @RequestHeader(value = "X-User-Id", required = false) String headerUserId,
            @RequestHeader(value = "X-User-Email", required = false) String headerUserEmail,
            @RequestHeader(value = "X-User-Role", required = false) String headerUserRole) {
        ReportResponseDTO report = reportService.getHomeVisitReport(filters, ashaWorkerId, headerUserId, headerUserEmail, headerUserRole);
        return ResponseEntity.ok(ApiResponse.success("Home visit report generated successfully", report));
    }
}
