package com.healthguard.community.dto;

import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdatePHCRequest {

    private String name;

    private String district;

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
