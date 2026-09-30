package com.healthguard.community.controller;

import com.healthguard.community.dto.ApiResponse;
import com.healthguard.community.dto.ReferralDetailsDTO;
import com.healthguard.community.dto.ReferralStatisticsDTO;
import com.healthguard.community.dto.ReferralVerificationRequest;
import com.healthguard.community.entity.DiseaseReport;
import com.healthguard.community.entity.HomeVisit;
import com.healthguard.community.entity.OutbreakAlert;
import com.healthguard.community.entity.PHC;
import com.healthguard.community.entity.PhcAlert;
import com.healthguard.community.entity.ReferralEntity;
import com.healthguard.community.repository.*;
import com.healthguard.community.service.ReferralVerificationService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
@Slf4j
public class OfficerController {

    private final DiseaseReportRepository diseaseReportRepository;
    private final OutbreakAlertRepository outbreakAlertRepository;
    private final HomeVisitRepository homeVisitRepository;
    private final ASHAWorkerRepository ashaWorkerRepository;
    private final PHCRepository phcRepository;
    private final PhcAlertRepository phcAlertRepository;
    private final ReferralVerificationService referralVerificationService;
    private final JdbcTemplate jdbcTemplate;

    @GetMapping("/api/officer/dashboard")
    public ResponseEntity<?> getOfficerDashboard() {
        Map<String, Object> data = new HashMap<>();

        long totalCitizens = 0;
        long totalFamilies = 0;
        try {
            Long cCount = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM citizens", Long.class);
            totalCitizens = cCount != null ? cCount : 0;
        } catch (Exception ignored) {}

        try {
            Long fCount = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM families", Long.class);
            totalFamilies = fCount != null ? fCount : 0;
        } catch (Exception ignored) {}

        long totalAshaWorkers = ashaWorkerRepository.count();
        long totalPhcs = phcRepository.count();

        List<DiseaseReport> reports = diseaseReportRepository.findAll();
        long totalReports = reports.size();
        long pendingCases = reports.stream().filter(r -> "PENDING_REVIEW".equalsIgnoreCase(r.getStatus()) || "Pending Review".equalsIgnoreCase(r.getStatus())).count();
        long highRiskCases = reports.stream().filter(r -> "High".equalsIgnoreCase(r.getSeverity()) || "Critical".equalsIgnoreCase(r.getSeverity())).count();
        long todaysReports = reports.stream().filter(r -> r.getReportDate() != null && r.getReportDate().equals(LocalDate.now())).count();

        List<OutbreakAlert> outbreaks = outbreakAlertRepository.findAll();
        long activeOutbreaks = outbreaks.stream().filter(o -> "ACTIVE".equalsIgnoreCase(o.getStatus())).count();

        long totalVisits = homeVisitRepository.count();
        long completedVaccinations = homeVisitRepository.countCompletedVaccinations();
        long missedVaccinations = homeVisitRepository.countMissedVaccinations();
        int vaccinationCoverage = totalVisits > 0 ? (int) Math.round(((double) completedVaccinations / totalVisits) * 100) : 0;

        data.put("totalRegisteredCitizensInDistrict", totalCitizens);
        data.put("totalFamiliesInDistrict", totalFamilies);
        data.put("totalAshaWorkersInDistrict", totalAshaWorkers);
        data.put("totalPhcsInDistrict", totalPhcs);
        data.put("totalDiseaseReports", totalReports);
        data.put("pendingCases", pendingCases);
        data.put("highRiskPatientsCount", highRiskCases);
        data.put("todaysReportsCount", todaysReports);
        data.put("activeOutbreaks", activeOutbreaks);
        data.put("vaccinationCoverage", vaccinationCoverage);
        data.put("missedVaccinations", missedVaccinations);

        return ResponseEntity.ok(ApiResponse.success("Officer dashboard retrieved", data));
    }


    @GetMapping("/api/officer/outbreak-prediction")
    public ResponseEntity<?> getOutbreakPrediction() {
        List<DiseaseReport> reports = diseaseReportRepository.findAll().stream()
                .filter(r -> "VERIFIED".equalsIgnoreCase(r.getStatus()) || "ESCALATED".equalsIgnoreCase(r.getStatus()))
                .collect(Collectors.toList());
        Map<String, List<DiseaseReport>> grouped = reports.stream()
                .filter(r -> r.getDisease() != null)
                .collect(Collectors.groupingBy(DiseaseReport::getDisease));

        List<Map<String, Object>> predictions = new ArrayList<>();
        LocalDate twoWeeksAgo = LocalDate.now().minusDays(14);

        grouped.forEach((disease, reportList) -> {
            long recentCases = reportList.stream().filter(r -> r.getReportDate() != null && !r.getReportDate().isBefore(twoWeeksAgo)).count();
            long olderCases = reportList.stream().filter(r -> r.getReportDate() != null && r.getReportDate().isBefore(twoWeeksAgo)).count();

            String direction = recentCases > olderCases ? "rising" : (recentCases < olderCases ? "falling" : "steady");
            long projected = Math.max(0, recentCases + (recentCases - olderCases));

            Map<String, Object> p = new HashMap<>();
            p.put("disease", disease);
            p.put("currentCases", recentCases);
            p.put("projectedCases2Weeks", projected);
            p.put("direction", direction);
            predictions.add(p);
        });

        return ResponseEntity.ok(ApiResponse.success("Outbreak predictions retrieved", predictions));
    }

    @GetMapping("/api/officer/campaign-analytics")
    public ResponseEntity<?> getCampaignAnalytics() {
        List<Map<String, Object>> campaigns = new ArrayList<>();
        try {
            campaigns = jdbcTemplate.queryForList("SELECT id, title, type, status, progress, reach FROM campaigns");
        } catch (Exception ignored) {}

        return ResponseEntity.ok(ApiResponse.success("Campaign analytics retrieved", campaigns));
    }

    @GetMapping({"/api/officer/campaigns", "/api/campaigns"})
    public ResponseEntity<?> getOfficerCampaigns() {
        List<Map<String, Object>> campaigns = new ArrayList<>();
        try {
            campaigns = jdbcTemplate.queryForList(
                "SELECT id, " +
                "  title AS \"campaignName\", " +
                "  title AS \"title\", " +
                "  type AS \"campaignType\", " +
                "  type AS \"type\", " +
                "  description, " +
                "  village_name AS \"villageName\", " +
                "  village_name AS \"village\", " +
                "  district, " +
                "  status, " +
                "  COALESCE(progress, 0) AS \"progressPercentage\", " +
                "  COALESCE(progress, 0) AS \"progress\", " +
                "  start_date AS \"startDate\", " +
                "  end_date AS \"endDate\", " +
                "  reach AS \"peopleReached\", " +
                "  reach AS \"reach\", " +
                "  created_at AS \"createdAt\" " +
                "FROM campaigns " +
                "ORDER BY id ASC"
            );
        } catch (Exception e) {
            log.warn("Failed to query campaigns table directly: {}", e.getMessage());
        }

        return ResponseEntity.ok(ApiResponse.success("Campaign records retrieved successfully", campaigns));
    }

    @GetMapping("/api/officer/medicine-demand")
    public ResponseEntity<?> getMedicineDemandPrediction() {
        List<Map<String, Object>> demand = new ArrayList<>();
        try {
            demand = jdbcTemplate.queryForList(
                "SELECT DISTINCT ON (medicine_name) " +
                "  id, medicine_id AS \"medicineId\", medicine_name AS \"medicineName\", " +
                "  current_stock AS \"currentStock\", predicted_demand AS \"predictedDemand\", " +
                "  confidence, risk_level AS \"riskLevel\", risk_level AS \"status\", " +
                "  recommended_order AS \"recommendedOrder\", " +
                "  estimated_days_of_stock_remaining AS \"estimatedDaysOfStockRemaining\", " +
                "  insights, top_factors_json AS \"topFactorsJson\", " +
                "  model_version AS \"modelVersion\", generated_at AS \"generatedAt\" " +
                "FROM medicine_demand_forecasts " +
                "ORDER BY medicine_name, generated_at DESC"
            );
        } catch (Exception e) {
            // Fallback query if table is empty
            try {
                demand = jdbcTemplate.queryForList(
                    "SELECT id, name AS \"medicineName\", quantity AS \"currentStock\", " +
                    "  (quantity * 2) AS \"predictedDemand\", 0.90 AS confidence, " +
                    "  'HIGH' AS \"riskLevel\", 'HIGH' AS status " +
                    "FROM medicines"
                );
            } catch (Exception ignored) {}
        }

        return ResponseEntity.ok(ApiResponse.success("Medicine demand prediction retrieved", demand));
    }

    @GetMapping("/api/officer/outbreak-predictions")
    public ResponseEntity<?> getOfficerOutbreakPredictions() {
        List<Map<String, Object>> outbreaks = new ArrayList<>();
        try {
            outbreaks = jdbcTemplate.queryForList(
                "SELECT id, disease, village, risk_score AS \"riskScore\", risk_level AS \"riskLevel\", " +
                "  cases_predicted AS \"casesPredicted\", confidence, prediction_date AS \"predictionDate\" " +
                "FROM outbreak_predictions " +
                "ORDER BY risk_score DESC, cases_predicted DESC " +
                "LIMIT 20"
            );
        } catch (Exception ignored) {}
        return ResponseEntity.ok(ApiResponse.success("Outbreak risk predictions retrieved", outbreaks));
    }

    @GetMapping("/api/officer/model-metrics")
    public ResponseEntity<?> getOfficerModelMetrics() {
        List<Map<String, Object>> metrics = new ArrayList<>();
        try {
            metrics = jdbcTemplate.queryForList(
                "SELECT id, model_name AS \"modelName\", model_version AS \"modelVersion\", " +
                "  champion_model_name AS \"championModelName\", champion_model_version AS \"championModelVersion\", " +
                "  mae, rmse, mape, r2_score AS \"r2Score\", is_champion AS \"isChampion\", " +
                "  training_samples AS \"trainingSamples\", date_range_days AS \"dateRangeDays\", " +
                "  status, trained_at AS \"trainedAt\" " +
                "FROM ml_model_metrics " +
                "ORDER BY trained_at DESC LIMIT 10"
            );
        } catch (Exception ignored) {}
        return ResponseEntity.ok(ApiResponse.success("ML model metrics retrieved", metrics));
    }

    @GetMapping("/api/officer/anomalies")
    public ResponseEntity<?> getOfficerAnomalies() {
        List<Map<String, Object>> anomalies = new ArrayList<>();
        try {
            anomalies = jdbcTemplate.queryForList(
                "SELECT id, medicine_id AS \"medicineId\", medicine_name AS \"medicineName\", " +
                "  anomaly_score AS \"anomalyScore\", severity, description, created_at AS \"createdAt\" " +
                "FROM demand_anomaly_alerts " +
                "ORDER BY created_at DESC LIMIT 15"
            );
        } catch (Exception ignored) {}
        return ResponseEntity.ok(ApiResponse.success("Demand anomaly alerts retrieved", anomalies));
    }

    @GetMapping("/api/officer/phcs")
    public ResponseEntity<?> getOfficerPhcs() {
        return ResponseEntity.ok(ApiResponse.success("PHCs retrieved", phcRepository.findAll()));
    }

    @GetMapping({"/api/officer/villages", "/api/admin/villages"})
    public ResponseEntity<?> getOfficerVillages() {
        List<Map<String, Object>> villages = new ArrayList<>();
        try {
            List<String> villageNames = jdbcTemplate.queryForList(
                "SELECT DISTINCT village FROM (" +
                "  SELECT village FROM disease_surveillance_reports WHERE village IS NOT NULL " +
                "  UNION SELECT village FROM home_visits WHERE village IS NOT NULL " +
                "  UNION SELECT village FROM phcs WHERE village IS NOT NULL " +
                ") v", String.class);

            long idx = 1;
            for (String vName : villageNames) {
                if (vName != null && !vName.trim().isEmpty()) {
                    Map<String, Object> v = new HashMap<>();
                    v.put("id", idx++);
                    v.put("name", vName);
                    v.put("district", "Coimbatore");
                    v.put("population", 5000);
                    villages.add(v);
                }
            }
        } catch (Exception ignored) {}

        return ResponseEntity.ok(ApiResponse.success("Villages retrieved", villages));
    }

    @GetMapping("/api/officer/disease-monitoring")
    public ResponseEntity<?> getOfficerDiseaseMonitoring() {
        List<DiseaseReport> reports = diseaseReportRepository.findAll().stream()
                .filter(r -> "VERIFIED".equalsIgnoreCase(r.getStatus()) || "ESCALATED".equalsIgnoreCase(r.getStatus()))
                .collect(Collectors.toList());
        Map<String, Long> grouped = reports.stream()
                .filter(r -> r.getDisease() != null)
                .collect(Collectors.groupingBy(DiseaseReport::getDisease, Collectors.counting()));

        List<Map<String, Object>> list = new ArrayList<>();
        grouped.forEach((disease, count) -> {
            Map<String, Object> item = new HashMap<>();
            item.put("name", disease);
            item.put("activeCases", count);
            item.put("trend", "Active");
            list.add(item);
        });

        return ResponseEntity.ok(ApiResponse.success("Disease monitoring retrieved", list));
    }

    @GetMapping("/api/officer/asha-workers")
    public ResponseEntity<?> getOfficerAshaWorkers() {
        return ResponseEntity.ok(ApiResponse.success("ASHA workers retrieved", ashaWorkerRepository.findAll()));
    }

    @PostMapping("/api/officer/reports/{id}/escalate")
    public ResponseEntity<?> escalateReport(
            @PathVariable("id") Long id,
            @RequestHeader(value = "X-User-Name", required = false) String headerUserName,
            @RequestHeader(value = "X-User-Email", required = false) String headerUserEmail
    ) {
        Optional<DiseaseReport> opt = diseaseReportRepository.findById(id);
        if (opt.isEmpty()) {
            return ResponseEntity.status(404).body(ApiResponse.error("Disease report not found with ID: " + id));
        }

        DiseaseReport report = opt.get();
        String currentStatus = report.getStatus() != null ? report.getStatus().trim().toUpperCase() : "PENDING_REVIEW";
        if ("VERIFIED".equals(currentStatus) || "ESCALATED".equals(currentStatus) || "REJECTED".equals(currentStatus)) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(ApiResponse.error("Report #" + id + " has already been reviewed (" + currentStatus + ") and is locked."));
        }

        List<PHC> phcs = phcRepository.findAll();
        if (phcs.isEmpty()) {
            return ResponseEntity.status(500).body(ApiResponse.error("No PHC available in database for escalation."));
        }

        PHC assignedPhc = phcs.stream()
                .filter(p -> p.getDistrict() != null && report.getVillage() != null && p.getDistrict().equalsIgnoreCase(report.getVillage()))
                .findFirst()
                .orElse(phcs.get(0));

        String officerName = "Health Officer";
        if (headerUserName != null && !headerUserName.isBlank()) {
            officerName = headerUserName;
        } else if (headerUserEmail != null && !headerUserEmail.isBlank()) {
            officerName = headerUserEmail;
        }

        LocalDateTime now = LocalDateTime.now();
        report.setStatus("ESCALATED");
        report.setReviewedBy(officerName);
        report.setReviewedAt(now);
        report.setReferralStatus("ALERT_SENT");
        report.setEscalatedAt(now);
        report.setReferredPhc(assignedPhc.getName());
        report.setDateModified(now);
        diseaseReportRepository.save(report);

        String patientName = report.getAffectedPersonName() != null && !report.getAffectedPersonName().isBlank()
                ? report.getAffectedPersonName()
                : report.getCitizenName();

        PhcAlert alert = PhcAlert.builder()
                .reportId(report.getReportId())
                .phcName(assignedPhc.getName())
                .citizenName(patientName)
                .disease(report.getDisease())
                .severity(report.getSeverity())
                .village(report.getVillage())
                .reviewedBy(officerName)
                .healthOfficerNotes(report.getHealthOfficerNotes())
                .escalatedAt(now)
                .ashaWorkerId(report.getAshaWorkerId())
                .status("ALERT_SENT")
                .createdAt(now)
                .build();
        phcAlertRepository.save(alert);

        try {
            jdbcTemplate.update(
                "INSERT INTO notifications (user_id, title, message, type, priority, is_read, created_at) " +
                "VALUES (1, 'PHC Alert Generated', ?, 'HEALTH_ALERT', 'HIGH', false, CURRENT_TIMESTAMP)",
                "Critical case escalated successfully.\nCitizen: " + report.getCitizenName() +
                "\nDisease: " + report.getDisease() +
                "\nAssigned PHC: " + assignedPhc.getName() +
                "\nStatus: ALERT_SENT"
            );
        } catch (Exception e) {
            System.err.println("Notification insert log: " + e.getMessage());
        }

        Map<String, Object> resp = new HashMap<>();
        resp.put("success", true);
        resp.put("reportId", report.getReportId());
        resp.put("assignedPhc", assignedPhc.getName());
        resp.put("referralStatus", "ALERT_SENT");

        return ResponseEntity.ok(resp);
    }

    @GetMapping("/api/officer/phc-alerts")
    public ResponseEntity<?> getPhcAlerts() {
        List<PhcAlert> alerts = phcAlertRepository.findAllByOrderByCreatedAtDesc();
        return ResponseEntity.ok(alerts);
    }

    @GetMapping("/api/officer/referral-stats")
    public ResponseEntity<?> getReferralStats() {
        long totalEscalatedCases = phcAlertRepository.count();
        long alertSent = phcAlertRepository.countByStatus("ALERT_SENT");
        long acknowledged = phcAlertRepository.countByStatus("ACKNOWLEDGED");
        long inTreatment = phcAlertRepository.countByStatus("IN_TREATMENT");
        long closed = phcAlertRepository.countByStatus("CLOSED");

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalEscalatedCases", totalEscalatedCases);
        stats.put("alertSent", alertSent);
        stats.put("acknowledged", acknowledged);
        stats.put("inTreatment", inTreatment);
        stats.put("closed", closed);

        return ResponseEntity.ok(ApiResponse.success("Referral statistics retrieved", stats));
    }

    @Data
    public static class UpdateReferralStatusRequest {
        private String status;
    }

    @PutMapping("/api/officer/referrals/{id}/status")
    public ResponseEntity<?> updateReferralStatus(@PathVariable("id") Long id, @RequestBody UpdateReferralStatusRequest req) {
        Optional<PhcAlert> alertOpt = phcAlertRepository.findById(id);
        if (alertOpt.isEmpty()) {
            return ResponseEntity.status(404).body(ApiResponse.error("PHC alert not found with ID: " + id));
        }

        PhcAlert alert = alertOpt.get();
        String newStatus = req.getStatus();
        if (newStatus == null || newStatus.isBlank()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Status is required."));
        }

        alert.setStatus(newStatus);
        phcAlertRepository.save(alert);

        if (alert.getReportId() != null) {
            Optional<DiseaseReport> reportOpt = diseaseReportRepository.findById(alert.getReportId());
            if (reportOpt.isPresent()) {
                DiseaseReport report = reportOpt.get();
                report.setReferralStatus(newStatus);
                report.setDateModified(LocalDateTime.now());
                if ("CLOSED".equalsIgnoreCase(newStatus) || "RESOLVED".equalsIgnoreCase(newStatus)) {
                    report.setStatus("Resolved");
                    report.setResolutionDate(LocalDateTime.now());
                }
                diseaseReportRepository.save(report);
            }
        }

        return ResponseEntity.ok(ApiResponse.success("Referral status updated to: " + newStatus, alert));
    }

    // =========================================================================
    // HEALTH OFFICER PHC REFERRAL VERIFICATION & WORKFLOW APIS
    // =========================================================================

    @GetMapping("/api/officer/referrals")
    public ResponseEntity<?> getReferrals(
            @RequestParam(value = "status", required = false) String status,
            @RequestParam(value = "village", required = false) String village,
            @RequestParam(value = "disease", required = false) String disease,
            @RequestParam(value = "severity", required = false) String severity,
            @RequestParam(value = "search", required = false) String search,
            @RequestHeader(value = "X-User-Role", required = false) String userRole
    ) {
        if (isPharmacist(userRole)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("Access Denied: Pharmacists are not authorized to view referrals."));
        }
        List<ReferralEntity> list = referralVerificationService.getAllReferrals(status, village, disease, severity, search);
        return ResponseEntity.ok(ApiResponse.success("Referrals retrieved successfully", list));
    }

    @GetMapping("/api/officer/referrals/{id}")
    public ResponseEntity<?> getReferralById(
            @PathVariable("id") Long id,
            @RequestHeader(value = "X-User-Role", required = false) String userRole
    ) {
        if (isPharmacist(userRole)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("Access Denied: Pharmacists are not authorized to view referrals."));
        }
        try {
            ReferralDetailsDTO details = referralVerificationService.getReferralById(id);
            return ResponseEntity.ok(ApiResponse.success("Referral details retrieved successfully", details));
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error(e.getMessage()));
        }
    }

    @PutMapping("/api/officer/referrals/{id}/approve")
    public ResponseEntity<?> approveReferral(
            @PathVariable("id") Long id,
            @RequestBody(required = false) ReferralVerificationRequest req,
            @RequestHeader(value = "X-User-Role", required = false) String userRole,
            @RequestHeader(value = "X-User-Email", required = false) String userEmail
    ) {
        if (isPharmacist(userRole)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("Access Denied: Pharmacists are not authorized to approve referrals."));
        }
        String remarks = (req != null) ? req.getRemarks() : null;
        String officerName = (req != null && req.getVerifiedBy() != null && !req.getVerifiedBy().isBlank())
                ? req.getVerifiedBy()
                : (userEmail != null && !userEmail.isBlank() ? userEmail : "Dr. Health Officer");

        try {
            ReferralDetailsDTO approved = referralVerificationService.approveReferral(id, officerName, remarks);
            return ResponseEntity.ok(ApiResponse.success("Referral approved successfully", approved));
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error(e.getMessage()));
        }
    }

    @PutMapping("/api/officer/referrals/{id}/reject")
    public ResponseEntity<?> rejectReferral(
            @PathVariable("id") Long id,
            @RequestBody(required = false) ReferralVerificationRequest req,
            @RequestHeader(value = "X-User-Role", required = false) String userRole,
            @RequestHeader(value = "X-User-Email", required = false) String userEmail
    ) {
        if (isPharmacist(userRole)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("Access Denied: Pharmacists are not authorized to reject referrals."));
        }
        if (req == null || req.getRemarks() == null || req.getRemarks().trim().isBlank()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Verification remarks are required when rejecting a referral."));
        }
        String officerName = (req.getVerifiedBy() != null && !req.getVerifiedBy().isBlank())
                ? req.getVerifiedBy()
                : (userEmail != null && !userEmail.isBlank() ? userEmail : "Dr. Health Officer");

        try {
            ReferralDetailsDTO rejected = referralVerificationService.rejectReferral(id, officerName, req.getRemarks());
            return ResponseEntity.ok(ApiResponse.success("Referral rejected successfully", rejected));
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error(e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ApiResponse.error(e.getMessage()));
        }
    }

    @PutMapping("/api/officer/referrals/{id}/review")
    public ResponseEntity<?> setUnderReview(
            @PathVariable("id") Long id,
            @RequestBody(required = false) ReferralVerificationRequest req,
            @RequestHeader(value = "X-User-Role", required = false) String userRole,
            @RequestHeader(value = "X-User-Email", required = false) String userEmail
    ) {
        if (isPharmacist(userRole)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("Access Denied: Pharmacists are not authorized to review referrals."));
        }
        String remarks = (req != null) ? req.getRemarks() : null;
        String officerName = (req != null && req.getVerifiedBy() != null && !req.getVerifiedBy().isBlank())
                ? req.getVerifiedBy()
                : (userEmail != null && !userEmail.isBlank() ? userEmail : "Dr. Health Officer");

        try {
            ReferralDetailsDTO underReview = referralVerificationService.setUnderReview(id, officerName, remarks);
            return ResponseEntity.ok(ApiResponse.success("Referral status set to UNDER_REVIEW", underReview));
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/api/officer/referrals/statistics")
    public ResponseEntity<?> getReferralStatistics(
            @RequestHeader(value = "X-User-Role", required = false) String userRole
    ) {
        if (isPharmacist(userRole)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("Access Denied: Pharmacists are not authorized to view referral statistics."));
        }
        ReferralStatisticsDTO stats = referralVerificationService.getStatistics();
        return ResponseEntity.ok(ApiResponse.success("Referral statistics retrieved successfully", stats));
    }

    private boolean isPharmacist(String role) {
        if (role == null) return false;
        String clean = role.replace("ROLE_", "").trim();
        return "PHARMACIST".equalsIgnoreCase(clean);
    }
}
