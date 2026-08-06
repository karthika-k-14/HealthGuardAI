package com.healthguard.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request body for {@code POST /citizen/scheme-applications} - a citizen
 * applying for a {@link com.healthguard.entity.Scheme}.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SchemeApplicationRequest {

    @NotNull(message = "Scheme id is required")
    private Long schemeId;
}
