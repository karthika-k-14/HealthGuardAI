package com.healthguard.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for assigning a workflow case.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkflowAssignRequest {

    @NotBlank(message = "Assigned recipient is required")
    private String assignedTo;

    private String assignedRole;
    private String assignedBy;
    private String facilityName;
    private String notes;
}
