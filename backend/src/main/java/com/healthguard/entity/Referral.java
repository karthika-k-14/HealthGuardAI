package com.healthguard.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

/**
 * A referral of a citizen from one facility/worker to another (e.g. ASHA
 * worker referring a citizen to a PHC, or a PHC referring a citizen to a
 * Hospital). Kept as plain descriptive fields (rather than FKs to
 * Citizen/Phc/Hospital) to keep this module self-contained.
 */
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "referrals")
public class Referral extends BaseEntity {

    @NotBlank
    @Column(name = "citizen_name", nullable = false, length = 150)
    private String citizenName;

    @Column(name = "referred_by", length = 150)
    private String referredBy;

    @Column(name = "from_facility", length = 150)
    private String fromFacility;

    @Column(name = "to_facility", length = 150)
    private String toFacility;

    @Column(name = "reason", length = 255)
    private String reason;

    @Column(name = "notes", length = 500)
    private String notes;

    /** Pending / Completed / Cancelled. */
    @Column(name = "status", length = 30)
    private String status;
}
