package com.healthguard.admin.pharmacist.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "pharmacist_settings")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PharmacistSettings {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "pharmacist_id")
    private String pharmacistId;

    @Column(name = "email", unique = true)
    private String email;

    @Column(name = "notifications_enabled", nullable = false)
    @Builder.Default
    private Boolean notificationsEnabled = true;

    @Column(name = "auto_refresh_enabled", nullable = false)
    @Builder.Default
    private Boolean autoRefreshEnabled = true;

    @Column(name = "expiry_warning_threshold", nullable = false)
    @Builder.Default
    private Integer expiryWarningThreshold = 60;

    @Column(name = "theme", length = 20)
    @Builder.Default
    private String theme = "dark";

    @Column(name = "language", length = 20)
    @Builder.Default
    private String language = "ENGLISH";

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
