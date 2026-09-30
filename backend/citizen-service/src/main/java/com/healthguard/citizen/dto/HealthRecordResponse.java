package com.healthguard.citizen.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HealthRecordResponse {

    private Long id;
    private Long userId;
    private String recordType;
    private String title;
    private String description;
    private String doctorName;
    private String hospitalName;
    private LocalDate recordDate;
    private String attachmentUrl;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
