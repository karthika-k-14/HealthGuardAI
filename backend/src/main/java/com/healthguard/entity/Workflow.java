package com.healthguard.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.time.LocalDateTime;

/**
 * Entity representing a health system workflow case, tracking case assignment, status progression,
 * referral linkage, and audit history.
 */
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "workflows")
public class Workflow extends BaseEntity {

    @NotBlank
    @Column(name = "case_number", nullable = false, unique = true, length = 50)
    private String caseNumber;

    @NotBlank
    @Column(name = "title", nullable = false, length = 200)
    private String title;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "category", length = 100)
    private String category;

    @Column(name = "citizen_id")
    private Long citizenId;

    @Column(name = "citizen_name", length = 150)
    private String citizenName;

    @Column(name = "referral_id")
    private Long referralId;

    @Column(name = "assigned_to", length = 150)
    private String assignedTo;

    @Column(name = "assigned_role", length = 50)
    private String assignedRole;

    @Column(name = "assigned_by", length = 150)
    private String assignedBy;

    @Column(name = "facility_name", length = 200)
    private String facilityName;

    @Column(name = "priority", length = 30)
    @Builder.Default
    private String priority = "MEDIUM";

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    @Builder.Default
    private WorkflowStatus status = WorkflowStatus.PENDING;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @Column(name = "history_log", columnDefinition = "TEXT")
    private String historyLog;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;
}
