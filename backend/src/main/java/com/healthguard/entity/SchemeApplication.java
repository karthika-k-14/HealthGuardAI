package com.healthguard.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.time.LocalDateTime;

/**
 * A citizen's application to a {@link Scheme}, tracked through review to a
 * final beneficiary decision. This is the Scheme Beneficiary Management
 * module: {@code Apply for Scheme}, {@code Eligible Citizens},
 * {@code Approved Beneficiaries}, and {@code Rejected Beneficiaries} are all
 * views over this single entity, filtered by {@link SchemeApplicationStatus}.
 */
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "scheme_applications")
public class SchemeApplication extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "citizen_id", nullable = false)
    private Citizen citizen;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "scheme_id", nullable = false)
    private Scheme scheme;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private SchemeApplicationStatus status = SchemeApplicationStatus.PENDING;

    /** Free-text note from the reviewer (eligibility note or rejection reason). */
    @Column(name = "remarks", length = 500)
    private String remarks;

    @Column(name = "reviewed_at")
    private LocalDateTime reviewedAt;
}
