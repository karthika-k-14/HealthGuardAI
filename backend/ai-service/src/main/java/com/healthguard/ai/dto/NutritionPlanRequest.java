package com.healthguard.ai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NutritionPlanRequest {
    private Long userId;
    private List<String> symptoms;
    private String riskLevel;
    private List<String> possibleConditions;
    private Integer age;
    private String gender;
    private String allergies;
    private String medicalHistory;
    private String healthProfile;
    private String language;
}
