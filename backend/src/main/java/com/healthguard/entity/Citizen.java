package com.healthguard.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrimaryKeyJoinColumn;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.util.ArrayList;
import java.util.List;

/**
 * A citizen using the platform. Joined to {@link User} on the shared primary key.
 */
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "citizens")
@PrimaryKeyJoinColumn(name = "user_id")
public class Citizen extends User {

    @Column(name = "height_cm")
    private Double height;

    @Column(name = "weight_kg")
    private Double weight;

    @Column(name = "bmi")
    private Double bmi;

    @Column(name = "emergency_contact_name", length = 150)
    private String emergencyContactName;

    @Column(name = "emergency_contact_phone", length = 15)
    private String emergencyContactPhone;

    @Column(name = "chronic_diseases", columnDefinition = "TEXT")
    private String chronicDiseases;

    @Column(name = "allergies", columnDefinition = "TEXT")
    private String allergies;

    @Column(name = "medical_history", columnDefinition = "TEXT")
    private String medicalHistory;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "village_id")
    private Village village;

    /**
     * Family members and health history entries the citizen has added to
     * their own profile (Phase 1 - Citizen Module). Managed through
     * {@code CitizenService}, not cascaded here to keep saves explicit.
     */
    @Builder.Default
    @OneToMany(mappedBy = "citizen", fetch = FetchType.LAZY)
    private List<FamilyMember> familyMembers = new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "citizen", fetch = FetchType.LAZY)
    private List<HealthRecord> healthRecords = new ArrayList<>();
}
