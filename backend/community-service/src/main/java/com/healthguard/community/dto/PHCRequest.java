package com.healthguard.community.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PHCRequest {

    @NotBlank(message = "PHC Code is required")
    @Size(min = 3, max = 30, message = "PHC Code must be between 3 and 30 characters")
    private String phcCode;

    @NotBlank(message = "PHC Name is required")
    private String name;

    @NotBlank(message = "District is required")
    private String district;

    @NotBlank(message = "Address is required")
    private String address;

    private Double latitude;

    private Double longitude;

    @Pattern(regexp = "^[0-9]{10}$", message = "Contact number must be a valid 10-digit number")
    private String contactNumber;

    private String medicalOfficer;

    private Integer totalBeds;

    private Integer availableBeds;

    private Integer icuBeds;

    private Integer availableIcuBeds;

    private Integer ambulances;
}
