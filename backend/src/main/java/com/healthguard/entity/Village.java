package com.healthguard.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.util.ArrayList;
import java.util.List;

/**
 * A village served by the health system. Owns collections of the people and
 * facilities based there, and is (optionally) placed under the supervision of
 * one {@link HealthOfficer} who may oversee several villages.
 */
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "villages")
public class Village extends BaseEntity {

    @NotBlank
    @Column(name = "village_name", nullable = false, length = 150)
    private String villageName;

    @Column(name = "district", length = 100)
    private String district;

    @Column(name = "state", length = 100)
    private String state;

    @Column(name = "population")
    private Long population;

    @Column(name = "latitude")
    private Double latitude;

    @Column(name = "longitude")
    private Double longitude;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "health_officer_id")
    private HealthOfficer healthOfficer;

    @Builder.Default
    @OneToMany(mappedBy = "village")
    private List<Citizen> citizens = new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "assignedVillage")
    private List<AshaWorker> ashaWorkers = new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "village")
    private List<Phc> phcs = new ArrayList<>();
}
