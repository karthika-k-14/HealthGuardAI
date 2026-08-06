package com.healthguard.dto;

import com.healthguard.entity.SchemeApplicationStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * A scheme application as returned by the Scheme Beneficiary Management
 * endpoints ({@code /citizen/scheme-applications/**},
 * {@code /admin/scheme-applications/**}).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SchemeApplicationResponse {

    private Long id;
    private UUID uuid;

    private Long schemeId;
    private String schemeName;
    private String schemeCategory;

    private Long citizenId;
    private String citizenName;
    private String citizenPhone;

    private SchemeApplicationStatus status;
    private String remarks;

    private LocalDateTime appliedAt;
    private LocalDateTime reviewedAt;
}
