package com.healthguard.dto;

/**
 * Who a broadcast notification is aimed at, for {@code POST
 * /admin/notifications/broadcast}. Exactly one of the corresponding id
 * fields on {@link BroadcastRequest} must be supplied depending on this
 * value:
 * <ul>
 *   <li>{@code ROLE} - every active user with {@link com.healthguard.entity.Role} {@code role}</li>
 *   <li>{@code VILLAGE} - every active Citizen/ASHA Worker based in village {@code villageId}</li>
 *   <li>{@code PHC} - every active ASHA Worker assigned to PHC {@code phcId}</li>
 * </ul>
 */
public enum BroadcastTargetType {
    ROLE,
    VILLAGE,
    PHC
}
