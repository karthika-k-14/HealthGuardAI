package com.healthguard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * A PHC returned by {@code GET /officer/phcs} and
 * {@code GET /officer/phcs/{phcId}} - scoped to PHCs located in a village
 * under the authenticated Health Officer's supervision.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OfficerPhcResponse {

    private Long id;
    private UUID uuid;
    private String name;
    private String address;
    private String district;
    private String phone;
    private Double latitude;
    private Double longitude;

    private Long villageId;
    private String villageName;

    private long ashaWorkerCount;
}
