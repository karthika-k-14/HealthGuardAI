package com.healthguard.community.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "broadcast_notifications")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BroadcastNotification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "message", nullable = false, columnDefinition = "TEXT")
    private String message;

    @Column(name = "target_type", nullable = false)
    private String targetType; // ROLE, VILLAGE, PHC

    @Column(name = "target_value", nullable = false)
    private String targetValue; // Citizens, ASHA Workers, Village Name/ID, PHC Name/ID

    @Column(name = "target_role")
    private String targetRole; // CITIZEN, ASHA_WORKER

    @Column(name = "village_name")
    private String villageName; // nullable, entered village

    @Column(name = "category")
    private String category;

    @Builder.Default
    @Column(name = "notification_type", nullable = false)
    private String notificationType = "info"; // info, warning, emergency

    @Column(name = "created_by")
    private String createdBy;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
