package com.healthguard.dto;

import com.healthguard.entity.WorkflowStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Response DTO for workflow case history timeline.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkflowHistoryResponse {

    private Long workflowId;
    private String caseNumber;
    private String title;
    private WorkflowStatus currentStatus;
    private String currentAssignee;
    private String historyTimeline;
    private LocalDateTime createdAt;
    private LocalDateTime lastUpdatedAt;
}
