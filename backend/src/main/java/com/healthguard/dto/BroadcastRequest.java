package com.healthguard.dto;

import com.healthguard.entity.Role;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request body for {@code POST /admin/notifications/broadcast} - sending
 * one notification to every active user matching a target:
 * <ul>
 *   <li>{@code targetType == ROLE}: requires {@code role}</li>
 *   <li>{@code targetType == VILLAGE}: requires {@code villageId}</li>
 *   <li>{@code targetType == PHC}: requires {@code phcId}</li>
 * </ul>
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BroadcastRequest {

    @NotNull(message = "targetType is required")
    private BroadcastTargetType targetType;

    /** Required when targetType == ROLE. */
    private Role role;

    /** Required when targetType == VILLAGE. */
    private Long villageId;

    /** Required when targetType == PHC. */
    private Long phcId;

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Message is required")
    private String message;

    /** e.g. "info", "alert", "success", "emergency". Defaults to "info". */
    private String type;

    private String category;
}
