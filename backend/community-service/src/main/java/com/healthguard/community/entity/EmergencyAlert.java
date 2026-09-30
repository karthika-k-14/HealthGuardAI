package com.healthguard.community.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "emergency_alerts", indexes = {
        @Index(name = "idx_emergency_alerts_citizen_id", columnList = "citizen_id"),
        @Index(name = "idx_emergency_alerts_asha_id", columnList = "assigned_asha_worker_id"),
        @Index(name = "idx_emergency_alerts_urgency", columnList = "urgency_level"),
        @Index(name = "idx_emergency_alerts_status", columnList = "status"),
        @Index(name = "idx_emergency_alerts_created_at", columnList = "created_at")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmergencyAlert {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "citizen_id")
    private Long citizenId;

    @Column(name = "citizen_name")
    private String citizenName;

    @Column(name = "assigned_asha_worker_id")
    private Long assignedAshaWorkerId;

    @Column(name = "assigned_asha_worker_name")
    private String assignedAshaWorkerName;

    @Column(name = "symptoms", columnDefinition = "TEXT")
    private String symptoms;

    @Column(name = "disease_category")
    private String diseaseCategory;

    @Builder.Default
    @Column(name = "urgency_level", length = 50, nullable = false)
    private String urgencyLevel = "LOW";

    @Builder.Default
    @Column(name = "urgency_score")
    private Double urgencyScore = 0.0;

    @Column(name = "village")
    private String village;

    @Column(name = "district")
    private String district;

    @Builder.Default
    @Column(name = "status", length = 50, nullable = false)
    private String status = "PENDING";

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
