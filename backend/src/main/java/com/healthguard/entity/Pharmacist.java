package com.healthguard.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.PrimaryKeyJoinColumn;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

/**
 * A pharmacist. Joined to {@link User}.
 */
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "pharmacists")
@PrimaryKeyJoinColumn(name = "user_id")
public class Pharmacist extends User {

    @NotBlank
    @Column(name = "employee_id", nullable = false, unique = true, length = 50)
    private String employeeId;

    @Column(name = "pharmacy_name", length = 150)
    private String pharmacyName;

    @Column(name = "phc_name", length = 150)
    private String phcName;

    @Column(name = "license_number", unique = true, length = 100)
    private String licenseNumber;
}
