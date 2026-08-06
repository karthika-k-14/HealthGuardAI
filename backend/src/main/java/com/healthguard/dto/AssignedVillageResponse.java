package com.healthguard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * A village returned by {@code GET /asha/villages}. An ASHA worker is
 * assigned to exactly one village ({@code AshaWorker.assignedVillage}), so
 * this list currently ever contains zero (not yet assigned) or one entry -
 * it is still shaped as a list to match how the frontend/other roles
 * (e.g. Health Officer, who oversees several villages) consume village
 * data, and so it extends cleanly if an ASHA worker is ever assigned more
 * than one village in a future phase.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AssignedVillageResponse {

    private Long id;
    private UUID uuid;
    private String villageName;
    private String district;
    private String state;
    private Long population;
    private long assignedCitizenCount;
}
