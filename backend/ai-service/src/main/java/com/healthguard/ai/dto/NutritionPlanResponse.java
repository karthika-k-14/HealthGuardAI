package com.healthguard.ai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NutritionPlanResponse {
    private Long id;
    private Long userId;
    private String symptoms;
    private String riskLevel;
    private String possibleConditions;
    private Integer userAge;
    private String gender;
    private String allergies;
    private String medicalHistory;
    private String healthProfile;
    private String breakfast;
    private String midMorning;
    private String lunch;
    private String eveningSnack;
    private String dinner;
    private String healthySnacks;
    private String hydrationGoal;
    private List<String> foodsRecommended;
    private List<String> foodsToAvoid;
    private String recoveryTips;
    private String medicalAdvice;
    private Boolean isHighRisk;
    private LocalDateTime createdAt;
}
