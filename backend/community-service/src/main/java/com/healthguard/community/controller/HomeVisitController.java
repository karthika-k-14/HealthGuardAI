package com.healthguard.community.controller;

import com.healthguard.community.dto.ApiResponse;
import com.healthguard.community.entity.HomeVisit;
import com.healthguard.community.repository.HomeVisitRepository;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.*;

@RestController
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class HomeVisitController {

    private final HomeVisitRepository homeVisitRepository;
    private final org.springframework.jdbc.core.JdbcTemplate jdbcTemplate;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ScheduleVisitRequest {
        private Long citizenId;
        private Long familyId;
        private Long ashaWorkerId;
        private String citizenName;
        private String village;
        private String visitType;
        private String visitDate;
        private String notes;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CompleteVisitRequest {
        private String observations;
        private String symptoms;
        private String bloodPressure;
        private Double weight;
        private Double temperature;
        private String recommendations;
        private Boolean followUpRequired;
        private String nextVisitDate;
        private String riskLevel;
        private String notes;

        private Boolean bpChecked;
        private Boolean immunizationVerified;
        private Boolean pregnancyFollowUp;
        private Boolean symptomsFound;
        private Boolean referralRequired;
    }

    @GetMapping("/api/asha/visits")
    public ResponseEntity<?> getAshaVisits(@RequestParam(value = "ashaWorkerId", required = false) Long ashaWorkerId) {
        Long targetAshaId = ashaWorkerId != null ? ashaWorkerId : 10L;
        List<HomeVisit> visits = homeVisitRepository.findByAshaWorkerId(targetAshaId);
        return ResponseEntity.ok(ApiResponse.success("Home visits retrieved successfully", visits));
    }

    @PostMapping("/api/asha/visits")
    public ResponseEntity<?> scheduleVisit(@RequestBody ScheduleVisitRequest req) {
        LocalDate visitDt = req.getVisitDate() != null ? LocalDate.parse(req.getVisitDate()) : LocalDate.now();

        HomeVisit visit = HomeVisit.builder()
                .citizenId(req.getCitizenId() != null ? req.getCitizenId() : 1L)
                .familyId(req.getFamilyId())
                .ashaWorkerId(req.getAshaWorkerId() != null ? req.getAshaWorkerId() : 10L)
                .citizenName(req.getCitizenName() != null ? req.getCitizenName() : "Assigned Citizen")
                .village(req.getVillage() != null ? req.getVillage() : "Coimbatore Village")
                .visitType(req.getVisitType() != null ? req.getVisitType() : "Routine Checkup")
                .visitDate(visitDt)
                .status("SCHEDULED")
                .riskLevel("Low")
                .notes(req.getNotes() != null ? req.getNotes() : "Scheduled home visit.")
                .build();

        HomeVisit saved = homeVisitRepository.save(visit);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Home visit scheduled successfully", saved));
    }

    @PostMapping("/api/asha/visits/{id}/complete")
    public ResponseEntity<?> completeVisit(@PathVariable("id") Long id, @RequestBody CompleteVisitRequest req) {
        Optional<HomeVisit> opt = homeVisitRepository.findById(id);
        if (opt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Home visit record not found for ID: " + id));
        }

        if (req.getObservations() == null || req.getObservations().trim().isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Health observations are required before completing a home visit."));
        }

        HomeVisit visit = opt.get();
        visit.setStatus("COMPLETED");
        visit.setObservations(req.getObservations().trim());
        if (req.getSymptoms() != null) visit.setSymptoms(req.getSymptoms());
        if (req.getBloodPressure() != null) visit.setBloodPressure(req.getBloodPressure());
        if (req.getWeight() != null) visit.setWeightKg(req.getWeight());
        if (req.getTemperature() != null) visit.setTemperatureF(req.getTemperature());
        if (req.getRecommendations() != null) visit.setRecommendations(req.getRecommendations());
        if (req.getNotes() != null) visit.setNotes(req.getNotes());

        String risk = req.getRiskLevel() != null ? req.getRiskLevel() : "Low";
        visit.setRiskLevel(risk);

        HomeVisit completedVisit = homeVisitRepository.save(visit);

        // Record medicine consumption in medicine_usage_history for demand tracking
        if (jdbcTemplate != null) {
            try {
                String text = ((req.getSymptoms() != null ? req.getSymptoms() : "") + " " +
                               (req.getRecommendations() != null ? req.getRecommendations() : "") + " " +
                               (req.getObservations() != null ? req.getObservations() : "")).toLowerCase();

                String targetMed = null;
                String disease = "General Health";
                int qty = 10;

                if (text.contains("fever") || text.contains("body pain") || text.contains("headache")) {
                    targetMed = "Paracetamol";
                    disease = "Viral Fever";
                    qty = 10;
                } else if (text.contains("diarrhea") || text.contains("vomiting") || text.contains("dehydration")) {
                    targetMed = "ORS";
                    disease = "Diarrhea";
                    qty = 5;
                } else if (text.contains("anemia") || text.contains("weakness") || text.contains("fatigue")) {
                    targetMed = "Iron Tablets";
                    disease = "Anemia";
                    qty = 30;
                } else if (text.contains("cough") || text.contains("cold") || text.contains("infection")) {
                    targetMed = "Amoxicillin";
                    disease = "Respiratory Infection";
                    qty = 10;
                }

                if (targetMed != null) {
                    List<Map<String, Object>> meds = jdbcTemplate.queryForList(
                        "SELECT id, medicine_name FROM medicines WHERE LOWER(medicine_name) = LOWER(?) LIMIT 1",
                        targetMed
                    );
                    Long medId = meds.isEmpty() ? null : ((Number) meds.get(0).get("id")).longValue();
                    String medName = meds.isEmpty() ? targetMed : (String) meds.get(0).get("medicine_name");

                    jdbcTemplate.update(
                        "INSERT INTO medicine_usage_history (medicine_id, medicine_name, quantity_used, disease, village, usage_date, created_at) " +
                        "VALUES (?, ?, ?, ?, ?, CURRENT_DATE, CURRENT_TIMESTAMP)",
                        medId, medName, qty, disease, visit.getVillage()
                    );
                    if (medId != null) {
                        jdbcTemplate.update("UPDATE medicines SET quantity = GREATEST(0, quantity - ?) WHERE id = ?", qty, medId);
                    }
                }
            } catch (Exception e) {
                System.err.println("Warning: failed to record usage in home visit: " + e.getMessage());
            }
        }

        HomeVisit followUpVisit = null;
        if (Boolean.TRUE.equals(req.getFollowUpRequired())) {
            LocalDate nextDt = req.getNextVisitDate() != null ? LocalDate.parse(req.getNextVisitDate()) : LocalDate.now().plusDays(7);
            HomeVisit followUp = HomeVisit.builder()
                    .citizenId(visit.getCitizenId())
                    .familyId(visit.getFamilyId())
                    .ashaWorkerId(visit.getAshaWorkerId())
                    .citizenName(visit.getCitizenName())
                    .village(visit.getVillage())
                    .visitType(visit.getVisitType() + " (Follow-up)")
                    .visitDate(nextDt)
                    .status("SCHEDULED")
                    .riskLevel(risk)
                    .notes("Automated follow-up created from completed visit #" + id)
                    .build();
            followUpVisit = homeVisitRepository.save(followUp);
        }

        Map<String, Object> responseData = new HashMap<>();
        responseData.put("completedVisit", completedVisit);
        responseData.put("followUpVisit", followUpVisit);

        return ResponseEntity.ok(ApiResponse.success("Home visit completed successfully", responseData));
    }

    @GetMapping("/api/asha/visits/statistics")
    public ResponseEntity<?> getVisitStatistics(@RequestParam(value = "ashaWorkerId", required = false) Long ashaWorkerId) {
        Long targetAshaId = ashaWorkerId != null ? ashaWorkerId : 10L;
        List<HomeVisit> myVisits = homeVisitRepository.findByAshaWorkerId(targetAshaId);

        int totalVisits = myVisits.size();
        long scheduledVisits = myVisits.stream().filter(v -> "SCHEDULED".equalsIgnoreCase(v.getStatus())).count();
        long completedVisits = myVisits.stream().filter(v -> "COMPLETED".equalsIgnoreCase(v.getStatus())).count();
        long missedVisits = myVisits.stream().filter(v -> "MISSED".equalsIgnoreCase(v.getStatus()) || ("SCHEDULED".equalsIgnoreCase(v.getStatus()) && v.getVisitDate().isBefore(LocalDate.now()))).count();

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalVisits", totalVisits);
        stats.put("scheduledVisits", scheduledVisits);
        stats.put("completedVisits", completedVisits);
        stats.put("missedVisits", missedVisits);

        return ResponseEntity.ok(ApiResponse.success("Visit statistics retrieved", stats));
    }

    @GetMapping("/api/officer/visits")
    public ResponseEntity<?> getHealthOfficerVisits() {
        List<HomeVisit> completedList = homeVisitRepository.findByStatus("COMPLETED");
        return ResponseEntity.ok(ApiResponse.success("All completed home visit reports retrieved for Health Officer", completedList));
    }
}
