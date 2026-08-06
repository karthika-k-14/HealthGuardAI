package com.healthguard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * A village returned by {@code GET /officer/villages} - one of possibly
 * several villages supervised by the authenticated Health Officer.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OfficerVillageResponse {

    private Long id;
    private UUID uuid;
    private String villageName;
    private String district;
    private String state;
    private Long population;
    private Double latitude;
    private Double longitude;

    private long citizenCount;
    private long ashaWorkerCount;
    private long phcCount;
}
