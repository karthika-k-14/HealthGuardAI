package com.healthguard.community.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "home_visits", indexes = {
        @Index(name = "idx_home_visits_asha_id", columnList = "asha_worker_id"),
        @Index(name = "idx_home_visits_citizen_id", columnList = "citizen_id"),
        @Index(name = "idx_home_visits_status", columnList = "status")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HomeVisit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "visit_id")
    private Long visitId;

    @Column(name = "citizen_id", nullable = false)
    private Long citizenId;

    @Column(name = "family_id")
    private Long familyId;

    @Column(name = "asha_worker_id", nullable = false)
    private Long ashaWorkerId;

    @Column(name = "citizen_name")
    private String citizenName;

    @Column(name = "village")
    private String village;

    @Column(name = "visit_type", nullable = false)
    private String visitType;

    @Column(name = "visit_date", nullable = false)
    private LocalDate visitDate;

    @Builder.Default
    @Column(name = "status", nullable = false)
    private String status = "SCHEDULED";

    @Column(name = "observations", columnDefinition = "TEXT")
    private String observations;

    @Column(name = "recommendations", columnDefinition = "TEXT")
    private String recommendations;

    @Builder.Default
    @Column(name = "risk_level")
    private String riskLevel = "Low";

    @Column(name = "next_visit_date")
    private LocalDate nextVisitDate;

    @Column(name = "blood_pressure")
    private String bloodPressure;

    @Column(name = "weight_kg")
    private Double weightKg;

    @Column(name = "temperature_f")
    private Double temperatureF;

    @Column(name = "symptoms", columnDefinition = "TEXT")
    private String symptoms;

    @Column(name = "pregnancy_status")
    private String pregnancyStatus;

    @Column(name = "vaccination_status")
    private String vaccinationStatus;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
