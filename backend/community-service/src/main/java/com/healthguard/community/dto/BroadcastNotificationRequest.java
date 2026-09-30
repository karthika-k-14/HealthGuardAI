package com.healthguard.community.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BroadcastNotificationRequest {

    private String title;
    private String message;

    /**
     * Target role: CITIZEN or ASHA_WORKER
     */
    private String role;

    /**
     * Village name — optional. If provided, notification is sent only to users
     * in that village. Matched case-insensitively and trimmed on backend.
     */
    private String village;

    private String category;

    /**
     * Notification type: info, warning, emergency
     */
    private String notificationType;

    // ---- Legacy fields kept for backward compat only, not used in new logic ----
    @Deprecated private String targetType;
    @Deprecated private String targetValue;
    @Deprecated private String scope;
}
