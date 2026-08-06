package com.healthguard.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Request body for {@code POST /admin/schemes} and
 * {@code PUT /admin/schemes/{schemeId}}.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SchemeRequest {

    @NotBlank(message = "Scheme name is required")
    private String name;

    private String description;

    private String category;

    private String eligibility;

    private String applyUrl;

    private List<String> benefits;
}
