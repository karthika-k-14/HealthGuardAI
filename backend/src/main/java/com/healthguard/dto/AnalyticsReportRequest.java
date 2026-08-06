package com.healthguard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Request DTO for custom range analytics reports.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnalyticsReportRequest {

    private LocalDateTime startDate;
    private LocalDateTime endDate;
}
