package com.healthguard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Standardized total count response DTO for individual entity count APIs.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TotalCountResponse {

    private String entityName;
    private long count;
}
