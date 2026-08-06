package com.healthguard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * A notification as returned by the Notification CRUD endpoints
 * ({@code /notifications/**}, {@code /admin/notifications}).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationResponse {

    private Long id;
    private UUID uuid;

    private Long recipientUserId;
    private String recipientName;

    private Long senderUserId;
    private String senderName;

    private String title;
    private String message;
    private String type;
    private String category;

    private boolean read;

    private LocalDateTime createdAt;
    private LocalDateTime readAt;
}
