package com.healthguard.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request body for {@code PUT /officer/phcs/{phcId}}. A Health Officer may
 * update a PHC's descriptive/contact details, but not which village it
 * belongs to - reassigning a PHC to a different village is out of scope
 * for this module.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OfficerPhcUpdateRequest {

    @NotBlank(message = "PHC name is required")
    private String name;

    private String address;

    private String district;

    @Pattern(regexp = "^$|^[0-9]{6,15}$", message = "Phone number must be 6-15 digits")
    private String phone;

    private Double latitude;

    private Double longitude;
}
