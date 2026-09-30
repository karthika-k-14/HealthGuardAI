package com.healthguard.community.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PHCResponse {

    private Long id;
    private String phcCode;
    private String name;
    private String district;
    private String address;
    private Double latitude;
    private Double longitude;
    private String contactNumber;
    private String medicalOfficer;
    private Integer totalBeds;
    private Integer availableBeds;
    private Integer icuBeds;
    private Integer availableIcuBeds;
    private Integer ambulances;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
