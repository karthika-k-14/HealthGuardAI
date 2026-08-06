package com.healthguard.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for creating a new workflow case.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkflowCreateRequest {

    @NotBlank(message = "Title is required")
    private String title;

    private String description;
    private String category;
    private String caseNumber;

    private Long citizenId;
    private String citizenName;
    private Long referralId;

    private String assignedTo;
    private String assignedRole;
    private String assignedBy;
    private String facilityName;

    private String priority;
    private String notes;
}
