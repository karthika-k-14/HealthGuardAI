package com.healthguard.controller;

import com.healthguard.dto.BroadcastRequest;
import com.healthguard.dto.BroadcastResponse;
import com.healthguard.dto.NotificationResponse;
import com.healthguard.dto.SendNotificationRequest;
import com.healthguard.security.UserPrincipal;
import com.healthguard.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Notification CRUD endpoints.
 * <p>
 * Reads/updates on one's own notifications ({@code /notifications/**}) are
 * not under "/admin/**", "/citizen/**", etc. so they fall to the
 * "anyRequest().authenticated()" rule in {@code SecurityConfig} - reachable
 * by any authenticated role. Sending ({@code /admin/notifications}) is
 * covered by the existing "/admin/**" -&gt; ROLE_ADMIN matcher.
 */
@RestController
@RequiredArgsConstructor
@Tag(name = "Notifications", description = "Send, list, mark read, and delete in-app notifications")
public class NotificationController {

    private final NotificationService notificationService;

    @PostMapping("/admin/notifications")
    @Operation(summary = "Send a notification to a user, or broadcast to every active user of a role")
    public ResponseEntity<List<NotificationResponse>> send(@AuthenticationPrincipal UserPrincipal principal,
                                                             @Valid @RequestBody SendNotificationRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(notificationService.send(principal.getUser(), request));
    }

    @PostMapping("/admin/notifications/broadcast")
    @Operation(summary = "Broadcast Notification",
            description = "Send one notification to every active user of a role, village, or PHC.")
    public ResponseEntity<BroadcastResponse> broadcast(@AuthenticationPrincipal UserPrincipal principal,
                                                          @Valid @RequestBody BroadcastRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(notificationService.broadcast(principal.getUser(), request));
    }

    @GetMapping("/notifications")
    @Operation(summary = "List the authenticated user's own notifications")
    public ResponseEntity<List<NotificationResponse>> getMyNotifications(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(notificationService.getMyNotifications(principal.getUser()));
    }

    @PutMapping("/notifications/{notificationId}/read")
    @Operation(summary = "Mark one of the authenticated user's own notifications as read")
    public ResponseEntity<NotificationResponse> markRead(@AuthenticationPrincipal UserPrincipal principal,
                                                           @PathVariable Long notificationId) {
        return ResponseEntity.ok(notificationService.markRead(principal.getUser(), notificationId));
    }

    @DeleteMapping("/notifications/{notificationId}")
    @Operation(summary = "Delete one of the authenticated user's own notifications")
    public ResponseEntity<Void> deleteNotification(@AuthenticationPrincipal UserPrincipal principal,
                                                     @PathVariable Long notificationId) {
        notificationService.deleteNotification(principal.getUser(), notificationId);
        return ResponseEntity.noContent().build();
    }
}
