package com.healthguard.citizen.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "citizen_health_profiles")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CitizenHealthProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "citizen_id", nullable = false, unique = true)
    private Long citizenId;

    @Column(name = "blood_group")
    private String bloodGroup;

    @Column(name = "height")
    private Double height; // in cm

    @Column(name = "weight")
    private Double weight; // in kg

    @Column(name = "bmi")
    private Double bmi;

    @Column(name = "allergies", length = 1000)
    private String allergies;

    @Column(name = "chronic_conditions", length = 1000)
    private String chronicConditions;

    @Column(name = "emergency_contact")
    private String emergencyContact;

    @Column(name = "pregnancy_status")
    private String pregnancyStatus;

    @Column(name = "disability_status")
    private String disabilityStatus;

    @UpdateTimestamp
    @Column(name = "last_updated")
    private LocalDateTime lastUpdated;
}
