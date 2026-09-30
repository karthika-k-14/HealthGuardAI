package com.healthguard.citizen.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HealthRecordRequest {

    private Long userId;
    private String recordType;
    private String title;
    private String description;
    private String doctorName;
    private String hospitalName;
    private LocalDate recordDate;
    private String attachmentUrl;
}
