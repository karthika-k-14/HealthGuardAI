package com.healthguard.admin.admin.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.ZonedDateTime;

@Entity
@Table(name = "admin_settings")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminSettings {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "admin_id", nullable = false, unique = true)
    private Long adminId;

    @Column(name = "dark_mode")
    private Boolean darkMode;

    @Column(name = "language", length = 10)
    private String language;

    @Column(name = "email_alerts")
    private Boolean emailAlerts;

    @Column(name = "sms_alerts")
    private Boolean smsAlerts;

    @Column(name = "location_sharing")
    private Boolean locationSharing;

    @Column(name = "two_factor_enabled")
    private Boolean twoFactorEnabled;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private ZonedDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private ZonedDateTime updatedAt;
}
