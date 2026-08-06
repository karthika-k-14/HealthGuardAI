package com.healthguard.dto;

import com.healthguard.entity.BloodGroup;
import com.healthguard.entity.FamilyRelation;
import com.healthguard.entity.Gender;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FamilyMemberResponse {

    private Long id;
    private UUID uuid;
    private String name;
    private FamilyRelation relation;
    private Integer age;
    private Gender gender;
    private BloodGroup bloodGroup;
    private String phone;
    private String medicalConditions;
    private LocalDateTime createdAt;
}
