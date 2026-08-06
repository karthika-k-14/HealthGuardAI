package com.healthguard.dto;

import com.healthguard.entity.Role;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request body for {@code POST /admin/notifications} - sending a
 * notification either to one specific user ({@code recipientUserId}) or, as
 * a broadcast, to every active user of a given {@code role}. Exactly one of
 * the two must be supplied.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SendNotificationRequest {

    private Long recipientUserId;

    private Role role;

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Message is required")
    private String message;

    /** e.g. "info", "alert", "success", "emergency". Defaults to "info". */
    private String type;

    private String category;
}
