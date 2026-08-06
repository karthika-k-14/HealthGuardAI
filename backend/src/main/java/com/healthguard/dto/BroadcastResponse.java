package com.healthguard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Result of {@code POST /admin/notifications/broadcast} - a summary rather
 * than the full list of created notifications, since a broadcast can reach
 * a large number of recipients at once.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BroadcastResponse {

    private BroadcastTargetType targetType;

    /** Human-readable description of who was targeted, e.g. "ASHA_WORKER", a village name, or a PHC name. */
    private String targetLabel;

    private int recipientCount;

    private String title;
    private String message;
    private String type;
    private String category;

    private LocalDateTime sentAt;
}
