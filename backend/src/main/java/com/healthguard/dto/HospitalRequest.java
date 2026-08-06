package com.healthguard.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request body for {@code POST /admin/hospitals} and
 * {@code PUT /admin/hospitals/{hospitalId}}.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HospitalRequest {

    @NotBlank(message = "Hospital name is required")
    private String name;

    private String type;

    private String address;

    private String district;

    @Pattern(regexp = "^$|^[0-9]{6,15}$", message = "Phone number must be 6-15 digits")
    private String phone;

    private Double latitude;

    private Double longitude;

    @Min(value = 0, message = "Beds cannot be negative")
    private Integer beds;

    private Boolean emergencyServices;

    private String status;
}
