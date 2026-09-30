package com.healthguard.community.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HealthOfficerSettingsDTO {

    private Long id;
    private String userId;
    private String userEmail;

    // Campaign Management Settings
    @Builder.Default
    private String defaultCampaignDuration = "14 Days";

    @Builder.Default
    private Boolean autoArchiveCompletedCampaigns = true;

    @Builder.Default
    private Boolean campaignProgressAlerts = true;

    @Builder.Default
    private String campaignProgressMilestones = "25,50,75,100";

    @Builder.Default
    private Boolean campaignPerformanceSummary = true;

    // Broadcast Notification Settings
    @Builder.Default
    private Boolean enableBroadcastNotifications = true;

    @Builder.Default
    private Boolean emergencyAlerts = true;

    @Builder.Default
    private Boolean diseaseOutbreakAlerts = true;

    @Builder.Default
    private Boolean vaccinationDriveAlerts = true;

    @Builder.Default
    private Boolean campaignAwarenessAlerts = true;

    @Builder.Default
    private Boolean referralEscalationAlerts = true;

    private LocalDateTime updatedAt;
}
