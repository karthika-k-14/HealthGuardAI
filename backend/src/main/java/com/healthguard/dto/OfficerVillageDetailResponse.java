package com.healthguard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

/**
 * Full detail returned by {@code GET /officer/villages/{villageId}} -
 * the village's own stats plus the ASHA workers and PHCs based there.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OfficerVillageDetailResponse {

    private Long id;
    private UUID uuid;
    private String villageName;
    private String district;
    private String state;
    private Long population;
    private Double latitude;
    private Double longitude;

    private long citizenCount;
    private long highRiskCitizenCount;

    private List<OfficerAshaWorkerResponse> ashaWorkers;
    private List<OfficerPhcResponse> phcs;
}
