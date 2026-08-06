package com.healthguard.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Request body for creating or updating an
 * {@link com.healthguard.entity.EmergencyContact} under the authenticated
 * citizen's household.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class EmergencyContactRequest {

    @NotBlank(message = "Name is required")
    private String name;

    @NotBlank(message = "Relationship is required")
    private String relationship;

    @NotBlank(message = "Phone number is required")
    @Pattern(regexp = "^[0-9]{10}$", message = "Phone number must be 10 digits")
    private String phone;

    @Pattern(regexp = "^[0-9]{10}$", message = "Alternate phone number must be 10 digits")
    private String alternatePhone;

    @Email(message = "Email must be valid")
    private String email;

    private String address;

    private Boolean isPrimary;
}
