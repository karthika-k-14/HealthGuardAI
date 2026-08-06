package com.healthguard.dto;

import com.healthguard.entity.WorkflowStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for updating workflow status.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkflowStatusUpdateRequest {

    @NotNull(message = "Status is required")
    private WorkflowStatus status;

    private String updatedBy;
    private String notes;
}
