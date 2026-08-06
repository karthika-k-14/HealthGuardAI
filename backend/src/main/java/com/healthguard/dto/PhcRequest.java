package com.healthguard.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request body for {@code POST /admin/phcs} and
 * {@code PUT /admin/phcs/{phcId}}.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PhcRequest {

    @NotBlank(message = "PHC name is required")
    private String name;

    private String address;

    private String district;

    @Pattern(regexp = "^$|^[0-9]{6,15}$", message = "Phone number must be 6-15 digits")
    private String phone;

    private Double latitude;

    private Double longitude;

    /** Optional - the village this PHC belongs to. */
    private Long villageId;
}
