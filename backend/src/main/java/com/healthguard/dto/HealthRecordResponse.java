package com.healthguard.dto;

import com.healthguard.entity.HealthRecordType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HealthRecordResponse {

    private Long id;
    private UUID uuid;
    private HealthRecordType recordType;
    private String title;
    private String description;
    private String doctorName;
    private String hospitalName;
    private LocalDate recordDate;
    private String attachmentUrl;
    private LocalDateTime createdAt;
}
