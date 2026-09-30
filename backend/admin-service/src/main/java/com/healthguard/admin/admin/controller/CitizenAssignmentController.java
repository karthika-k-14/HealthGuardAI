package com.healthguard.admin.admin.controller;

import com.healthguard.admin.service.AuditLogService;
import com.healthguard.admin.service.CitizenAssignmentService;
import com.healthguard.admin.util.ApiResponse;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@CrossOrigin(origins = "*")
public class CitizenAssignmentController {

    private final AuditLogService auditLogService;
    private final CitizenAssignmentService citizenAssignmentService;
    private final com.healthguard.admin.ashaworker.repository.AshaWorkerRepository ashaWorkerRepository;

    public CitizenAssignmentController(
            AuditLogService auditLogService,
            CitizenAssignmentService citizenAssignmentService,
            com.healthguard.admin.ashaworker.repository.AshaWorkerRepository ashaWorkerRepository) {
        this.auditLogService = auditLogService;
        this.citizenAssignmentService = citizenAssignmentService;
        this.ashaWorkerRepository = ashaWorkerRepository;
    }

    private static final Map<Long, Map<String, Object>> CITIZENS = new ConcurrentHashMap<>();
    private static final Map<Long, Map<String, Object>> ASHA_WORKERS = new ConcurrentHashMap<>();

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AssignmentRequest {
        private Object citizenId;
        private Object ashaWorkerId;
        private Long assignedByAdminId;
        private String userRole;
        private String citizenName;
        private String ashaWorkerName;
        private String village;

        public Long getCitizenId() {
            if (citizenId == null) return null;
            if (citizenId instanceof Number) return ((Number) citizenId).longValue();
            try {
                return Long.parseLong(citizenId.toString().trim());
            } catch (Exception e) {
                return (long) Math.abs(citizenId.toString().hashCode());
            }
        }

        public Long getAshaWorkerId() {
            if (ashaWorkerId == null) return null;
            if (ashaWorkerId instanceof Number) return ((Number) ashaWorkerId).longValue();
            try {
                return Long.parseLong(ashaWorkerId.toString().trim());
            } catch (Exception e) {
                return (long) Math.abs(ashaWorkerId.toString().hashCode());
            }
        }
    }

    // Supports GET /api/citizens and GET /api/admin/citizens
    @GetMapping({"/api/citizens", "/api/admin/citizens"})
    public ResponseEntity<?> getRegisteredCitizens() {
        List<Map<String, Object>> list = new ArrayList<>(CITIZENS.values());
        return ResponseEntity.ok(ApiResponse.success("Registered citizens retrieved successfully", list));
    }

    // Supports GET /api/asha-workers and GET /api/admin/asha-workers
    @GetMapping({"/api/asha-workers", "/api/admin/asha-workers"})
    public ResponseEntity<?> getAshaWorkers() {
        List<Map<String, Object>> list = new ArrayList<>();
        if (ashaWorkerRepository != null) {
            for (com.healthguard.admin.ashaworker.entity.AshaWorker w : ashaWorkerRepository.findAll()) {
                if (!"DELETED".equalsIgnoreCase(w.getStatus())) {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", w.getId());
                    map.put("workerId", w.getWorkerId());
                    map.put("name", w.getFullName());
                    map.put("fullName", w.getFullName());
                    map.put("phone", w.getMobileNumber());
                    map.put("mobileNumber", w.getMobileNumber());
                    map.put("email", w.getEmail());
                    map.put("district", w.getDistrict());
                    map.put("village", w.getVillage());
                    map.put("assignedPHC", w.getAssignedPHC());
                    map.put("status", w.getStatus());
                    list.add(map);
                }
            }
        }
        if (list.isEmpty()) {
            list = new ArrayList<>(ASHA_WORKERS.values());
        }
        return ResponseEntity.ok(ApiResponse.success("ASHA workers retrieved successfully", list));
    }

    // Supports GET /api/citizen-assignments, GET /api/admin/assignments, GET /api/admin/citizen-assignments
    @GetMapping({"/api/citizen-assignments", "/api/admin/assignments", "/api/admin/citizen-assignments"})
    public ResponseEntity<?> getAllAssignments() {
        List<Map<String, Object>> list = citizenAssignmentService.getAllAssignments();
        return ResponseEntity.ok(ApiResponse.success("Citizen assignments retrieved successfully", list));
    }

    // Supports POST /api/citizen-assignments, POST /api/admin/assignments, POST /api/admin/citizen-assignments
    @PostMapping({"/api/citizen-assignments", "/api/admin/assignments", "/api/admin/citizen-assignments"})
    public ResponseEntity<?> createAssignment(
            @RequestBody AssignmentRequest req,
            @RequestHeader(value = "X-User-Role", required = false) String roleHeader
    ) {
        String role = req.getUserRole() != null ? req.getUserRole() : roleHeader;
        if ("ASHA".equalsIgnoreCase(role) || "ASHA_WORKER".equalsIgnoreCase(role)) {
            auditLogService.logAction("UNAUTHORIZED_ACCESS_ATTEMPT", "SECURITY", "Blocked ASHA worker from citizen assignment");
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("SECURITY VIOLATION: ASHA workers are not permitted to assign citizens. Only Admin or Health Officer can perform assignments."));
        }

        if (req.getCitizenId() == null || req.getAshaWorkerId() == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Both citizenId and ashaWorkerId are required for assignment."));
        }

        String cName = req.getCitizenName();
        if (cName == null || cName.trim().isEmpty()) {
            Map<String, Object> citizen = CITIZENS.get(req.getCitizenId());
            cName = citizen != null ? (String) citizen.get("name") : "Citizen #" + req.getCitizenId();
        }

        String aName = req.getAshaWorkerName();
        if (aName == null || aName.trim().isEmpty()) {
            if (req.getAshaWorkerId() != null && ashaWorkerRepository != null) {
                ashaWorkerRepository.findById(req.getAshaWorkerId()).ifPresent(w -> req.setAshaWorkerName(w.getFullName()));
            }
            aName = req.getAshaWorkerName();
            if (aName == null || aName.trim().isEmpty()) {
                Map<String, Object> asha = ASHA_WORKERS.get(req.getAshaWorkerId());
                aName = asha != null ? (String) asha.get("name") : "ASHA #" + req.getAshaWorkerId();
            }
        }

        String village = req.getVillage();
        if (village == null || village.trim().isEmpty()) {
            Map<String, Object> citizen = CITIZENS.get(req.getCitizenId());
            village = citizen != null ? (String) citizen.get("village") : "Assigned Village";
        }

        Long adminId = req.getAssignedByAdminId();
        if (adminId == null) {
            adminId = 1L;
        }

        Map<String, Object> result = citizenAssignmentService.createAssignment(
                req.getCitizenId(),
                req.getAshaWorkerId(),
                adminId,
                cName,
                aName,
                village
        );

        auditLogService.logAction("ASHA_WORKER_ASSIGNED", "HEALTH_OFFICER", "Assigned citizen " + cName + " (ID: " + req.getCitizenId() + ") to ASHA worker " + aName + " (ID: " + req.getAshaWorkerId() + ")");
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Citizen successfully assigned to ASHA worker", result));
    }

    // Supports PUT /api/citizen-assignments/{id}, PUT /api/admin/assignments/{id}, PUT /api/admin/citizen-assignments/{id}
    @PutMapping({"/api/citizen-assignments/{id}", "/api/admin/assignments/{id}", "/api/admin/citizen-assignments/{id}"})
    public ResponseEntity<?> reassignCitizen(@PathVariable("id") Long id, @RequestBody AssignmentRequest req) {
        String aName = req.getAshaWorkerName();
        if ((aName == null || aName.trim().isEmpty()) && req.getAshaWorkerId() != null) {
            Map<String, Object> asha = ASHA_WORKERS.get(req.getAshaWorkerId());
            if (asha != null) aName = (String) asha.get("name");
        }

        Map<String, Object> result = citizenAssignmentService.reassignCitizen(id, req.getAshaWorkerId(), aName);
        if (result == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Assignment record not found for ID: " + id));
        }

        return ResponseEntity.ok(ApiResponse.success("Citizen reassigned successfully", result));
    }

    // Supports DELETE /api/citizen-assignments/{id}, DELETE /api/admin/assignments/{id}, DELETE /api/admin/citizen-assignments/{id}
    @DeleteMapping({"/api/citizen-assignments/{id}", "/api/admin/assignments/{id}", "/api/admin/citizen-assignments/{id}"})
    public ResponseEntity<?> removeAssignment(@PathVariable("id") Long id) {
        Map<String, Object> removed = citizenAssignmentService.removeAssignment(id);
        if (removed == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Assignment record not found for ID: " + id));
        }
        return ResponseEntity.ok(ApiResponse.success("Assignment removed successfully", removed));
    }

    // Supports GET /api/asha/assigned-citizens
    @GetMapping("/api/asha/assigned-citizens")
    public ResponseEntity<?> getAssignedCitizensForAsha(@RequestParam(value = "ashaId", defaultValue = "10") Long ashaId) {
        List<Map<String, Object>> assigned = citizenAssignmentService.getAssignedCitizensForAsha(ashaId);
        return ResponseEntity.ok(ApiResponse.success("Assigned citizens for ASHA worker retrieved", assigned));
    }
}
