package com.healthguard.dto;

import com.healthguard.entity.BloodGroup;
import com.healthguard.entity.FamilyRelation;
import com.healthguard.entity.Gender;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Request body for creating or updating a {@link com.healthguard.entity.FamilyMember}
 * under the authenticated citizen's household.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class FamilyMemberRequest {

    @NotBlank(message = "Name is required")
    private String name;

    @NotNull(message = "Relation is required")
    private FamilyRelation relation;

    @Min(value = 0, message = "Age cannot be negative")
    @Max(value = 130, message = "Age must be realistic")
    private Integer age;

    private Gender gender;

    private BloodGroup bloodGroup;

    @Pattern(regexp = "^[0-9]{10}$", message = "Phone number must be 10 digits")
    private String phone;

    private String medicalConditions;
}
