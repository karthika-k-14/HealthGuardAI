package com.healthguard.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.time.LocalDateTime;

/**
 * An SOS (emergency distress) request raised by a {@link Citizen}, tracked
 * through to resolution by responding staff (ASHA worker / Health Officer /
 * Admin). Deliberately a plain (non-inheriting) entity - an SOS request is
 * not a platform user, just a record owned by a citizen.
 */
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "sos_requests")
public class SosRequest extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "citizen_id", nullable = false)
    private Citizen citizen;

    @NotBlank
    @Column(name = "emergency_type", nullable = false, length = 100)
    private String emergencyType;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "latitude")
    private Double latitude;

    @Column(name = "longitude")
    private Double longitude;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    @Builder.Default
    private SosStatus status = SosStatus.PENDING;

    @Column(name = "responded_by_name", length = 150)
    private String respondedByName;

    @Enumerated(EnumType.STRING)
    @Column(name = "responded_by_role", length = 20)
    private Role respondedByRole;

    @Column(name = "status_note", columnDefinition = "TEXT")
    private String statusNote;

    @Column(name = "resolved_at")
    private LocalDateTime resolvedAt;
}
