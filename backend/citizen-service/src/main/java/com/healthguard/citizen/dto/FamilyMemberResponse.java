package com.healthguard.citizen.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FamilyMemberResponse {

    private Long id;
    private Long userId;
    private String name;
    private String relation;
    private Integer age;
    private String gender;
    private String bloodGroup;
    private String phone;
    private String medicalConditions;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
