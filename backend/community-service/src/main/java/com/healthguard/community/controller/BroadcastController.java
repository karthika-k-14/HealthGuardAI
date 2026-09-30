package com.healthguard.community.controller;

import com.healthguard.community.dto.ApiResponse;
import com.healthguard.community.dto.BroadcastNotificationRequest;
import com.healthguard.community.entity.BroadcastNotification;
import com.healthguard.community.repository.BroadcastNotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
@Slf4j
public class BroadcastController {

    private final BroadcastNotificationRepository broadcastRepository;
    private final JdbcTemplate jdbcTemplate;

    @PostMapping({"/api/broadcast/send", "/api/broadcast"})
    public ResponseEntity<?> sendBroadcast(
            @RequestBody BroadcastNotificationRequest request,
            @RequestHeader(value = "X-User-Id", required = false) String userId,
            @RequestHeader(value = "X-User-Email", required = false) String userEmail
    ) {
        // --- Validation: Title & Message ---
        if (request.getTitle() == null || request.getTitle().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Broadcast title is required"));
        }
        if (request.getMessage() == null || request.getMessage().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Broadcast message is required"));
        }

        // --- Role Normalization ---
        String rawRole = request.getRole();
        if (rawRole == null || rawRole.isBlank()) {
            rawRole = "CITIZEN";
        }
        rawRole = rawRole.trim().toUpperCase();
        if (rawRole.contains("ASHA")) {
            rawRole = "ASHA_WORKER";
        } else if (rawRole.contains("CITIZEN") || rawRole.equals("USER")) {
            rawRole = "CITIZEN";
        }

        if (!rawRole.equals("CITIZEN") && !rawRole.equals("ASHA_WORKER")) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Invalid role. Target role must be CITIZEN or ASHA_WORKER"));
        }
        final String targetRole = rawRole;

        // --- Village Resolution (Trim, Case-Insensitive, Optional) ---
        String village = (request.getVillage() != null && !request.getVillage().isBlank())
                ? request.getVillage().trim() : null;

        // If village is provided, validate that it exists in the district database
        if (village != null) {
            String checkSql = "SELECT COUNT(*) FROM (" +
                    "  SELECT village FROM users WHERE village IS NOT NULL AND TRIM(village) != '' " +
                    "  UNION " +
                    "  SELECT village FROM families WHERE village IS NOT NULL AND TRIM(village) != '' " +
                    "  UNION " +
                    "  SELECT village FROM asha_workers WHERE village IS NOT NULL AND TRIM(village) != '' " +
                    "  UNION " +
                    "  SELECT village FROM citizen_assignment WHERE village IS NOT NULL AND TRIM(village) != '' " +
                    ") v WHERE LOWER(TRIM(TRAILING ',' FROM TRIM(v.village))) = LOWER(TRIM(?))";

            try {
                Integer count = jdbcTemplate.queryForObject(checkSql, Integer.class, village);
                if (count == null || count == 0) {
                    log.warn("Broadcast validation failed: Village '{}' does not exist in records", village);
                    return ResponseEntity.badRequest()
                            .body(ApiResponse.error("Village \"" + village + "\" not found. Please check the village name and try again."));
                }
            } catch (Exception e) {
                log.warn("Village validation check error: {}", e.getMessage());
            }
        }

        String notifType = request.getNotificationType() != null
                ? request.getNotificationType().toLowerCase() : "info";
        String category = request.getCategory() != null ? request.getCategory().trim() : "General";
        String author = userEmail != null && !userEmail.isEmpty()
                ? userEmail : (userId != null ? "Officer-" + userId : "Health Officer");

        String targetValue = village != null ? targetRole + ":" + village : targetRole;

        // --- Save to broadcast_notifications table ---
        BroadcastNotification broadcast = BroadcastNotification.builder()
                .title(request.getTitle().trim())
                .message(request.getMessage().trim())
                .targetType("ROLE")
                .targetValue(targetValue)
                .targetRole(targetRole)
                .villageName(village)
                .category(category)
                .notificationType(notifType)
                .createdBy(author)
                .createdAt(LocalDateTime.now())
                .build();

        BroadcastNotification saved = broadcastRepository.save(broadcast);

        // --- Query target recipients strictly by role and village ---
        List<Map<String, Object>> targetUsers;
        if ("CITIZEN".equals(targetRole)) {
            if (village != null) {
                targetUsers = jdbcTemplate.queryForList(
                        "SELECT DISTINCT u.id, u.email, COALESCE(u.village, f.village, ca.village) as village " +
                        "FROM users u " +
                        "LEFT JOIN citizens c ON c.user_id = u.id " +
                        "LEFT JOIN families f ON f.citizen_id = c.id " +
                        "LEFT JOIN citizen_assignment ca ON ca.citizen_id = c.id " +
                        "WHERE UPPER(TRIM(u.role)) = 'CITIZEN' " +
                        "  AND LOWER(TRIM(TRAILING ',' FROM TRIM(COALESCE(u.village, f.village, ca.village)))) = LOWER(TRIM(?))",
                        village
                );
            } else {
                targetUsers = jdbcTemplate.queryForList(
                        "SELECT DISTINCT u.id, u.email, COALESCE(u.village, f.village, ca.village) as village " +
                        "FROM users u " +
                        "LEFT JOIN citizens c ON c.user_id = u.id " +
                        "LEFT JOIN families f ON f.citizen_id = c.id " +
                        "LEFT JOIN citizen_assignment ca ON ca.citizen_id = c.id " +
                        "WHERE UPPER(TRIM(u.role)) = 'CITIZEN'"
                );
            }
        } else { // ASHA_WORKER
            if (village != null) {
                targetUsers = jdbcTemplate.queryForList(
                        "SELECT DISTINCT u.id, u.email, COALESCE(u.village, aw.village) as village " +
                        "FROM users u " +
                        "LEFT JOIN asha_workers aw ON LOWER(TRIM(aw.email)) = LOWER(TRIM(u.email)) " +
                        "WHERE UPPER(TRIM(u.role)) = 'ASHA_WORKER' " +
                        "  AND LOWER(TRIM(TRAILING ',' FROM TRIM(COALESCE(u.village, aw.village)))) = LOWER(TRIM(?))",
                        village
                );
            } else {
                targetUsers = jdbcTemplate.queryForList(
                        "SELECT DISTINCT u.id, u.email, COALESCE(u.village, aw.village) as village " +
                        "FROM users u " +
                        "LEFT JOIN asha_workers aw ON LOWER(TRIM(aw.email)) = LOWER(TRIM(u.email)) " +
                        "WHERE UPPER(TRIM(u.role)) = 'ASHA_WORKER'"
                );
            }
        }

        int fanoutCount = 0;
        String priority = ("emergency".equalsIgnoreCase(notifType) || "warning".equalsIgnoreCase(notifType))
                ? "HIGH" : "MEDIUM";
        String refId = "BROADCAST-" + saved.getId();

        for (Map<String, Object> row : targetUsers) {
            long targetUserId = ((Number) row.get("id")).longValue();
            String userVillage = (String) row.get("village");
            try {
                jdbcTemplate.update(
                        "INSERT INTO notifications " +
                        "(user_id, role, village, title, message, type, priority, is_read, created_at, reference_id, reference_type) " +
                        "VALUES (?, ?, ?, ?, ?, ?, ?, false, NOW(), ?, ?)",
                        targetUserId,
                        targetRole,
                        userVillage,
                        saved.getTitle(),
                        saved.getMessage(),
                        "HEALTH_OFFICER_BROADCAST",
                        priority,
                        refId,
                        "BROADCAST"
                );
                fanoutCount++;
            } catch (Exception e) {
                log.warn("Failed to insert broadcast notification for user {}: {}", targetUserId, e.getMessage());
            }
        }

        // REQUIRED LOGGING
        log.info("Notification saved: ID={}, Title={}, Target Role={}, Target Village={}, Recipient Count={}",
                saved.getId(), saved.getTitle(), targetRole, (village != null ? village : "ALL"), fanoutCount);

        String summaryRole = targetRole.equals("CITIZEN") ? "Citizen(s)" : "ASHA Worker(s)";
        String summary = village != null
                ? "Broadcast sent to " + fanoutCount + " " + summaryRole + " in \"" + village + "\""
                : "Broadcast sent to all " + fanoutCount + " " + summaryRole + " across all villages";

        Map<String, Object> responseData = Map.of(
                "broadcastId", saved.getId(),
                "title", saved.getTitle(),
                "targetRole", targetRole,
                "targetVillage", village != null ? village : "ALL",
                "recipientCount", fanoutCount,
                "sentAt", LocalDateTime.now().toString()
        );

        return ResponseEntity.ok(ApiResponse.success(summary, responseData));
    }

    @GetMapping({"/api/broadcast/recent", "/api/broadcast/history"})
    public ResponseEntity<?> getRecentBroadcasts() {
        List<BroadcastNotification> list = broadcastRepository.findAllByOrderByCreatedAtDesc();
        return ResponseEntity.ok(ApiResponse.success("Broadcast history retrieved", list));
    }
}
