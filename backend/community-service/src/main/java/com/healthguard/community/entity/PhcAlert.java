package com.healthguard.community.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "phc_alerts")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PhcAlert {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "report_id", nullable = false)
    private Long reportId;

    @Column(name = "phc_name")
    private String phcName;

    @Column(name = "citizen_name")
    private String citizenName;

    @Column(name = "disease")
    private String disease;

    @Column(name = "severity")
    private String severity;

    @Column(name = "village")
    private String village;

    @Builder.Default
    @Column(name = "status")
    private String status = "ALERT_SENT";

    @Column(name = "reviewed_by")
    private String reviewedBy;

    @Column(name = "health_officer_notes", columnDefinition = "TEXT")
    private String healthOfficerNotes;

    @Column(name = "escalated_at")
    private LocalDateTime escalatedAt;

    @Column(name = "asha_worker_id")
    private Long ashaWorkerId;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
