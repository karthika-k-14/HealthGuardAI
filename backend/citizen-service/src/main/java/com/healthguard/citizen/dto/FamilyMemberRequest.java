package com.healthguard.citizen.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FamilyMemberRequest {

    private Long userId;
    private String name;
    private String relation;
    private Integer age;
    private String gender;
    private String bloodGroup;
    private String phone;
    private String medicalConditions;
}
