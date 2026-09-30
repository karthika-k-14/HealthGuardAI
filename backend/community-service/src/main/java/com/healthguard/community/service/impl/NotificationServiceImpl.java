package com.healthguard.community.service.impl;

import com.healthguard.community.entity.HealthOfficerPreferences;
import com.healthguard.community.entity.NotificationEntity;
import com.healthguard.community.repository.HealthOfficerPreferencesRepository;
import com.healthguard.community.repository.NotificationRepository;
import com.healthguard.community.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final HealthOfficerPreferencesRepository preferencesRepository;
    private final JdbcTemplate jdbcTemplate;

    private static class WorkerIdentity {
        Long workerId;
        Long userId;
        String workerName;
        String email;
        String village;
    }

    private WorkerIdentity resolveWorkerIdentity(Long headerUserId, String headerUserEmail, Long paramAshaWorkerId) {
        WorkerIdentity id = new WorkerIdentity();
        id.workerId = paramAshaWorkerId;
        id.email = headerUserEmail;
        id.userId = headerUserId;

        if (id.email == null || id.email.isBlank()) {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.getName() != null && !auth.getName().equalsIgnoreCase("anonymousUser")) {
                id.email = auth.getName();
            }
        }

        // Lookup from asha_workers by email
        if (id.email != null && !id.email.isBlank()) {
            try {
                List<Map<String, Object>> rows = jdbcTemplate.queryForList(
                        "SELECT id, full_name, village FROM asha_workers WHERE LOWER(TRIM(email)) = LOWER(TRIM(?))",
                        id.email
                );
                if (!rows.isEmpty()) {
                    Map<String, Object> r = rows.get(0);
                    if (id.workerId == null) id.workerId = ((Number) r.get("id")).longValue();
                    id.workerName = (String) r.get("full_name");
                    id.village = (String) r.get("village");
                }
            } catch (Exception ignored) {}
        }

        // Lookup from users by email or userId
        if (id.userId == null && id.email != null && !id.email.isBlank()) {
            try {
                List<Long> uIds = jdbcTemplate.queryForList(
                        "SELECT id FROM users WHERE LOWER(TRIM(email)) = LOWER(TRIM(?))",
                        Long.class,
                        id.email
                );
                if (!uIds.isEmpty()) {
                    id.userId = uIds.get(0);
                }
            } catch (Exception ignored) {}
        }

        if (id.workerId != null && (id.workerName == null || id.userId == null)) {
            try {
                List<Map<String, Object>> rows = jdbcTemplate.queryForList(
                        "SELECT aw.id as worker_id, aw.full_name, aw.email, aw.village, u.id as user_id " +
                                "FROM asha_workers aw LEFT JOIN users u ON LOWER(TRIM(aw.email)) = LOWER(TRIM(u.email)) " +
                                "WHERE aw.id = ?",
                        id.workerId
                );
                if (!rows.isEmpty()) {
                    Map<String, Object> r = rows.get(0);
                    id.workerName = (String) r.get("full_name");
                    id.village = (String) r.get("village");
                    if (id.userId == null && r.get("user_id") != null) {
                        id.userId = ((Number) r.get("user_id")).longValue();
                    }
                }
            } catch (Exception ignored) {}
        }

        if (id.userId == null) {
            id.userId = id.workerId != null ? id.workerId : 24L;
        }

        return id;
    }

    private Long resolveOfficerUserId(Long headerUserId, String headerUserEmail) {
        if (headerUserId != null) {
            try {
                List<String> roles = jdbcTemplate.queryForList(
                        "SELECT role FROM users WHERE id = ?",
                        String.class,
                        headerUserId
                );
                if (!roles.isEmpty() && roles.get(0) != null && roles.get(0).toUpperCase().contains("OFFICER")) {
                    return headerUserId;
                }
            } catch (Exception ignored) {}
        }
        if (headerUserEmail != null && !headerUserEmail.isBlank()) {
            try {
                List<Long> ids = jdbcTemplate.queryForList(
                        "SELECT id FROM users WHERE LOWER(TRIM(email)) = LOWER(TRIM(?)) AND UPPER(role) LIKE '%OFFICER%'",
                        Long.class,
                        headerUserEmail
                );
                if (!ids.isEmpty() && ids.get(0) != null) {
                    return ids.get(0);
                }
            } catch (Exception ignored) {}
        }
        try {
            List<Long> defaultOfficers = jdbcTemplate.queryForList(
                    "SELECT id FROM users WHERE (UPPER(role) = 'HEALTH_OFFICER' OR UPPER(role) = 'OFFICER') AND is_active = true ORDER BY id ASC",
                    Long.class
            );
            if (!defaultOfficers.isEmpty() && defaultOfficers.get(0) != null) {
                return defaultOfficers.get(0);
            }
        } catch (Exception ignored) {}
        return 27L;
    }

    private boolean isHealthOfficerRole(String role, String headerUserEmail) {
        if (role != null && (role.equalsIgnoreCase("HEALTH_OFFICER") || role.equalsIgnoreCase("OFFICER") || role.toUpperCase().contains("OFFICER"))) {
            return true;
        }
        if (headerUserEmail != null && !headerUserEmail.isBlank()) {
            try {
                List<String> roles = jdbcTemplate.queryForList(
                        "SELECT role FROM users WHERE LOWER(TRIM(email)) = LOWER(TRIM(?))",
                        String.class,
                        headerUserEmail
                );
                if (!roles.isEmpty() && roles.get(0) != null) {
                    String r = roles.get(0).toUpperCase();
                    if (r.contains("OFFICER")) return true;
                }
            } catch (Exception ignored) {}
        }
        return false;
    }

    @Override
    @Transactional
    public List<NotificationEntity> getNotificationsForUser(Long headerUserId, String headerUserEmail, Long ashaWorkerId, String role) {
        if (isHealthOfficerRole(role, headerUserEmail)) {
            Long officerId = resolveOfficerUserId(headerUserId, headerUserEmail);
            return getHealthOfficerNotifications(officerId);
        }

        WorkerIdentity identity = resolveWorkerIdentity(headerUserId, headerUserEmail, ashaWorkerId);

        // Auto-generate notifications from actual database events only if workerId is present (ASHA worker)
        if (identity.workerId != null) {
            triggerAutoNotifications(identity.workerId, identity.userId, identity.workerName, identity.village);
        }

        List<NotificationEntity> list = notificationRepository.findByUserIdOrWorkerIdAndRole(identity.userId, identity.workerId, "ASHA_WORKER");
        log.info("Fetched notifications count: {}, Logged-in User ID: {}, Logged-in User Role: ASHA_WORKER, Logged-in User Village: {}",
                list.size(), identity.userId, identity.village);
        return list;
    }

    @Override
    public long getUnreadCount(Long headerUserId, String headerUserEmail, Long ashaWorkerId, String role) {
        if (isHealthOfficerRole(role, headerUserEmail)) {
            Long officerId = resolveOfficerUserId(headerUserId, headerUserEmail);
            return getHealthOfficerUnreadCount(officerId);
        }

        WorkerIdentity identity = resolveWorkerIdentity(headerUserId, headerUserEmail, ashaWorkerId);
        return notificationRepository.countUnreadByUserIdOrWorkerIdAndRole(identity.userId, identity.workerId, "ASHA_WORKER");
    }

    @Override
    @Transactional
    public NotificationEntity markAsRead(Long id) {
        NotificationEntity n = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found with ID: " + id));
        n.setIsRead(true);
        return notificationRepository.save(n);
    }

    @Override
    @Transactional
    public void markAllAsRead(Long headerUserId, String headerUserEmail, Long ashaWorkerId, String role) {
        if (isHealthOfficerRole(role, headerUserEmail)) {
            Long officerId = resolveOfficerUserId(headerUserId, headerUserEmail);
            notificationRepository.markAllAsReadForUserOrRole(officerId, "HEALTH_OFFICER");
            return;
        }

        WorkerIdentity identity = resolveWorkerIdentity(headerUserId, headerUserEmail, ashaWorkerId);
        notificationRepository.markAllAsReadForUserAndRole(identity.userId, identity.workerId, "ASHA_WORKER");
    }

    @Override
    @Transactional
    public void deleteNotification(Long id) {
        if (notificationRepository.existsById(id)) {
            notificationRepository.deleteById(id);
        }
    }

    @Override
    @Transactional
    public void triggerAutoNotifications(Long workerId, Long userId, String workerName, String village) {
        if (workerId == null) return;
        final Long targetUserId = userId != null ? userId : workerId;

        try {
            // 1. (Broadcast notifications are handled directly by BroadcastController fan-out)

            // 2. CITIZEN ASSIGNMENT
            String assignSql = "SELECT assignment_id, citizen_name, village FROM citizen_assignment " +
                    "WHERE ((? IS NOT NULL AND asha_worker_id = ?) OR (? IS NOT NULL AND LOWER(TRIM(asha_worker_name)) = LOWER(TRIM(?)))) " +
                    "AND (status IS NULL OR UPPER(status) = 'ACTIVE')";
            List<Map<String, Object>> assignments = jdbcTemplate.queryForList(
                    assignSql,
                    workerId, workerId,
                    workerName, workerName
            );
            for (Map<String, Object> a : assignments) {
                Long aId = ((Number) a.get("assignment_id")).longValue();
                String refId = String.valueOf(aId);
                if (!notificationRepository.existsByUserIdAndReferenceTypeAndReferenceId(targetUserId, "CITIZEN_ASSIGNMENT", refId)) {
                    String cName = (String) a.get("citizen_name");
                    String vName = (String) a.get("village");
                    notificationRepository.save(NotificationEntity.builder()
                            .userId(targetUserId)
                            .role("ASHA_WORKER")
                            .title("New Citizen Assigned")
                            .message("New citizen assigned: " + (cName != null ? cName : "Citizen") + (vName != null ? " in " + vName : "") + ".")
                            .type("CITIZEN_ASSIGNMENT")
                            .priority("MEDIUM")
                            .isRead(false)
                            .referenceId(refId)
                            .referenceType("CITIZEN_ASSIGNMENT")
                            .build());
                }
            }

            // 3. HOME VISIT REMINDERS
            LocalDate today = LocalDate.now();
            LocalDate tomorrow = today.plusDays(1);

            List<Map<String, Object>> visits = jdbcTemplate.queryForList(
                    "SELECT visit_id, citizen_name, visit_date, status, visit_type FROM home_visits WHERE asha_worker_id = ?",
                    workerId
            );
            for (Map<String, Object> v : visits) {
                Long vId = ((Number) v.get("visit_id")).longValue();
                String cName = (String) v.get("citizen_name");
                String vType = (String) v.get("visit_type");
                String status = (String) v.get("status");
                java.sql.Date sqlDate = (java.sql.Date) v.get("visit_date");
                LocalDate vDate = sqlDate != null ? sqlDate.toLocalDate() : null;

                if (vDate != null) {
                    if (vDate.equals(today)) {
                        String refId = "TODAY_" + vId;
                        if (!notificationRepository.existsByUserIdAndReferenceTypeAndReferenceId(targetUserId, "HOME_VISIT", refId)) {
                            notificationRepository.save(NotificationEntity.builder()
                                    .userId(targetUserId)
                                    .role("ASHA_WORKER")
                                    .title("Home Visit Due Today")
                                    .message("Home visit due today for " + cName + " (" + (vType != null ? vType : "Routine Check") + ").")
                                    .type("HOME_VISIT")
                                    .priority("HIGH")
                                    .isRead(false)
                                    .referenceId(refId)
                                    .referenceType("HOME_VISIT")
                                    .build());
                        }
                    } else if (vDate.equals(tomorrow)) {
                        String refId = "TOMORROW_" + vId;
                        if (!notificationRepository.existsByUserIdAndReferenceTypeAndReferenceId(targetUserId, "HOME_VISIT", refId)) {
                            notificationRepository.save(NotificationEntity.builder()
                                    .userId(targetUserId)
                                    .role("ASHA_WORKER")
                                    .title("Upcoming Home Visit")
                                    .message("Home visit scheduled tomorrow for " + cName + ".")
                                    .type("HOME_VISIT")
                                    .priority("MEDIUM")
                                    .isRead(false)
                                    .referenceId(refId)
                                    .referenceType("HOME_VISIT")
                                    .build());
                        }
                    } else if (vDate.isBefore(today) && !"COMPLETED".equalsIgnoreCase(status)) {
                        String refId = "MISSED_" + vId;
                        if (!notificationRepository.existsByUserIdAndReferenceTypeAndReferenceId(targetUserId, "HOME_VISIT", refId)) {
                            notificationRepository.save(NotificationEntity.builder()
                                    .userId(targetUserId)
                                    .role("ASHA_WORKER")
                                    .title("Home Visit Missed/Overdue")
                                    .message("Home visit overdue for " + cName + " scheduled on " + vDate + ".")
                                    .type("HOME_VISIT")
                                    .priority("HIGH")
                                    .isRead(false)
                                    .referenceId(refId)
                                    .referenceType("HOME_VISIT")
                                    .build());
                        }
                    }
                }
            }

            // 4. DISEASE SURVEILLANCE ALERTS
            List<Map<String, Object>> reports = jdbcTemplate.queryForList(
                    "SELECT report_id, citizen_name, affected_person_name, disease, severity, status, emergency_referral, village " +
                            "FROM disease_surveillance_reports WHERE asha_worker_id = ?",
                    workerId
            );
            for (Map<String, Object> r : reports) {
                Long repId = ((Number) r.get("report_id")).longValue();
                String dis = (String) r.get("disease");
                String sev = (String) r.get("severity");
                String st = (String) r.get("status");
                String cName = (String) r.get("citizen_name");
                String affName = (String) r.get("affected_person_name");
                String targetPerson = affName != null && !affName.isBlank() ? affName : cName;
                Boolean isEmergency = (Boolean) r.get("emergency_referral");
                String vName = (String) r.get("village");

                if ("High".equalsIgnoreCase(sev) || "Critical".equalsIgnoreCase(sev)) {
                    String refId = "DISEASE_ALERT_" + repId;
                    if (!notificationRepository.existsByUserIdAndReferenceTypeAndReferenceId(targetUserId, "DISEASE_SURVEILLANCE", refId)) {
                        notificationRepository.save(NotificationEntity.builder()
                                .userId(targetUserId)
                                .role("ASHA_WORKER")
                                .title("High Priority " + dis + " Alert")
                                .message("High priority " + dis + " case submitted for " + targetPerson + " in " + (vName != null ? vName : "village") + ".")
                                .type("DISEASE_SURVEILLANCE")
                                .priority("CRITICAL")
                                .isRead(false)
                                .referenceId(refId)
                                .referenceType("DISEASE_SURVEILLANCE")
                                .build());
                    }
                }

                if ("Pending Review".equalsIgnoreCase(st) || "PENDING".equalsIgnoreCase(st)) {
                    String refId = "DISEASE_REVIEW_" + repId;
                    if (!notificationRepository.existsByUserIdAndReferenceTypeAndReferenceId(targetUserId, "DISEASE_SURVEILLANCE", refId)) {
                        notificationRepository.save(NotificationEntity.builder()
                                .userId(targetUserId)
                                .role("ASHA_WORKER")
                                .title("Disease Report Awaiting Review")
                                .message("Disease report #" + repId + " (" + dis + ") is awaiting Health Officer review.")
                                .type("DISEASE_SURVEILLANCE")
                                .priority("MEDIUM")
                                .isRead(false)
                                .referenceId(refId)
                                .referenceType("DISEASE_SURVEILLANCE")
                                .build());
                    }
                }

                // 6. REFERRAL NOTIFICATION
                if (Boolean.TRUE.equals(isEmergency)) {
                    String refId = "REFERRAL_EMERGENCY_" + repId;
                    if (!notificationRepository.existsByUserIdAndReferenceTypeAndReferenceId(targetUserId, "REFERRAL", refId)) {
                        notificationRepository.save(NotificationEntity.builder()
                                .userId(targetUserId)
                                .role("ASHA_WORKER")
                                .title("Emergency Referral Created")
                                .message("Emergency referral generated for " + targetPerson + " (" + dis + "). PHC notification dispatched.")
                                .type("REFERRAL")
                                .priority("HIGH")
                                .isRead(false)
                                .referenceId(refId)
                                .referenceType("REFERRAL")
                                .build());
                    }
                }
            }

            // 5. CHILD HEALTH ALERTS
            List<Map<String, Object>> childMembers = jdbcTemplate.queryForList(
                    "SELECT m.id, m.name, m.age, m.vaccination_status, m.risk_status " +
                            "FROM asha_family_members m " +
                            "JOIN families f ON m.family_id = f.id " +
                            "WHERE f.asha_worker_id = ? AND (m.is_child_member = true OR m.age <= 5)",
                    workerId
            );
            for (Map<String, Object> m : childMembers) {
                Long mId = ((Number) m.get("id")).longValue();
                String mName = (String) m.get("name");
                Number mAge = (Number) m.get("age");
                String vStatus = (String) m.get("vaccination_status");
                String rStatus = (String) m.get("risk_status");

                if (!"UP_TO_DATE".equalsIgnoreCase(vStatus) && !"COMPLETED".equalsIgnoreCase(vStatus)) {
                    String refId = "CHILD_VACCINE_" + mId;
                    if (!notificationRepository.existsByUserIdAndReferenceTypeAndReferenceId(targetUserId, "CHILD_HEALTH", refId)) {
                        notificationRepository.save(NotificationEntity.builder()
                                .userId(targetUserId)
                                .role("ASHA_WORKER")
                                .title("Vaccination Due for " + mName)
                                .message("Vaccination due for child " + mName + " (Age: " + mAge + " yrs, status: " + (vStatus != null ? vStatus : "PENDING") + ").")
                                .type("CHILD_HEALTH")
                                .priority("HIGH")
                                .isRead(false)
                                .referenceId(refId)
                                .referenceType("CHILD_HEALTH")
                                .build());
                    }
                }

                if ("HIGH_RISK".equalsIgnoreCase(rStatus) || "MODERATE".equalsIgnoreCase(rStatus) || "High".equalsIgnoreCase(rStatus)) {
                    String refId = "CHILD_RISK_" + mId;
                    if (!notificationRepository.existsByUserIdAndReferenceTypeAndReferenceId(targetUserId, "CHILD_HEALTH", refId)) {
                        notificationRepository.save(NotificationEntity.builder()
                                .userId(targetUserId)
                                .role("ASHA_WORKER")
                                .title("Child Health Follow-up Required")
                                .message("Follow-up visit required for " + mName + " due to flagged health condition.")
                                .type("CHILD_HEALTH")
                                .priority("HIGH")
                                .isRead(false)
                                .referenceId(refId)
                                .referenceType("CHILD_HEALTH")
                                .build());
                    }
                }
            }

            // 7. SYSTEM NOTIFICATION
            String sysRefId = "SYS_INIT_" + targetUserId;
            if (!notificationRepository.existsByUserIdAndReferenceTypeAndReferenceId(targetUserId, "SYSTEM", sysRefId)) {
                notificationRepository.save(NotificationEntity.builder()
                        .userId(targetUserId)
                        .role("ASHA_WORKER")
                        .title("ASHA Field Portal Active")
                        .message("Welcome back, " + (workerName != null ? workerName : "ASHA Worker") + ". Your field surveillance and household monitoring systems are synchronized.")
                        .type("SYSTEM")
                        .priority("LOW")
                        .isRead(false)
                        .referenceId(sysRefId)
                        .referenceType("SYSTEM")
                        .build());
            }

        } catch (Exception e) {
            log.error("Error auto-generating notifications for worker {}: {}", workerId, e.getMessage(), e);
        }
    }

    @Override
    @Transactional
    public NotificationEntity createHealthOfficerNotificationForReport(com.healthguard.community.entity.DiseaseReport report, String ashaWorkerName) {
        if (report == null) return null;
        Long reportId = report.getReportId();
        log.info("Creating Health Officer notification for report ID {}", reportId);

        String workerName = ashaWorkerName;
        if (workerName == null || workerName.isBlank() || workerName.equalsIgnoreCase("ASHA Worker")) {
            if (report.getCreatedBy() != null && !report.getCreatedBy().isBlank()) {
                workerName = report.getCreatedBy();
            } else if (report.getAshaWorkerId() != null) {
                try {
                    List<String> names = jdbcTemplate.queryForList(
                            "SELECT full_name FROM asha_workers WHERE id = ?",
                            String.class,
                            report.getAshaWorkerId()
                    );
                    if (!names.isEmpty() && names.get(0) != null) {
                        workerName = names.get(0).trim();
                    }
                } catch (Exception ignored) {}
            }
        }
        if (workerName == null || workerName.isBlank()) {
            workerName = "ASHA Worker";
        }

        String citizenName = report.getAffectedPersonName() != null && !report.getAffectedPersonName().isBlank()
                ? report.getAffectedPersonName()
                : (report.getCitizenName() != null && !report.getCitizenName().isBlank() ? report.getCitizenName() : "Citizen");
        String disease = report.getDisease() != null ? report.getDisease() : "Disease";
        String village = report.getVillage() != null ? report.getVillage() : "Village";

        String title = "New Disease Surveillance Report";
        String message = String.format("ASHA Worker %s submitted a %s case for %s in %s",
                workerName, disease, citizenName, village);

        String priority = "MEDIUM";
        if (Boolean.TRUE.equals(report.getEmergencyReferral())) {
            title = "🚨 Emergency Referral Alert";
            priority = "CRITICAL";
        } else if ("Critical".equalsIgnoreCase(report.getSeverity())) {
            title = "🚨 Critical Disease Case Reported";
            priority = "CRITICAL";
        } else if ("High".equalsIgnoreCase(report.getSeverity())) {
            title = "⚠️ High Severity Disease Case Reported";
            priority = "HIGH";
        } else if ("Low".equalsIgnoreCase(report.getSeverity())) {
            priority = "LOW";
        }

        List<Long> officerUserIds = new ArrayList<>();
        try {
            officerUserIds = jdbcTemplate.queryForList(
                    "SELECT id FROM users WHERE (UPPER(role) = 'HEALTH_OFFICER' OR UPPER(role) = 'OFFICER') AND is_active = true",
                    Long.class
            );
        } catch (Exception ignored) {}

        if (officerUserIds.isEmpty()) {
            officerUserIds.add(27L);
        }

        NotificationEntity savedNotification = null;
        for (Long officerId : officerUserIds) {
            HealthOfficerPreferences prefs = getOfficerPreferences(officerId);

            // 1. Disease Surveillance Alerts: If OFF -> do not send disease surveillance notifications
            if (Boolean.FALSE.equals(prefs.getDiseaseSurveillanceAlerts())) {
                log.info("Skipping disease notification for officer {}: diseaseSurveillanceAlerts is OFF", officerId);
                continue;
            }

            // 2. High-Risk Case Notifications: If OFF -> do not send critical/high severity alerts
            boolean isHighRisk = "CRITICAL".equalsIgnoreCase(priority) || "HIGH".equalsIgnoreCase(priority) ||
                    "Critical".equalsIgnoreCase(report.getSeverity()) || "High".equalsIgnoreCase(report.getSeverity());
            if (isHighRisk && Boolean.FALSE.equals(prefs.getHighRiskCaseNotifications())) {
                log.info("Skipping high-risk notification for officer {}: highRiskCaseNotifications is OFF", officerId);
                continue;
            }

            // 3. Referral Escalation Alerts: If OFF -> do not send referral escalation notifications
            boolean isReferralEscalation = Boolean.TRUE.equals(report.getEmergencyReferral()) ||
                    title.toLowerCase().contains("emergency referral") || title.toLowerCase().contains("escalat");
            if (isReferralEscalation && Boolean.FALSE.equals(prefs.getReferralEscalationAlerts())) {
                log.info("Skipping referral escalation notification for officer {}: referralEscalationAlerts is OFF", officerId);
                continue;
            }

            NotificationEntity notification = NotificationEntity.builder()
                    .userId(officerId)
                    .role("HEALTH_OFFICER")
                    .title(title)
                    .message(message)
                    .type("DISEASE_ALERT")
                    .priority(priority)
                    .village(village != null ? village : "All Villages")
                    .source(workerName != null && !workerName.isBlank() ? "ASHA Worker: " + workerName : "Disease Surveillance")
                    .isRead(false)
                    .referenceId(String.valueOf(reportId))
                    .referenceType("DISEASE_ALERT")
                    .build();

            savedNotification = notificationRepository.save(notification);
            log.info("[NotificationCreated] ID: {}, Title: {}, RecipientUser: {}, RecipientRole: {}", savedNotification.getId(), savedNotification.getTitle(), savedNotification.getUserId(), savedNotification.getRole());
        }

        return savedNotification;
    }

    @Override
    @Transactional
    public List<NotificationEntity> getHealthOfficerNotifications(Long userId) {
        Long officerId = (userId != null && userId > 0) ? userId : 27L;
        HealthOfficerPreferences prefs = getOfficerPreferences(officerId);
        syncOfficerNotifications(officerId, prefs);

        List<NotificationEntity> list = notificationRepository.findByUserIdAndRoleOrderByCreatedAtDesc(officerId, "HEALTH_OFFICER");
        List<NotificationEntity> filtered = list.stream()
                .filter(n -> shouldDeliverToOfficer(n, prefs))
                .toList();

        log.info("[NotificationDelivered] Recipient Role: HEALTH_OFFICER, Recipient User: {}, Count: {}", officerId, filtered.size());
        return filtered;
    }

    @Override
    public long getHealthOfficerUnreadCount(Long userId) {
        Long officerId = (userId != null && userId > 0) ? userId : 27L;
        HealthOfficerPreferences prefs = getOfficerPreferences(officerId);
        List<NotificationEntity> list = notificationRepository.findByUserIdAndRoleOrderByCreatedAtDesc(officerId, "HEALTH_OFFICER");
        long unreadCount = list.stream()
                .filter(n -> !Boolean.TRUE.equals(n.getIsRead()) && shouldDeliverToOfficer(n, prefs))
                .count();

        log.info("[UnreadCount] Recipient User: {}, Unread Count: {}", officerId, unreadCount);
        return unreadCount;
    }

    @Override
    @Transactional
    public NotificationEntity markOfficerNotificationAsRead(Long id) {
        NotificationEntity n = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found with ID: " + id));
        n.setIsRead(true);
        NotificationEntity saved = notificationRepository.save(n);
        log.info("[NotificationRead] ID: {}, RecipientUser: {}, RecipientRole: {}", saved.getId(), saved.getUserId(), saved.getRole());
        return saved;
    }

    @Override
    @Transactional
    public void markAllOfficerNotificationsAsRead(Long userId) {
        Long officerId = (userId != null && userId > 0) ? userId : 27L;
        notificationRepository.markAllAsReadByUserIdAndRole(officerId, "HEALTH_OFFICER");
        log.info("[AllNotificationsRead] Recipient User: {}, Role: HEALTH_OFFICER", officerId);
    }

    private HealthOfficerPreferences getOfficerPreferences(Long officerId) {
        final Long resolvedId = (officerId != null) ? officerId : 27L;
        return preferencesRepository.findByUserId(resolvedId)
                .orElseGet(() -> HealthOfficerPreferences.builder()
                        .userId(resolvedId)
                        .diseaseSurveillanceAlerts(true)
                        .highRiskCaseNotifications(true)
                        .referralEscalationAlerts(true)
                        .outbreakDetectionAlerts(true)
                        .campaignUpdateNotifications(true)
                        .build());
    }

    private boolean shouldDeliverToOfficer(NotificationEntity n, HealthOfficerPreferences prefs) {
        if (prefs == null) return true;
        String type = n.getType() != null ? n.getType().toUpperCase() : "";
        String priority = n.getPriority() != null ? n.getPriority().toUpperCase() : "";
        String title = n.getTitle() != null ? n.getTitle().toLowerCase() : "";

        // Outbreak Detection Alerts: If OFF -> do not deliver outbreak prediction notifications
        if (type.contains("OUTBREAK") || title.contains("outbreak")) {
            return !Boolean.FALSE.equals(prefs.getOutbreakDetectionAlerts());
        }

        // Campaign Update Notifications: If OFF -> do not deliver campaign-related notifications
        if (type.contains("CAMPAIGN") || title.contains("campaign")) {
            return !Boolean.FALSE.equals(prefs.getCampaignUpdateNotifications());
        }

        // Referral Escalation Alerts: If OFF -> do not deliver referral escalation notifications
        if (type.contains("REFERRAL") || title.contains("referral") || title.contains("escalat")) {
            if (Boolean.FALSE.equals(prefs.getReferralEscalationAlerts())) {
                return false;
            }
        }

        // High-Risk Case Notifications: If OFF -> do not deliver critical/high severity alerts
        if ("CRITICAL".equals(priority) || "HIGH".equals(priority) || title.contains("critical") || title.contains("high severity")) {
            if (Boolean.FALSE.equals(prefs.getHighRiskCaseNotifications())) {
                return false;
            }
        }

        // Disease Surveillance Alerts: If OFF -> do not deliver disease surveillance notifications
        if (type.contains("DISEASE") || type.contains("SURVEILLANCE")) {
            return !Boolean.FALSE.equals(prefs.getDiseaseSurveillanceAlerts());
        }

        return true;
    }

    private void syncOfficerNotifications(Long officerId, HealthOfficerPreferences prefs) {
        try {
            // 1. Disease Surveillance Submissions from ASHA Workers
            if (!Boolean.FALSE.equals(prefs.getDiseaseSurveillanceAlerts())) {
                List<Map<String, Object>> reports = jdbcTemplate.queryForList(
                        "SELECT r.report_id, r.citizen_name, r.affected_person_name, r.disease, r.severity, r.emergency_referral, r.village, " +
                        "COALESCE(w.full_name, r.created_by, 'ASHA Worker') as worker_name " +
                        "FROM disease_surveillance_reports r " +
                        "LEFT JOIN asha_workers w ON r.asha_worker_id = w.id " +
                        "WHERE NOT EXISTS (" +
                        "  SELECT 1 FROM notifications n " +
                        "  WHERE n.reference_id = CAST(r.report_id AS VARCHAR) " +
                        "  AND UPPER(n.role) = 'HEALTH_OFFICER' " +
                        "  AND n.reference_type = 'DISEASE_ALERT' " +
                        "  AND n.user_id = ?" +
                        ") ORDER BY r.report_id ASC",
                        officerId
                );

                for (Map<String, Object> r : reports) {
                    Long repId = ((Number) r.get("report_id")).longValue();
                    String dis = (String) r.get("disease");
                    String cName = (String) r.get("citizen_name");
                    String affName = (String) r.get("affected_person_name");
                    String targetPerson = affName != null && !affName.isBlank() ? affName : cName;
                    String vName = (String) r.get("village");
                    String wName = (String) r.get("worker_name");
                    String sev = (String) r.get("severity");
                    Boolean isEmergency = (Boolean) r.get("emergency_referral");

                    String priority = "MEDIUM";
                    String title = "New Disease Surveillance Report";
                    if (Boolean.TRUE.equals(isEmergency)) {
                        title = "🚨 Emergency Referral Alert";
                        priority = "CRITICAL";
                    } else if ("Critical".equalsIgnoreCase(sev)) {
                        title = "🚨 Critical Disease Case Reported";
                        priority = "CRITICAL";
                    } else if ("High".equalsIgnoreCase(sev)) {
                        title = "⚠️ High Severity Disease Case Reported";
                        priority = "HIGH";
                    } else if ("Low".equalsIgnoreCase(sev)) {
                        priority = "LOW";
                    }

                    boolean isHighRisk = "CRITICAL".equalsIgnoreCase(priority) || "HIGH".equalsIgnoreCase(priority) ||
                            "Critical".equalsIgnoreCase(sev) || "High".equalsIgnoreCase(sev);
                    if (isHighRisk && Boolean.FALSE.equals(prefs.getHighRiskCaseNotifications())) {
                        continue;
                    }

                    boolean isReferralEscalation = Boolean.TRUE.equals(isEmergency) ||
                            title.toLowerCase().contains("emergency referral") || title.toLowerCase().contains("escalat");
                    if (isReferralEscalation && Boolean.FALSE.equals(prefs.getReferralEscalationAlerts())) {
                        continue;
                    }

                    String message = String.format("ASHA Worker %s submitted a %s case for %s in %s",
                            wName != null ? wName : "ASHA Worker",
                            dis != null ? dis : "Disease",
                            targetPerson != null ? targetPerson : "Citizen",
                            vName != null ? vName : "village");

                    NotificationEntity n = NotificationEntity.builder()
                            .userId(officerId)
                            .role("HEALTH_OFFICER")
                            .title(title)
                            .message(message)
                            .type("DISEASE_ALERT")
                            .priority(priority)
                            .village(vName != null ? vName : "All Villages")
                            .source(wName != null && !wName.isBlank() ? "ASHA Worker: " + wName : "Disease Surveillance")
                            .isRead(false)
                            .referenceId(String.valueOf(repId))
                            .referenceType("DISEASE_ALERT")
                            .build();

                    NotificationEntity saved = notificationRepository.save(n);
                    log.info("[NotificationCreated] ID: {}, Title: {}, RecipientUser: {}, RecipientRole: {}", saved.getId(), saved.getTitle(), saved.getUserId(), saved.getRole());
                }
            }

            // 2. Referral Escalations
            if (!Boolean.FALSE.equals(prefs.getReferralEscalationAlerts())) {
                List<Map<String, Object>> refList = jdbcTemplate.queryForList(
                        "SELECT ref.id, ref.referral_code, ref.patient_name, ref.disease, ref.severity, ref.village, ref.referred_phc, ref.status, ref.created_by " +
                        "FROM referrals ref " +
                        "WHERE NOT EXISTS (" +
                        "  SELECT 1 FROM notifications n " +
                        "  WHERE n.reference_id = CAST(ref.id AS VARCHAR) " +
                        "  AND UPPER(n.role) = 'HEALTH_OFFICER' " +
                        "  AND n.reference_type = 'REFERRAL' " +
                        "  AND n.user_id = ?" +
                        ") ORDER BY ref.id ASC",
                        officerId
                );

                for (Map<String, Object> ref : refList) {
                    Long refId = ((Number) ref.get("id")).longValue();
                    String pName = (String) ref.get("patient_name");
                    String dis = (String) ref.get("disease");
                    String sev = (String) ref.get("severity");
                    String vil = (String) ref.get("village");
                    String phc = (String) ref.get("referred_phc");
                    String status = (String) ref.get("status");

                    boolean isCritical = "Critical".equalsIgnoreCase(sev) || "High".equalsIgnoreCase(sev);
                    if (isCritical && Boolean.FALSE.equals(prefs.getHighRiskCaseNotifications())) {
                        continue;
                    }

                    String priority = "Critical".equalsIgnoreCase(sev) ? "CRITICAL" : "HIGH";
                    String title = "🚨 Referral Escalation: " + (dis != null ? dis : "Health") + " Case";
                    String message = String.format("Patient %s referred to %s for %s (%s). Immediate officer attention requested.",
                            pName != null ? pName : "Patient",
                            phc != null ? phc : "PHC",
                            dis != null ? dis : "condition",
                            status != null ? status : "Pending");

                    NotificationEntity n = NotificationEntity.builder()
                            .userId(officerId)
                            .role("HEALTH_OFFICER")
                            .title(title)
                            .message(message)
                            .type("REFERRAL")
                            .priority(priority)
                            .village(vil != null ? vil : "All Villages")
                            .source("Referral Escalation System")
                            .isRead(false)
                            .referenceId(String.valueOf(refId))
                            .referenceType("REFERRAL")
                            .build();

                    NotificationEntity saved = notificationRepository.save(n);
                    log.info("[NotificationCreated] ID: {}, Title: {}, RecipientUser: {}, RecipientRole: {}", saved.getId(), saved.getTitle(), saved.getUserId(), saved.getRole());
                }
            }

            // 3. Outbreak Detection Alerts
            if (!Boolean.FALSE.equals(prefs.getOutbreakDetectionAlerts())) {
                List<Map<String, Object>> activeOutbreaks = jdbcTemplate.queryForList(
                        "SELECT alert_id, disease, village, case_count, message FROM outbreak_alerts " +
                        "WHERE UPPER(status) = 'ACTIVE' AND NOT EXISTS (" +
                        "  SELECT 1 FROM notifications n " +
                        "  WHERE n.reference_id = CAST(outbreak_alerts.alert_id AS VARCHAR) " +
                        "  AND UPPER(n.role) = 'HEALTH_OFFICER' " +
                        "  AND n.reference_type = 'OUTBREAK_ALERT' " +
                        "  AND n.user_id = ?" +
                        ") ORDER BY alert_id ASC",
                        officerId
                );

                for (Map<String, Object> ob : activeOutbreaks) {
                    Long obId = ((Number) ob.get("alert_id")).longValue();
                    String dis = (String) ob.get("disease");
                    String vil = (String) ob.get("village");
                    int cCount = ((Number) ob.get("case_count")).intValue();

                    NotificationEntity obNotif = NotificationEntity.builder()
                            .userId(officerId)
                            .role("HEALTH_OFFICER")
                            .title("🚨 Outbreak Prediction Alert: " + dis)
                            .message(String.format("Outbreak threshold reached: %d cases of %s detected in %s!", cCount, dis, vil != null ? vil : "village"))
                            .type("OUTBREAK_ALERT")
                            .priority("CRITICAL")
                            .village(vil != null ? vil : "All Villages")
                            .source("Outbreak Detection Engine")
                            .isRead(false)
                            .referenceId(String.valueOf(obId))
                            .referenceType("OUTBREAK_ALERT")
                            .build();

                    NotificationEntity saved = notificationRepository.save(obNotif);
                    log.info("[NotificationCreated] ID: {}, Title: {}, RecipientUser: {}, RecipientRole: {}", saved.getId(), saved.getTitle(), saved.getUserId(), saved.getRole());
                }
            }

            // 4. Campaign Updates
            if (!Boolean.FALSE.equals(prefs.getCampaignUpdateNotifications())) {
                List<Map<String, Object>> camps = jdbcTemplate.queryForList(
                        "SELECT c.id, c.title, c.type, c.village_name, c.status, c.description FROM campaigns c " +
                        "WHERE NOT EXISTS (" +
                        "  SELECT 1 FROM notifications n " +
                        "  WHERE n.reference_id = CAST(c.id AS VARCHAR) " +
                        "  AND UPPER(n.role) = 'HEALTH_OFFICER' " +
                        "  AND n.reference_type = 'CAMPAIGN' " +
                        "  AND n.user_id = ?" +
                        ") ORDER BY c.id ASC",
                        officerId
                );

                for (Map<String, Object> c : camps) {
                    Long cId = ((Number) c.get("id")).longValue();
                    String title = (String) c.get("title");
                    String cType = (String) c.get("type");
                    String vil = (String) c.get("village_name");
                    String desc = (String) c.get("description");

                    NotificationEntity campNotif = NotificationEntity.builder()
                            .userId(officerId)
                            .role("HEALTH_OFFICER")
                            .title("📢 Health Campaign: " + (title != null ? title : "Update"))
                            .message(String.format("%s campaign scheduled for %s: %s",
                                    cType != null ? cType : "Community",
                                    vil != null ? vil : "assigned area",
                                    desc != null && !desc.isBlank() ? desc : "Active campaign rollout."))
                            .type("CAMPAIGN")
                            .priority("MEDIUM")
                            .village(vil != null ? vil : "All Villages")
                            .source("Campaign Management")
                            .isRead(false)
                            .referenceId(String.valueOf(cId))
                            .referenceType("CAMPAIGN")
                            .build();

                    NotificationEntity saved = notificationRepository.save(campNotif);
                    log.info("[NotificationCreated] ID: {}, Title: {}, RecipientUser: {}, RecipientRole: {}", saved.getId(), saved.getTitle(), saved.getUserId(), saved.getRole());
                }
            }

            // 5. System Announcements
            String sysRef = "SYS_OFFICER_" + officerId;
            Integer sysExists = jdbcTemplate.queryForObject(
                    "SELECT COUNT(*) FROM notifications WHERE reference_id = ? AND reference_type = 'SYSTEM' AND user_id = ? AND UPPER(role) = 'HEALTH_OFFICER'",
                    Integer.class,
                    sysRef, officerId
            );
            if (sysExists == null || sysExists == 0) {
                NotificationEntity sysNotif = NotificationEntity.builder()
                        .userId(officerId)
                        .role("HEALTH_OFFICER")
                        .title("Health Officer Command Center Active")
                        .message("Disease surveillance, outbreak predictions, and village monitoring streams are fully synchronized.")
                        .type("SYSTEM")
                        .priority("LOW")
                        .village("All Villages")
                        .source("HealthGuard AI System")
                        .isRead(false)
                        .referenceId(sysRef)
                        .referenceType("SYSTEM")
                        .build();

                NotificationEntity saved = notificationRepository.save(sysNotif);
                log.info("[NotificationCreated] ID: {}, Title: {}, RecipientUser: {}, RecipientRole: {}", saved.getId(), saved.getTitle(), saved.getUserId(), saved.getRole());
            }

        } catch (Exception e) {
            log.warn("Error syncing officer notifications: {}", e.getMessage(), e);
        }
    }

    @Override
    @Transactional
    public void createAshaNotificationForReviewAction(com.healthguard.community.entity.DiseaseReport report, String action, String officerName) {
        if (report == null) return;

        String patientName = report.getAffectedPersonName() != null && !report.getAffectedPersonName().isBlank()
                ? report.getAffectedPersonName()
                : (report.getCitizenName() != null && !report.getCitizenName().isBlank() ? report.getCitizenName() : "Patient");

        String upperAction = action != null ? action.trim().toUpperCase() : "VERIFIED";
        String message;
        String title;
        String priority;
        String type;

        if ("VERIFIED".equals(upperAction)) {
            title = "Report Verified";
            message = String.format("Your disease surveillance report for %s has been verified by the Health Officer.", patientName);
            priority = "MEDIUM";
            type = "REPORT_VERIFIED";
        } else if ("ESCALATED".equals(upperAction)) {
            title = "Report Escalated";
            message = String.format("Your disease surveillance report for %s has been escalated for urgent attention.", patientName);
            priority = "CRITICAL";
            type = "REPORT_ESCALATED";
        } else if ("REJECTED".equals(upperAction)) {
            title = "Report Rejected";
            message = String.format("Your disease surveillance report for %s has been rejected and requires correction.", patientName);
            priority = "HIGH";
            type = "REPORT_REJECTED";
        } else {
            title = "Report Reviewed";
            message = String.format("Your disease surveillance report for %s has been reviewed.", patientName);
            priority = "MEDIUM";
            type = "REPORT_REVIEWED";
        }

        Long ashaWorkerId = report.getAshaWorkerId();
        Long targetUserId = null;

        if (ashaWorkerId != null) {
            try {
                List<Long> uIds = jdbcTemplate.queryForList(
                    "SELECT u.id FROM users u JOIN asha_workers aw ON LOWER(TRIM(aw.email)) = LOWER(TRIM(u.email)) WHERE aw.id = ?",
                    Long.class,
                    ashaWorkerId
                );
                if (!uIds.isEmpty() && uIds.get(0) != null) {
                    targetUserId = uIds.get(0);
                }
            } catch (Exception ignored) {}
        }

        if (targetUserId == null && ashaWorkerId != null) {
            targetUserId = ashaWorkerId;
        }
        if (targetUserId == null) {
            targetUserId = 24L;
        }

        NotificationEntity notification = NotificationEntity.builder()
                .userId(targetUserId)
                .role("ASHA_WORKER")
                .title(title)
                .message(message)
                .type(type)
                .priority(priority)
                .isRead(false)
                .referenceId(String.valueOf(report.getReportId()))
                .referenceType("SURVEILLANCE_REVIEW")
                .build();

        notificationRepository.save(notification);
        log.info("ASHA notification created for report ID {} action {} user ID {}", report.getReportId(), upperAction, targetUserId);
    }
}
