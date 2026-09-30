package com.healthguard.ai.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "nutrition_plans", indexes = {
        @Index(name = "idx_nutrition_user", columnList = "user_id"),
        @Index(name = "idx_nutrition_risk", columnList = "risk_level"),
        @Index(name = "idx_nutrition_high_risk", columnList = "is_high_risk"),
        @Index(name = "idx_nutrition_created_at", columnList = "created_at")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NutritionPlan {


    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "symptoms", columnDefinition = "TEXT")
    private String symptoms;

    @Column(name = "risk_level")
    private String riskLevel;

    @Column(name = "possible_conditions", columnDefinition = "TEXT")
    private String possibleConditions;

    @Column(name = "user_age")
    private Integer userAge;

    @Column(name = "gender")
    private String gender;

    @Column(name = "allergies", columnDefinition = "TEXT")
    private String allergies;

    @Column(name = "medical_history", columnDefinition = "TEXT")
    private String medicalHistory;

    @Column(name = "health_profile", columnDefinition = "TEXT")
    private String healthProfile;

    @Column(name = "breakfast", columnDefinition = "TEXT")
    private String breakfast;

    @Column(name = "mid_morning", columnDefinition = "TEXT")
    private String midMorning;

    @Column(name = "lunch", columnDefinition = "TEXT")
    private String lunch;

    @Column(name = "evening_snack", columnDefinition = "TEXT")
    private String eveningSnack;

    @Column(name = "dinner", columnDefinition = "TEXT")
    private String dinner;

    @Column(name = "healthy_snacks", columnDefinition = "TEXT")
    private String healthySnacks;

    @Column(name = "hydration_goal", columnDefinition = "TEXT")
    private String hydrationGoal;

    @Column(name = "foods_recommended", columnDefinition = "TEXT")
    private String foodsRecommended;

    @Column(name = "foods_to_avoid", columnDefinition = "TEXT")
    private String foodsToAvoid;

    @Column(name = "recovery_tips", columnDefinition = "TEXT")
    private String recoveryTips;

    @Column(name = "medical_advice", columnDefinition = "TEXT")
    private String medicalAdvice;

    @Column(name = "is_high_risk")
    private Boolean isHighRisk;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
