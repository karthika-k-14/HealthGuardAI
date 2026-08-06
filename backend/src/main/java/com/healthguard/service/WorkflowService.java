package com.healthguard.service;

import com.healthguard.dto.ReferralTrackingResponse;
import com.healthguard.dto.WorkflowAssignRequest;
import com.healthguard.dto.WorkflowCreateRequest;
import com.healthguard.dto.WorkflowHistoryResponse;
import com.healthguard.dto.WorkflowResponse;
import com.healthguard.dto.WorkflowStatusUpdateRequest;
import com.healthguard.entity.Referral;
import com.healthguard.entity.Workflow;
import com.healthguard.entity.WorkflowStatus;
import com.healthguard.exception.ResourceNotFoundException;
import com.healthguard.repository.ReferralRepository;
import com.healthguard.repository.WorkflowRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Service managing workflow case creation, status tracking, case assignments, referral tracking, and history logs.
 */
@Service
@RequiredArgsConstructor
@Transactional
public class WorkflowService {

    private final WorkflowRepository workflowRepository;
    private final ReferralRepository referralRepository;

    private static final DateTimeFormatter LOG_DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    public WorkflowResponse createWorkflow(WorkflowCreateRequest request) {
        String caseNum = (request.getCaseNumber() != null && !request.getCaseNumber().trim().isEmpty())
                ? request.getCaseNumber()
                : "CASE-" + System.currentTimeMillis();

        LocalDateTime now = LocalDateTime.now();
        String initialLog = "[" + now.format(LOG_DATE_FORMATTER) + "] Case created with status PENDING."
                + (request.getNotes() != null ? " Notes: " + request.getNotes() : "");

        Workflow workflow = Workflow.builder()
                .caseNumber(caseNum)
                .title(request.getTitle())
                .description(request.getDescription())
                .category(request.getCategory())
                .citizenId(request.getCitizenId())
                .citizenName(request.getCitizenName())
                .referralId(request.getReferralId())
                .assignedTo(request.getAssignedTo())
                .assignedRole(request.getAssignedRole())
                .assignedBy(request.getAssignedBy())
                .facilityName(request.getFacilityName())
                .priority(request.getPriority() != null ? request.getPriority() : "MEDIUM")
                .status(WorkflowStatus.PENDING)
                .notes(request.getNotes())
                .historyLog(initialLog)
                .build();

        Workflow saved = workflowRepository.save(workflow);
        return mapToResponse(saved);
    }

    public WorkflowResponse updateStatus(Long id, WorkflowStatusUpdateRequest request) {
        Workflow workflow = workflowRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Workflow case not found with id: " + id));

        WorkflowStatus oldStatus = workflow.getStatus();
        WorkflowStatus newStatus = request.getStatus();
        LocalDateTime now = LocalDateTime.now();

        String actor = request.getUpdatedBy() != null ? request.getUpdatedBy() : "System";
        String logEntry = "\n[" + now.format(LOG_DATE_FORMATTER) + "] Status changed from "
                + oldStatus + " to " + newStatus + " by " + actor + "."
                + (request.getNotes() != null ? " Notes: " + request.getNotes() : "");

        workflow.setStatus(newStatus);
        if (request.getNotes() != null && !request.getNotes().trim().isEmpty()) {
            workflow.setNotes(request.getNotes());
        }
        workflow.setHistoryLog((workflow.getHistoryLog() != null ? workflow.getHistoryLog() : "") + logEntry);

        if (newStatus == WorkflowStatus.COMPLETED) {
            workflow.setCompletedAt(now);
        }

        Workflow updated = workflowRepository.save(workflow);
        return mapToResponse(updated);
    }

    public WorkflowResponse assignCase(Long id, WorkflowAssignRequest request) {
        Workflow workflow = workflowRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Workflow case not found with id: " + id));

        LocalDateTime now = LocalDateTime.now();
        String assigner = request.getAssignedBy() != null ? request.getAssignedBy() : "Admin/System";
        String logEntry = "\n[" + now.format(LOG_DATE_FORMATTER) + "] Case assigned to "
                + request.getAssignedTo() + " (" + (request.getAssignedRole() != null ? request.getAssignedRole() : "Staff") + ")"
                + " by " + assigner + "."
                + (request.getNotes() != null ? " Notes: " + request.getNotes() : "");

        workflow.setAssignedTo(request.getAssignedTo());
        if (request.getAssignedRole() != null) workflow.setAssignedRole(request.getAssignedRole());
        if (request.getAssignedBy() != null) workflow.setAssignedBy(request.getAssignedBy());
        if (request.getFacilityName() != null) workflow.setFacilityName(request.getFacilityName());

        if (workflow.getStatus() == WorkflowStatus.PENDING) {
            workflow.setStatus(WorkflowStatus.IN_PROGRESS);
        }

        workflow.setHistoryLog((workflow.getHistoryLog() != null ? workflow.getHistoryLog() : "") + logEntry);

        Workflow updated = workflowRepository.save(workflow);
        return mapToResponse(updated);
    }

    @Transactional(readOnly = true)
    public ReferralTrackingResponse trackReferral(Long referralId) {
        Referral referral = referralRepository.findById(referralId).orElse(null);

        List<Workflow> workflows = workflowRepository.findByReferralId(referralId);
        List<WorkflowResponse> workflowResponses = workflows.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());

        return ReferralTrackingResponse.builder()
                .referralId(referralId)
                .citizenName(referral != null ? referral.getCitizenName() : "Unknown Citizen")
                .referredBy(referral != null ? referral.getReferredBy() : null)
                .fromFacility(referral != null ? referral.getFromFacility() : null)
                .toFacility(referral != null ? referral.getToFacility() : null)
                .referralReason(referral != null ? referral.getReason() : null)
                .referralStatus(referral != null ? referral.getStatus() : "ACTIVE")
                .associatedWorkflows(workflowResponses)
                .build();
    }

    @Transactional(readOnly = true)
    public WorkflowHistoryResponse getWorkflowHistory(Long id) {
        Workflow workflow = workflowRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Workflow case not found with id: " + id));

        return WorkflowHistoryResponse.builder()
                .workflowId(workflow.getId())
                .caseNumber(workflow.getCaseNumber())
                .title(workflow.getTitle())
                .currentStatus(workflow.getStatus())
                .currentAssignee(workflow.getAssignedTo())
                .historyTimeline(workflow.getHistoryLog())
                .createdAt(workflow.getCreatedAt())
                .lastUpdatedAt(workflow.getUpdatedAt())
                .build();
    }

    @Transactional(readOnly = true)
    public List<WorkflowResponse> getPendingCases() {
        List<WorkflowStatus> pendingStatuses = Arrays.asList(
                WorkflowStatus.PENDING, WorkflowStatus.IN_PROGRESS, WorkflowStatus.REFERRED
        );
        return workflowRepository.findByStatusIn(pendingStatuses).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<WorkflowResponse> getCompletedCases() {
        return workflowRepository.findByStatus(WorkflowStatus.COMPLETED).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<WorkflowResponse> getAllWorkflows() {
        return workflowRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public WorkflowResponse getWorkflowById(Long id) {
        Workflow workflow = workflowRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Workflow case not found with id: " + id));
        return mapToResponse(workflow);
    }

    private WorkflowResponse mapToResponse(Workflow workflow) {
        return WorkflowResponse.builder()
                .id(workflow.getId())
                .uuid(workflow.getUuid())
                .caseNumber(workflow.getCaseNumber())
                .title(workflow.getTitle())
                .description(workflow.getDescription())
                .category(workflow.getCategory())
                .citizenId(workflow.getCitizenId())
                .citizenName(workflow.getCitizenName())
                .referralId(workflow.getReferralId())
                .assignedTo(workflow.getAssignedTo())
                .assignedRole(workflow.getAssignedRole())
                .assignedBy(workflow.getAssignedBy())
                .facilityName(workflow.getFacilityName())
                .priority(workflow.getPriority())
                .status(workflow.getStatus())
                .notes(workflow.getNotes())
                .createdAt(workflow.getCreatedAt())
                .updatedAt(workflow.getUpdatedAt())
                .completedAt(workflow.getCompletedAt())
                .build();
    }
}
