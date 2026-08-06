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
 * A hospital (referral facility), managed by Admins via the Hospital CRUD
 * module. Distinct from {@link Phc}, which models village-level Primary
 * Health Centres.
 */
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "hospitals")
public class Hospital extends BaseEntity {

    @NotBlank
    @Column(name = "name", nullable = false, length = 150)
    private String name;

    /** e.g. Government, Private, Community Health Centre. */
    @Column(name = "type", length = 50)
    private String type;

    @Column(name = "address", length = 255)
    private String address;

    @Column(name = "district", length = 100)
    private String district;

    @Column(name = "phone", length = 15)
    private String phone;

    @Column(name = "latitude")
    private Double latitude;

    @Column(name = "longitude")
    private Double longitude;

    @Column(name = "beds")
    private Integer beds;

    @Column(name = "emergency_services")
    private Boolean emergencyServices;

    /** Operational / Near Capacity / Critical. */
    @Column(name = "status", length = 30)
    private String status;
}
