package com.healthguard.dto;

import com.healthguard.entity.BloodGroup;
import com.healthguard.entity.Gender;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

/**
 * Fields collected on the "Complete Profile" step, shown once after a
 * user's first successful login if their profile isn't complete yet.
 * <p>
 * The citizen-specific fields (height, weight, emergency contact, medical
 * history) are simply ignored for staff roles.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ProfileCompleteRequest {

    private Gender gender;

    @Past(message = "Date of birth must be in the past")
    private LocalDate dateOfBirth;

    private BloodGroup bloodGroup;

    private String address;

    private String district;

    private String state;

    @Pattern(regexp = "^[0-9]{6}$", message = "Pincode must be 6 digits")
    private String pincode;

    private String preferredLanguage;

    private Double latitude;

    private Double longitude;

    private String profilePhoto;

    // Citizen-specific - ignored for staff roles
    private Double height;
    private Double weight;
    private String emergencyContactName;
    private String emergencyContactPhone;
    private String chronicDiseases;
    private String allergies;
    private String medicalHistory;
}
