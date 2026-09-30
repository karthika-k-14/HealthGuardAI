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
@Table(name = "disease_surveillance_reports", indexes = {
        @Index(name = "idx_surveillance_village", columnList = "village"),
        @Index(name = "idx_surveillance_disease", columnList = "disease"),
        @Index(name = "idx_surveillance_status", columnList = "status")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DiseaseReport {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "report_id")
    private Long reportId;

    @Column(name = "citizen_id", nullable = false)
    private Long citizenId;

    @Column(name = "family_id")
    private Long familyId;

    @Column(name = "asha_worker_id", nullable = false)
    private Long ashaWorkerId;

    @Column(name = "citizen_name", nullable = false)
    private String citizenName;

    @Column(name = "affected_person_id")
    private Long affectedPersonId;

    @Column(name = "affected_person_name")
    private String affectedPersonName;

    @Column(name = "relationship")
    private String relationship;

    @Column(name = "age")
    private Integer age;

    @Column(name = "gender")
    private String gender;

    @Column(name = "village", nullable = false)
    private String village;

    @Column(name = "address", columnDefinition = "TEXT")
    private String address;

    @Column(name = "phone_number")
    private String phoneNumber;

    @Column(name = "report_date", nullable = false)
    private LocalDate reportDate;

    @Column(name = "report_time", nullable = false)
    private String reportTime;

    @Column(name = "disease", nullable = false)
    private String disease;

    @Column(name = "other_disease_name")
    private String otherDiseaseName;

    @Builder.Default
    @Column(name = "severity")
    private String severity = "Medium";

    @Column(name = "symptoms", columnDefinition = "TEXT")
    private String symptoms;

    @Column(name = "other_symptoms", columnDefinition = "TEXT")
    private String otherSymptoms;

    @Column(name = "temperature_c")
    private Double temperatureC;

    @Column(name = "pulse_rate")
    private Integer pulseRate;

    @Column(name = "blood_pressure")
    private String bloodPressure;

    @Column(name = "spo2_percent")
    private Integer spo2Percent;

    @Column(name = "observations", columnDefinition = "TEXT")
    private String observations;

    @Column(name = "photo_base64", columnDefinition = "TEXT")
    private String photoBase64;

    @Column(name = "attachment_name")
    private String attachmentName;

    @Builder.Default
    @Column(name = "emergency_referral")
    private Boolean emergencyReferral = false;

    @Builder.Default
    @Column(name = "status")
    private String status = "PENDING_REVIEW";

    @Column(name = "health_officer_notes", columnDefinition = "TEXT")
    private String healthOfficerNotes;

    @Column(name = "created_by")
    private String createdBy;

    @Column(name = "reviewed_by")
    private String reviewedBy;

    @Column(name = "reviewed_at")
    private LocalDateTime reviewedAt;

    @Column(name = "referred_phc")
    private String referredPhc;

    @Builder.Default
    @Column(name = "referral_status")
    private String referralStatus = "PENDING";

    @Column(name = "escalated_at")
    private LocalDateTime escalatedAt;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "date_modified")
    private LocalDateTime dateModified;

    @Column(name = "resolution_date")
    private LocalDateTime resolutionDate;

    public String getDisease() {
        if (("Other".equalsIgnoreCase(disease) || disease == null) && otherDiseaseName != null && !otherDiseaseName.isBlank()) {
            return otherDiseaseName;
        }
        return disease;
    }

    public String getAffectedPersonName() {
        if (affectedPersonName != null && !affectedPersonName.isBlank()) {
            return affectedPersonName;
        }
        return citizenName;
    }

    public String getRelationship() {
        if (relationship != null && !relationship.isBlank()) {
            return relationship;
        }
        return "Head of Household";
    }
}
