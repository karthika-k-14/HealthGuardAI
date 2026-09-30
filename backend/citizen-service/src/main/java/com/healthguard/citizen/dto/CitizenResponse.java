package com.healthguard.citizen.dto;

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
public class CitizenResponse {

    private Long id;
    private Long userId;
    private String fullName;
    private String gender;
    private LocalDate dateOfBirth;
    private String bloodGroup;
    private String mobileNumber;
    private String email;
    private String address;
    private String district;
    private String state;
    private String pincode;
    private String preferredLanguage;
    private String emergencyContactName;
    private String emergencyContactNumber;
    private Double height;
    private Double weight;
    private String allergies;
    private String chronicDiseases;
    private String medicalHistory;
    private Boolean profileCompleted;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public String getPhone() {
        return mobileNumber;
    }

    public String getPhoneNumber() {
        return mobileNumber;
    }

    public String getName() {
        return fullName;
    }

    public Integer getAge() {
        if (dateOfBirth != null) {
            return java.time.Period.between(dateOfBirth, java.time.LocalDate.now()).getYears();
        }
        return 28;
    }
}
