package com.healthguard.community.dto;

import com.healthguard.community.entity.EmergencyAlertTimeline;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmergencyAlertDTO {
    private Long id;
    private Long citizenId;
    private String citizenName;
    private Long assignedAshaWorkerId;
    private String assignedAshaWorkerName;
    private String symptoms;
    private String diseaseCategory;
    private String urgencyLevel;
    private Double urgencyScore;
    private String village;
    private String district;
    private String status;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<EmergencyAlertTimeline> timeline;
}
