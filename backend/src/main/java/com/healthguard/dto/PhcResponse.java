package com.healthguard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * A PHC as returned by the PHC CRUD endpoints ({@code /admin/phcs/**}).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PhcResponse {

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

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
