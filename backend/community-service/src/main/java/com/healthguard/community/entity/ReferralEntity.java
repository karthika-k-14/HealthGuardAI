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
@Table(name = "referrals",
        uniqueConstraints = {
                @UniqueConstraint(name = "uq_referrals_report_id", columnNames = {"report_id"})
        },
        indexes = {
                @Index(name = "idx_referrals_status", columnList = "status"),
                @Index(name = "idx_referrals_village", columnList = "village"),
                @Index(name = "idx_referrals_disease", columnList = "disease"),
                @Index(name = "idx_referrals_created_at", columnList = "created_at")
        })
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReferralEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "referral_code", unique = true, length = 50)
    private String referralCode;

    @Column(name = "patient_name", nullable = false)
    private String patientName;

    @Column(name = "patient_age")
    private Integer patientAge;

    @Column(name = "patient_gender", length = 50)
    private String patientGender;

    @Column(name = "citizen_id", length = 100)
    private String citizenId;

    @Column(name = "phone_number", length = 50)
    private String phoneNumber;

    @Column(name = "village", nullable = false)
    private String village;

    @Column(name = "address", columnDefinition = "TEXT")
    private String address;

    @Column(name = "disease", nullable = false, length = 100)
    private String disease;

    @Builder.Default
    @Column(name = "severity", length = 50)
    private String severity = "Medium";

    @Column(name = "symptoms", columnDefinition = "TEXT")
    private String symptoms;

    @Column(name = "vital_signs", columnDefinition = "TEXT")
    private String vitalSigns;

    @Column(name = "referral_reason", columnDefinition = "TEXT")
    private String referralReason;

    @Column(name = "referred_phc", nullable = false)
    private String referredPhc;

    @Column(name = "report_id", unique = true)
    private Long reportId;

    @Column(name = "visit_id")
    private Long visitId;

    @Column(name = "attached_notes", columnDefinition = "TEXT")
    private String attachedNotes;

    @Column(name = "created_by", nullable = false)
    private String createdBy;

    @Builder.Default
    @Column(name = "status", length = 50)
    private String status = "PENDING";

    @Column(name = "verified_by")
    private String verifiedBy;

    @Column(name = "verified_at")
    private LocalDateTime verifiedAt;

    @Column(name = "verification_remarks", columnDefinition = "TEXT")
    private String verificationRemarks;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
