package com.healthguard.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

/**
 * Admin-only: assigns a Health Officer to a district and the villages they
 * oversee within it.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AssignOfficerRequest {

    @NotBlank(message = "District is required")
    private String district;

    private List<Long> villageIds;
}
