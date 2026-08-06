package com.healthguard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * A village as returned by {@code GET /admin/villages} - a minimal,
 * read-only listing used to populate the "Send to Village" target picker
 * on the Broadcast Notification page. Not a full Village CRUD module.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VillageResponse {

    private Long id;
    private UUID uuid;
    private String villageName;
    private String district;
    private String state;
    private Long population;
}
