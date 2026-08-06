package com.healthguard.dto;

import com.healthguard.entity.WorkflowStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Response DTO for workflow case details.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkflowResponse {

    private Long id;
    private UUID uuid;
    private String caseNumber;
    private String title;
    private String description;
    private String category;

    private Long citizenId;
    private String citizenName;
    private Long referralId;

    private String assignedTo;
    private String assignedRole;
    private String assignedBy;
    private String facilityName;

    private String priority;
    private WorkflowStatus status;
    private String notes;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime completedAt;
}
