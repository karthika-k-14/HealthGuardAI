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
@Table(name = "health_officer_settings")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HealthOfficerSettings {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id")
    private String userId;

    @Column(name = "user_email")
    private String userEmail;

    // Campaign Management Settings
    @Builder.Default
    @Column(name = "default_campaign_duration")
    private String defaultCampaignDuration = "14 Days";

    @Builder.Default
    @Column(name = "auto_archive_completed_campaigns")
    private Boolean autoArchiveCompletedCampaigns = true;

    @Builder.Default
    @Column(name = "campaign_progress_alerts")
    private Boolean campaignProgressAlerts = true;

    @Builder.Default
    @Column(name = "campaign_progress_milestones")
    private String campaignProgressMilestones = "25,50,75,100";

    @Builder.Default
    @Column(name = "campaign_performance_summary")
    private Boolean campaignPerformanceSummary = true;

    // Broadcast Notification Settings
    @Builder.Default
    @Column(name = "enable_broadcast_notifications")
    private Boolean enableBroadcastNotifications = true;

    @Builder.Default
    @Column(name = "emergency_alerts")
    private Boolean emergencyAlerts = true;

    @Builder.Default
    @Column(name = "disease_outbreak_alerts")
    private Boolean diseaseOutbreakAlerts = true;

    @Builder.Default
    @Column(name = "vaccination_drive_alerts")
    private Boolean vaccinationDriveAlerts = true;

    @Builder.Default
    @Column(name = "campaign_awareness_alerts")
    private Boolean campaignAwarenessAlerts = true;

    @Builder.Default
    @Column(name = "referral_escalation_alerts")
    private Boolean referralEscalationAlerts = true;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
