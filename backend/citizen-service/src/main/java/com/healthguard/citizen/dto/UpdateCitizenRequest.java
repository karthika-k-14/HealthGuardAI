package com.healthguard.citizen.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateCitizenRequest {

    @Size(min = 2, max = 100, message = "Full name must be between 2 and 100 characters")
    private String fullName;

    private String gender;

    @Past(message = "Date of birth must be in the past")
    private LocalDate dateOfBirth;

    @Pattern(regexp = "^$|^(A|B|AB|O)[+-]$", message = "Invalid blood group (e.g. A+, B-, O+, AB+)")
    private String bloodGroup;

    @Pattern(regexp = "^$|^[0-9]{10}$", message = "Mobile number must be a valid 10-digit number")
    private String mobileNumber;

    @Email(message = "Email must be a valid email address")
    private String email;

    private String address;

    private String district;

    private String state;

    @Pattern(regexp = "^$|^[0-9]{6}$", message = "Pincode must be a 6-digit number")
    private String pincode;

    private String preferredLanguage;

    private String emergencyContactName;

    @Pattern(regexp = "^$|^[0-9]{10}$", message = "Emergency contact number must be a valid 10-digit number")
    private String emergencyContactNumber;


    private Double height;
    private Double weight;
    private String allergies;
    private String chronicDiseases;
    private String medicalHistory;
}
