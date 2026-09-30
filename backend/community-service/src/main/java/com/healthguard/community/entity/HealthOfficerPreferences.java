package com.healthguard.community.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "health_officer_preferences")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HealthOfficerPreferences {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false, unique = true)
    private Long userId;

    @Column(name = "disease_surveillance_alerts", nullable = false)
    @Builder.Default
    private Boolean diseaseSurveillanceAlerts = true;

    @Column(name = "high_risk_case_notifications", nullable = false)
    @Builder.Default
    private Boolean highRiskCaseNotifications = true;

    @Column(name = "referral_escalation_alerts", nullable = false)
    @Builder.Default
    private Boolean referralEscalationAlerts = true;

    @Column(name = "outbreak_detection_alerts", nullable = false)
    @Builder.Default
    private Boolean outbreakDetectionAlerts = true;

    @Column(name = "campaign_update_notifications", nullable = false)
    @Builder.Default
    private Boolean campaignUpdateNotifications = true;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) createdAt = LocalDateTime.now();
        if (updatedAt == null) updatedAt = LocalDateTime.now();
        if (diseaseSurveillanceAlerts == null) diseaseSurveillanceAlerts = true;
        if (highRiskCaseNotifications == null) highRiskCaseNotifications = true;
        if (referralEscalationAlerts == null) referralEscalationAlerts = true;
        if (outbreakDetectionAlerts == null) outbreakDetectionAlerts = true;
        if (campaignUpdateNotifications == null) campaignUpdateNotifications = true;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
