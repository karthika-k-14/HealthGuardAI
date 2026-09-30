package com.healthguard.admin.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "citizen_assignment", uniqueConstraints = {
        @UniqueConstraint(name = "uk_citizen_assignment", columnNames = {"citizen_id"})
}, indexes = {
        @Index(name = "idx_citizen_assignment_asha_id", columnList = "asha_worker_id"),
        @Index(name = "idx_citizen_assignment_status", columnList = "status")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CitizenAssignment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "assignment_id")
    private Long id;

    @Column(name = "citizen_id", nullable = false, unique = true)
    private Long citizenId;

    @Column(name = "asha_worker_id", nullable = false)
    private Long ashaWorkerId;

    @Column(name = "assigned_by_admin_id")
    private Long assignedByAdminId;

    @CreationTimestamp
    @Column(name = "assigned_date")
    private LocalDateTime assignedDate;

    @Builder.Default
    @Column(name = "status", length = 50)
    private String status = "ACTIVE";

    @Column(name = "citizen_name")
    private String citizenName;

    @Column(name = "asha_worker_name")
    private String ashaWorkerName;

    @Column(name = "village")
    private String village;

    @PrePersist
    protected void onCreate() {
        if (this.assignedDate == null) {
            this.assignedDate = LocalDateTime.now();
        }
        if (this.status == null) {
            this.status = "ACTIVE";
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getCitizenId() { return citizenId; }
    public void setCitizenId(Long citizenId) { this.citizenId = citizenId; }

    public Long getAshaWorkerId() { return ashaWorkerId; }
    public void setAshaWorkerId(Long ashaWorkerId) { this.ashaWorkerId = ashaWorkerId; }

    public Long getAssignedByAdminId() { return assignedByAdminId; }
    public void setAssignedByAdminId(Long assignedByAdminId) { this.assignedByAdminId = assignedByAdminId; }

    public LocalDateTime getAssignedDate() { return assignedDate; }
    public void setAssignedDate(LocalDateTime assignedDate) { this.assignedDate = assignedDate; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getCitizenName() { return citizenName; }
    public void setCitizenName(String citizenName) { this.citizenName = citizenName; }

    public String getAshaWorkerName() { return ashaWorkerName; }
    public void setAshaWorkerName(String ashaWorkerName) { this.ashaWorkerName = ashaWorkerName; }

    public String getVillage() { return village; }
    public void setVillage(String village) { this.village = village; }
}
