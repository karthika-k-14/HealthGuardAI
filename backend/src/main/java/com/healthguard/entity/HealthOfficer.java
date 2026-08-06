package com.healthguard.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrimaryKeyJoinColumn;
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
 * A health officer. Joined to {@link User}. Oversees one or more villages
 * (the inverse side of {@link Village#getHealthOfficer()}).
 */
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "health_officers")
@PrimaryKeyJoinColumn(name = "user_id")
public class HealthOfficer extends User {

    @NotBlank
    @Column(name = "employee_id", nullable = false, unique = true, length = 50)
    private String employeeId;

    // Named "officerDistrict" (column still "district") to avoid shadowing the
    // inherited User.district field with a same-named property on this subclass.
    @Column(name = "district", length = 100)
    private String officerDistrict;

    @Column(name = "office_name", length = 150)
    private String officeName;

    @Column(name = "designation", length = 100)
    private String designation;

    @Builder.Default
    @OneToMany(mappedBy = "healthOfficer")
    private List<Village> managedVillages = new ArrayList<>();
}
