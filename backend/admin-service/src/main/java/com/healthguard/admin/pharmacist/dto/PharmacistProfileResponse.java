package com.healthguard.admin.pharmacist.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PharmacistProfileResponse {

    private Long id;
    private String pharmacistId;
    private String fullName;
    private String email;
    private String phoneNumber;
    private String pharmacyName;
    private String licenseNumber;
    private String licenseIssuedBy;
    private LocalDate licenseExpiryDate;
    private Integer yearsOfExperience;
    private String specialization;
    private String address;
    private String village;
    private String district;
    private String status;
    private String role;
    private Long prescriptionsVerified;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
