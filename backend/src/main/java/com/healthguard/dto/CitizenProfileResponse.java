package com.healthguard.dto;

import com.healthguard.entity.AccountStatus;
import com.healthguard.entity.BloodGroup;
import com.healthguard.entity.Gender;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.UUID;

/**
 * Full citizen profile returned by {@code GET /citizen/profile}. A superset
 * of {@link UserSummaryResponse} - includes every field a citizen can view
 * or edit about themselves, but still excludes the password and any other
 * sensitive internal fields.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CitizenProfileResponse {

    private Long id;
    private UUID uuid;

    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private Gender gender;
    private LocalDate dateOfBirth;
    private Integer age;
    private BloodGroup bloodGroup;
    private String aadhaarNumber;
    private String preferredLanguage;

    private String address;
    private String district;
    private String state;
    private String pincode;
    private Double latitude;
    private Double longitude;
    private String profilePhoto;

    private Double height;
    private Double weight;
    private Double bmi;
    private String emergencyContactName;
    private String emergencyContactPhone;
    private String chronicDiseases;
    private String allergies;
    private String medicalHistory;

    private String villageName;

    private AccountStatus accountStatus;
    private Boolean profileCompleted;
}
