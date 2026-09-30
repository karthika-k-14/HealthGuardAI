package com.healthguard.admin.healthofficer.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HealthOfficerResponse {

    private Long id;
    private String officerId;
    private String fullName;
    private String email;
    private String mobileNumber;
    private String district;
    private String designation;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
