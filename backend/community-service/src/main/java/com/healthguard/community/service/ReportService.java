package com.healthguard.community.service;

import com.healthguard.community.dto.ReportResponseDTO;

import java.util.Map;

public interface ReportService {
    ReportResponseDTO getDailyReport(Map<String, String> filters, Long ashaWorkerId, String headerUserId, String headerUserEmail, String headerUserRole);
    ReportResponseDTO getWeeklyReport(Map<String, String> filters, Long ashaWorkerId, String headerUserId, String headerUserEmail, String headerUserRole);
    ReportResponseDTO getMonthlyReport(Map<String, String> filters, Long ashaWorkerId, String headerUserId, String headerUserEmail, String headerUserRole);
    ReportResponseDTO getYearlyReport(Map<String, String> filters, Long ashaWorkerId, String headerUserId, String headerUserEmail, String headerUserRole);
    ReportResponseDTO getDiseaseReport(Map<String, String> filters, Long ashaWorkerId, String headerUserId, String headerUserEmail, String headerUserRole);
    ReportResponseDTO getCitizenReport(Map<String, String> filters, Long ashaWorkerId, String headerUserId, String headerUserEmail, String headerUserRole);
    ReportResponseDTO getVaccinationReport(Map<String, String> filters, Long ashaWorkerId, String headerUserId, String headerUserEmail, String headerUserRole);
    ReportResponseDTO getHomeVisitReport(Map<String, String> filters, Long ashaWorkerId, String headerUserId, String headerUserEmail, String headerUserRole);
}
