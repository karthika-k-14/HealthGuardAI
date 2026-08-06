package com.healthguard.dto;

import com.healthguard.entity.BloodGroup;
import com.healthguard.entity.Gender;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

/**
 * Fields a citizen may update about their own profile via
 * {@code PUT /citizen/profile}. Registration/identity fields (name, email,
 * phone, Aadhaar) are deliberately not editable here.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CitizenProfileUpdateRequest {

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

    @DecimalMin(value = "0.0", inclusive = false, message = "Height must be greater than 0")
    @DecimalMax(value = "300.0", message = "Height must be realistic (cm)")
    private Double height;

    @DecimalMin(value = "0.0", inclusive = false, message = "Weight must be greater than 0")
    @DecimalMax(value = "500.0", message = "Weight must be realistic (kg)")
    private Double weight;

    private String emergencyContactName;

    @Pattern(regexp = "^[0-9]{10}$", message = "Emergency contact phone must be 10 digits")
    private String emergencyContactPhone;

    private String chronicDiseases;

    private String allergies;

    private String medicalHistory;
}
