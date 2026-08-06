package com.healthguard.controller;

import com.healthguard.dto.ReferralTrackingResponse;
import com.healthguard.dto.WorkflowAssignRequest;
import com.healthguard.dto.WorkflowCreateRequest;
import com.healthguard.dto.WorkflowHistoryResponse;
import com.healthguard.dto.WorkflowResponse;
import com.healthguard.dto.WorkflowStatusUpdateRequest;
import com.healthguard.service.WorkflowService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Controller exposing REST APIs for Workflow Case Management, Assignment, Referral Tracking, and History.
 */
@RestController
@RequestMapping("/workflows")
@RequiredArgsConstructor
@Tag(name = "Workflows", description = "Workflow Case Management, Assignment & Referral Tracking REST APIs")
public class WorkflowController {

    private final WorkflowService workflowService;

    @PostMapping
    @Operation(summary = "Create Workflow", description = "Creates a new workflow case in the health system.")
    public ResponseEntity<WorkflowResponse> createWorkflow(@Valid @RequestBody WorkflowCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(workflowService.createWorkflow(request));
    }

    @PutMapping("/{id}/status")
    @Operation(summary = "Update Workflow Status", description = "Updates the operational status of an existing workflow case.")
    public ResponseEntity<WorkflowResponse> updateStatus(@PathVariable Long id,
                                                         @Valid @RequestBody WorkflowStatusUpdateRequest request) {
        return ResponseEntity.ok(workflowService.updateStatus(id, request));
    }

    @PutMapping("/{id}/assign")
    @Operation(summary = "Case Assignment", description = "Assigns a workflow case to a specific worker, officer, or facility.")
    public ResponseEntity<WorkflowResponse> assignCase(@PathVariable Long id,
                                                       @Valid @RequestBody WorkflowAssignRequest request) {
        return ResponseEntity.ok(workflowService.assignCase(id, request));
    }

    @GetMapping("/referral/{referralId}")
    @Operation(summary = "Referral Tracking", description = "Tracks workflow cases associated with a specific referral.")
    public ResponseEntity<ReferralTrackingResponse> trackReferral(@PathVariable Long referralId) {
        return ResponseEntity.ok(workflowService.trackReferral(referralId));
    }

    @GetMapping("/{id}/history")
    @Operation(summary = "Workflow History", description = "Returns the complete execution and status update history log of a workflow case.")
    public ResponseEntity<WorkflowHistoryResponse> getWorkflowHistory(@PathVariable Long id) {
        return ResponseEntity.ok(workflowService.getWorkflowHistory(id));
    }

    @GetMapping("/pending")
    @Operation(summary = "Pending Cases", description = "Returns all pending or active workflow cases requiring attention.")
    public ResponseEntity<List<WorkflowResponse>> getPendingCases() {
        return ResponseEntity.ok(workflowService.getPendingCases());
    }

    @GetMapping("/completed")
    @Operation(summary = "Completed Cases", description = "Returns all resolved or completed workflow cases.")
    public ResponseEntity<List<WorkflowResponse>> getCompletedCases() {
        return ResponseEntity.ok(workflowService.getCompletedCases());
    }

    @GetMapping
    @Operation(summary = "Get All Workflows", description = "Returns all workflow cases in the system.")
    public ResponseEntity<List<WorkflowResponse>> getAllWorkflows() {
        return ResponseEntity.ok(workflowService.getAllWorkflows());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get Workflow by ID", description = "Returns a single workflow case by its primary ID.")
    public ResponseEntity<WorkflowResponse> getWorkflowById(@PathVariable Long id) {
        return ResponseEntity.ok(workflowService.getWorkflowById(id));
    }
}
