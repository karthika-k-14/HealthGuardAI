package com.healthguard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * A hospital as returned by the Hospital CRUD endpoints
 * ({@code /admin/hospitals/**}).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HospitalResponse {

    private Long id;
    private UUID uuid;
    private String name;
    private String type;
    private String address;
    private String district;
    private String phone;
    private Double latitude;
    private Double longitude;
    private Integer beds;
    private Boolean emergencyServices;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
