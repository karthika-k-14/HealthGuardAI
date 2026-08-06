package com.healthguard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Filter request parameters for report generation endpoints.
 * Supports filtering by Date, Village, PHC, Hospital, District, Health Officer, and ASHA Worker.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReportFilterRequest {

    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
    private LocalDateTime startDate;

    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
    private LocalDateTime endDate;

    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private LocalDate date;

    private Integer year;

    private Long villageId;
    private String villageName;

    private Long phcId;
    private String phcName;

    private Long hospitalId;
    private String hospitalName;

    private String district;

    private Long healthOfficerId;
    private Long officerId;

    private Long ashaWorkerId;
    private Long ashaId;

    public Long getEffectiveHealthOfficerId() {
        return healthOfficerId != null ? healthOfficerId : officerId;
    }

    public Long getEffectiveAshaWorkerId() {
        return ashaWorkerId != null ? ashaWorkerId : ashaId;
    }
}
