package com.healthguard.community.controller;

import com.healthguard.community.dto.ApiResponse;
import com.healthguard.community.entity.NotificationEntity;
import com.healthguard.community.service.NotificationService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    private String resolveEffectiveRole(String headerUserRole, HttpServletRequest request) {
        if (request != null && request.getRequestURI() != null) {
            String uri = request.getRequestURI();
            if (uri.contains("/officer/")) {
                return "HEALTH_OFFICER";
            }
            if (uri.contains("/asha/")) {
                return "ASHA_WORKER";
            }
        }
        if (headerUserRole != null && !headerUserRole.isBlank()) {
            return headerUserRole;
        }
        return "CITIZEN";
    }

    @GetMapping({"/api/notifications", "/api/asha/notifications", "/api/officer/notifications"})
    public ResponseEntity<?> getNotifications(
            @RequestParam(value = "userId", required = false) Long paramUserId,
            @RequestParam(value = "ashaWorkerId", required = false) Long paramAshaWorkerId,
            @RequestHeader(value = "X-User-Id", required = false) String headerUserId,
            @RequestHeader(value = "X-User-Email", required = false) String headerUserEmail,
            @RequestHeader(value = "X-User-Role", required = false) String headerUserRole,
            HttpServletRequest request) {

        Long effectiveUserId = paramUserId;
        if (effectiveUserId == null && headerUserId != null && !headerUserId.isBlank()) {
            try {
                effectiveUserId = Long.valueOf(headerUserId);
            } catch (Exception ignored) {}
        }

        String effectiveRole = resolveEffectiveRole(headerUserRole, request);

        List<NotificationEntity> list = notificationService.getNotificationsForUser(
                effectiveUserId,
                headerUserEmail,
                paramAshaWorkerId,
                effectiveRole
        );

        return ResponseEntity.ok(ApiResponse.success("Notifications retrieved successfully", list));
    }

    @GetMapping({"/api/notifications/unread-count", "/api/asha/notifications/unread-count", "/api/officer/notifications/unread-count"})
    public ResponseEntity<?> getUnreadCount(
            @RequestParam(value = "userId", required = false) Long paramUserId,
            @RequestParam(value = "ashaWorkerId", required = false) Long paramAshaWorkerId,
            @RequestHeader(value = "X-User-Id", required = false) String headerUserId,
            @RequestHeader(value = "X-User-Email", required = false) String headerUserEmail,
            @RequestHeader(value = "X-User-Role", required = false) String headerUserRole,
            HttpServletRequest request) {

        Long effectiveUserId = paramUserId;
        if (effectiveUserId == null && headerUserId != null && !headerUserId.isBlank()) {
            try {
                effectiveUserId = Long.valueOf(headerUserId);
            } catch (Exception ignored) {}
        }

        String effectiveRole = resolveEffectiveRole(headerUserRole, request);

        long unreadCount = notificationService.getUnreadCount(
                effectiveUserId,
                headerUserEmail,
                paramAshaWorkerId,
                effectiveRole
        );

        Map<String, Object> resp = new HashMap<>();
        resp.put("unreadCount", unreadCount);

        return ResponseEntity.ok(ApiResponse.success("Unread count retrieved successfully", resp));
    }

    @GetMapping({"/api/notifications/health-officer/{userId}", "/api/officer/notifications/{userId}"})
    public ResponseEntity<?> getHealthOfficerNotifications(@PathVariable("userId") Long userId) {
        List<NotificationEntity> list = notificationService.getHealthOfficerNotifications(userId);
        return ResponseEntity.ok(ApiResponse.success("Health Officer notifications retrieved successfully", list));
    }

    @GetMapping({"/api/notifications/unread-count/{userId}", "/api/officer/notifications/unread-count/{userId}"})
    public ResponseEntity<?> getHealthOfficerUnreadCount(@PathVariable("userId") Long userId) {
        long count = notificationService.getHealthOfficerUnreadCount(userId);
        Map<String, Object> resp = new HashMap<>();
        resp.put("unreadCount", count);
        return ResponseEntity.ok(ApiResponse.success("Unread count retrieved successfully", resp));
    }

    @PutMapping({"/api/notifications/read/{id}", "/api/officer/notifications/read/{id}"})
    public ResponseEntity<?> markOfficerNotificationAsRead(@PathVariable("id") Long id) {
        NotificationEntity updated = notificationService.markOfficerNotificationAsRead(id);
        return ResponseEntity.ok(ApiResponse.success("Notification marked as read", updated));
    }

    @PutMapping({"/api/notifications/read-all/{userId}", "/api/officer/notifications/read-all/{userId}"})
    public ResponseEntity<?> markAllOfficerNotificationsAsRead(@PathVariable("userId") Long userId) {
        notificationService.markAllOfficerNotificationsAsRead(userId);
        return ResponseEntity.ok(ApiResponse.success("All notifications marked as read", null));
    }

    @PutMapping({"/api/notifications/{id}/read", "/api/asha/notifications/{id}/read", "/api/officer/notifications/{id}/read"})
    public ResponseEntity<?> markAsRead(@PathVariable("id") Long id) {
        NotificationEntity updated = notificationService.markAsRead(id);
        return ResponseEntity.ok(ApiResponse.success("Notification marked as read", updated));
    }

    @PutMapping({"/api/notifications/read-all", "/api/asha/notifications/read-all", "/api/officer/notifications/read-all"})
    public ResponseEntity<?> markAllAsRead(
            @RequestParam(value = "userId", required = false) Long paramUserId,
            @RequestParam(value = "ashaWorkerId", required = false) Long paramAshaWorkerId,
            @RequestHeader(value = "X-User-Id", required = false) String headerUserId,
            @RequestHeader(value = "X-User-Email", required = false) String headerUserEmail,
            @RequestHeader(value = "X-User-Role", required = false) String headerUserRole,
            HttpServletRequest request) {

        Long effectiveUserId = paramUserId;
        if (effectiveUserId == null && headerUserId != null && !headerUserId.isBlank()) {
            try {
                effectiveUserId = Long.valueOf(headerUserId);
            } catch (Exception ignored) {}
        }

        String effectiveRole = resolveEffectiveRole(headerUserRole, request);

        notificationService.markAllAsRead(
                effectiveUserId,
                headerUserEmail,
                paramAshaWorkerId,
                effectiveRole
        );

        return ResponseEntity.ok(ApiResponse.success("All notifications marked as read", null));
    }

    @DeleteMapping({"/api/notifications/{id}", "/api/asha/notifications/{id}", "/api/officer/notifications/{id}"})
    public ResponseEntity<?> deleteNotification(@PathVariable("id") Long id) {
        notificationService.deleteNotification(id);
        return ResponseEntity.ok(ApiResponse.success("Notification deleted successfully", null));
    }
}
