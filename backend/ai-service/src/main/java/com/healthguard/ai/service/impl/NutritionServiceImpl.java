package com.healthguard.ai.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.healthguard.ai.client.OllamaClient;
import com.healthguard.ai.dto.NutritionPlanRequest;
import com.healthguard.ai.dto.NutritionPlanResponse;
import com.healthguard.ai.entity.NutritionPlan;
import com.healthguard.ai.entity.SymptomAssessment;
import com.healthguard.ai.repository.NutritionPlanRepository;
import com.healthguard.ai.repository.SymptomAssessmentRepository;
import com.healthguard.ai.service.NutritionService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NutritionServiceImpl implements NutritionService {

    private static final Logger log = LoggerFactory.getLogger(NutritionServiceImpl.class);

    private final NutritionPlanRepository nutritionPlanRepository;
    private final SymptomAssessmentRepository symptomAssessmentRepository;
    private final OllamaClient ollamaClient;
    private final ObjectMapper objectMapper;

    @Override
    @Transactional
    public NutritionPlanResponse generateAndSaveNutritionPlan(NutritionPlanRequest request) {
        String riskLevel = request.getRiskLevel() != null ? request.getRiskLevel().toUpperCase().trim() : "LOW";
        if (riskLevel.equals("MEDIUM")) riskLevel = "MODERATE";

        boolean isHighRisk = riskLevel.equals("HIGH") || riskLevel.equals("CRITICAL") || riskLevel.equals("EMERGENCY");
        Long userId = request.getUserId();
        if (userId == null) {
            throw new IllegalArgumentException("User ID is required");
        }

        String symptomsStr = request.getSymptoms() != null ? String.join(", ", request.getSymptoms()) : "";
        String conditionsStr = request.getPossibleConditions() != null ? String.join(", ", request.getPossibleConditions()) : "";
        String ageStr = request.getAge() != null ? String.valueOf(request.getAge()) : "Not specified";
        String genderStr = request.getGender() != null ? request.getGender() : "Not specified";
        String allergiesStr = request.getAllergies() != null ? request.getAllergies() : "None reported";
        String medicalHistoryStr = request.getMedicalHistory() != null ? request.getMedicalHistory() : "None reported";
        String healthProfileStr = request.getHealthProfile() != null ? request.getHealthProfile() : "General Profile";

        // Query latest symptom assessment to ensure condition-aware link
        List<SymptomAssessment> recentAssessments = symptomAssessmentRepository.findByUserIdOrderByCreatedAtDesc(userId);
        String assessedCondition = null;
        if (recentAssessments != null && !recentAssessments.isEmpty()) {
            SymptomAssessment latest = recentAssessments.get(0);
            if (symptomsStr.isBlank() || symptomsStr.contains("General Nutrition") || symptomsStr.contains("General Health")) {
                if (latest.getSymptoms() != null && !latest.getSymptoms().isBlank()) {
                    symptomsStr = latest.getSymptoms();
                }
            }
            if (conditionsStr.isBlank() || conditionsStr.contains("General Health Profile") || conditionsStr.contains("Clinical Assessment")) {
                if (latest.getPrediction() != null && !latest.getPrediction().isBlank()) {
                    conditionsStr = latest.getPrediction();
                    assessedCondition = latest.getPrediction();
                }
            } else {
                assessedCondition = conditionsStr;
            }
            if ((request.getRiskLevel() == null || request.getRiskLevel().isBlank() || "LOW".equalsIgnoreCase(request.getRiskLevel()))
                    && latest.getRiskLevel() != null && !latest.getRiskLevel().isBlank()) {
                riskLevel = latest.getRiskLevel().toUpperCase().trim();
                if (riskLevel.equals("MEDIUM")) riskLevel = "MODERATE";
            }
        }

        log.info("[NUTRITION ENGINE] Generating Condition-Aware Plan for userId={}. Inputs: age={}, gender={}, healthProfile={}, symptoms={}, conditions={}, detectedCondition={}, riskLevel={}, medicalHistory={}",
                userId, ageStr, genderStr, healthProfileStr, symptomsStr, conditionsStr, assessedCondition, riskLevel, medicalHistoryStr);

        NutritionPlan plan;

        if (isHighRisk) {
            log.info("Risk level is {} - withholding nutrition plan and returning medical consultation warning.", riskLevel);
            plan = NutritionPlan.builder()
                    .userId(userId)
                    .symptoms(symptomsStr)
                    .riskLevel(riskLevel)
                    .possibleConditions(conditionsStr)
                    .userAge(request.getAge())
                    .gender(genderStr)
                    .allergies(allergiesStr)
                    .medicalHistory(medicalHistoryStr)
                    .healthProfile(healthProfileStr)
                    .isHighRisk(true)
                    .breakfast(null)
                    .midMorning(null)
                    .lunch(null)
                    .eveningSnack(null)
                    .dinner(null)
                    .healthySnacks(null)
                    .hydrationGoal(null)
                    .foodsRecommended(null)
                    .foodsToAvoid(null)
                    .recoveryTips(null)
                    .medicalAdvice("Your symptoms may require medical attention. Please consult a healthcare professional immediately.")
                    .build();
        } else {
            log.info("Generating personalized nutrition plan via Gemini AI for symptoms: {}, risk: {}", symptomsStr, riskLevel);
            String rawResponse = ollamaClient.generateNutritionPlanPrompt(symptomsStr, riskLevel, ageStr, genderStr, allergiesStr, medicalHistoryStr, healthProfileStr, conditionsStr);

            if (rawResponse == null || rawResponse.isBlank()) {
                log.warn("Gemini AI service unavailable. Returning AI service unavailable message.");
                plan = NutritionPlan.builder()
                        .userId(userId)
                        .symptoms(symptomsStr)
                        .riskLevel(riskLevel)
                        .possibleConditions(conditionsStr)
                        .userAge(request.getAge())
                        .gender(genderStr)
                        .allergies(allergiesStr)
                        .medicalHistory(medicalHistoryStr)
                        .healthProfile(healthProfileStr)
                        .isHighRisk(false)
                        .breakfast(null)
                        .midMorning(null)
                        .lunch(null)
                        .eveningSnack(null)
                        .dinner(null)
                        .healthySnacks(null)
                        .hydrationGoal(null)
                        .foodsRecommended(null)
                        .foodsToAvoid(null)
                        .recoveryTips(null)
                        .medicalAdvice("AI assessment service is temporarily unavailable. Please try again shortly or consult a healthcare professional.")
                        .build();
            } else {
                String breakfast = null;
                String midMorning = null;
                String lunch = null;
                String eveningSnack = null;
                String dinner = null;
                String healthySnacks = null;
                String hydrationGoal = null;
                String foodsRecommended = null;
                String foodsToAvoid = null;
                String recoveryTips = null;
                String medicalAdvice = "This assessment is AI-generated and is not a medical diagnosis. Consult a qualified physician for clinical decisions.";

                try {
                    String cleanJson = rawResponse.trim();
                    if (cleanJson.startsWith("```json")) {
                        cleanJson = cleanJson.substring(7);
                    }
                    if (cleanJson.startsWith("```")) {
                        cleanJson = cleanJson.substring(3);
                    }
                    if (cleanJson.endsWith("```")) {
                        cleanJson = cleanJson.substring(0, cleanJson.length() - 3);
                    }
                    cleanJson = cleanJson.trim();

                    JsonNode root = objectMapper.readTree(cleanJson);

                    // Support nested "nutritionPlan" sub-object or flat meal keys
                    JsonNode mealNode = root.has("nutritionPlan") && root.get("nutritionPlan").isObject() ? root.get("nutritionPlan") : root;
                    if (mealNode.has("breakfast")) breakfast = parseNodeToString(mealNode.get("breakfast"));
                    if (mealNode.has("midMorning")) midMorning = parseNodeToString(mealNode.get("midMorning"));
                    if (mealNode.has("lunch")) lunch = parseNodeToString(mealNode.get("lunch"));
                    if (mealNode.has("eveningSnack")) eveningSnack = parseNodeToString(mealNode.get("eveningSnack"));
                    if (mealNode.has("dinner")) dinner = parseNodeToString(mealNode.get("dinner"));
                    if (mealNode.has("healthySnacks")) healthySnacks = parseNodeToString(mealNode.get("healthySnacks"));

                    if (root.has("hydrationGoal")) hydrationGoal = parseNodeToString(root.get("hydrationGoal"));

                    if (root.has("recommendedFoods")) {
                        foodsRecommended = parseNodeToString(root.get("recommendedFoods"));
                    } else if (root.has("foodsRecommended")) {
                        foodsRecommended = parseNodeToString(root.get("foodsRecommended"));
                    }

                    if (root.has("foodsToAvoid")) {
                        foodsToAvoid = parseNodeToString(root.get("foodsToAvoid"));
                    }

                    if (root.has("recoveryTips")) {
                        recoveryTips = parseNodeToString(root.get("recoveryTips"));
                    }

                    if (root.has("medicalAdvice")) {
                        medicalAdvice = parseNodeToString(root.get("medicalAdvice")) + "\n\nThis assessment is AI-generated and is not a medical diagnosis.";
                    }
                } catch (Exception e) {
                    log.error("Failed to parse Gemini AI JSON response: {}", e.getMessage());
                }

                plan = NutritionPlan.builder()
                        .userId(userId)
                        .symptoms(symptomsStr)
                        .riskLevel(riskLevel)
                        .possibleConditions(conditionsStr)
                        .userAge(request.getAge())
                        .gender(genderStr)
                        .allergies(allergiesStr)
                        .medicalHistory(medicalHistoryStr)
                        .healthProfile(healthProfileStr)
                        .isHighRisk(false)
                        .breakfast(breakfast)
                        .midMorning(midMorning)
                        .lunch(lunch)
                        .eveningSnack(eveningSnack)
                        .dinner(dinner)
                        .healthySnacks(healthySnacks)
                        .hydrationGoal(hydrationGoal)
                        .foodsRecommended(foodsRecommended)
                        .foodsToAvoid(foodsToAvoid)
                        .recoveryTips(recoveryTips)
                        .medicalAdvice(medicalAdvice)
                        .build();
            }
        }

        NutritionPlan saved = nutritionPlanRepository.save(plan);
        return mapToResponse(saved);
    }

    @Override
    public List<NutritionPlanResponse> getNutritionHistoryByUserId(Long userId) {
        return nutritionPlanRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public org.springframework.data.domain.Page<NutritionPlanResponse> getNutritionHistoryByUserId(Long userId, org.springframework.data.domain.Pageable pageable) {
        return nutritionPlanRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable)
                .map(this::mapToResponse);
    }

    @Override
    public NutritionPlanResponse getLatestNutritionPlanByUserId(Long userId) {
        return nutritionPlanRepository.findFirstByUserIdOrderByCreatedAtDesc(userId)
                .map(this::mapToResponse)
                .orElse(null);
    }

    @Override
    public org.springframework.data.domain.Page<NutritionPlanResponse> searchNutritionPlans(String keyword, org.springframework.data.domain.Pageable pageable) {
        return nutritionPlanRepository.searchNutritionPlans(keyword, pageable)
                .map(this::mapToResponse);
    }

    @Override
    @Transactional
    public void deleteNutritionPlan(Long id, Long requesterUserId) {
        NutritionPlan plan = nutritionPlanRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Nutrition plan not found with id: " + id));

        if (requesterUserId != null && !requesterUserId.equals(plan.getUserId())) {
            log.warn("IDOR attempt blocked: requesterUserId={} tried to delete nutrition plan id={} owned by userId={}", requesterUserId, id, plan.getUserId());
            throw new org.springframework.security.access.AccessDeniedException("Unauthorized: You do not have permission to delete another user's nutrition plan");
        }

        nutritionPlanRepository.delete(plan);
        log.info("Deleted nutrition plan id={}", id);
    }


    private NutritionPlanResponse mapToResponse(NutritionPlan plan) {
        List<String> avoidList = plan.getFoodsToAvoid() != null && !plan.getFoodsToAvoid().isBlank()
                ? Arrays.stream(plan.getFoodsToAvoid().split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .collect(Collectors.toList())
                : List.of("Deep Fried Foods", "Excessively Spicy Foods", "Street Foods", "Carbonated Drinks");

        List<String> recommendedList = plan.getFoodsRecommended() != null && !plan.getFoodsRecommended().isBlank()
                ? Arrays.stream(plan.getFoodsRecommended().split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .collect(Collectors.toList())
                : List.of("Rice", "Dal", "Banana", "Papaya", "Coconut Water", "Curd");

        return NutritionPlanResponse.builder()
                .id(plan.getId())
                .userId(plan.getUserId() != null ? plan.getUserId() : 1L)
                .symptoms(plan.getSymptoms() != null && !plan.getSymptoms().isBlank() ? plan.getSymptoms() : "General Symptoms")
                .riskLevel(plan.getRiskLevel() != null && !plan.getRiskLevel().isBlank() ? plan.getRiskLevel() : "LOW")
                .possibleConditions(plan.getPossibleConditions() != null && !plan.getPossibleConditions().isBlank() ? plan.getPossibleConditions() : "Health Assessment")
                .userAge(plan.getUserAge() != null ? plan.getUserAge() : 35)
                .gender(plan.getGender() != null && !plan.getGender().isBlank() ? plan.getGender() : "Not specified")
                .allergies(plan.getAllergies() != null && !plan.getAllergies().isBlank() ? plan.getAllergies() : "None reported")
                .medicalHistory(plan.getMedicalHistory() != null && !plan.getMedicalHistory().isBlank() ? plan.getMedicalHistory() : "None reported")
                .healthProfile(plan.getHealthProfile() != null && !plan.getHealthProfile().isBlank() ? plan.getHealthProfile() : "General Profile")
                .isHighRisk(Boolean.TRUE.equals(plan.getIsHighRisk()))
                .breakfast(plan.getBreakfast() != null && !plan.getBreakfast().isBlank() ? plan.getBreakfast() : "Poha / Idli with mild chutney / Dahi Chuda")
                .midMorning(plan.getMidMorning() != null && !plan.getMidMorning().isBlank() ? plan.getMidMorning() : "Papaya slices / Fresh Coconut Water")
                .lunch(plan.getLunch() != null && !plan.getLunch().isBlank() ? plan.getLunch() : "Steamed Rice, Dalma / Dal, and Sabzi")
                .eveningSnack(plan.getEveningSnack() != null && !plan.getEveningSnack().isBlank() ? plan.getEveningSnack() : "Roasted Makhana / Buttermilk")
                .dinner(plan.getDinner() != null && !plan.getDinner().isBlank() ? plan.getDinner() : "Moong Dal Khichdi / Roti with mild Sabzi")
                .healthySnacks(plan.getHealthySnacks() != null && !plan.getHealthySnacks().isBlank() ? plan.getHealthySnacks() : "Sprouts / Roasted Chana")
                .hydrationGoal(plan.getHydrationGoal() != null && !plan.getHydrationGoal().isBlank() ? plan.getHydrationGoal() : "3-4 litres of water daily including tender coconut water and buttermilk")
                .foodsRecommended(recommendedList.isEmpty() ? List.of("Rice", "Dal", "Banana", "Papaya", "Coconut Water") : recommendedList)
                .foodsToAvoid(avoidList.isEmpty() ? List.of("Deep Fried Foods", "Spicy Foods", "Street Foods") : avoidList)
                .recoveryTips(plan.getRecoveryTips() != null && !plan.getRecoveryTips().isBlank() ? plan.getRecoveryTips() : "Take adequate rest, maintain hydration with warm fluids, and monitor symptoms.")
                .medicalAdvice(plan.getMedicalAdvice() != null && !plan.getMedicalAdvice().isBlank() ? plan.getMedicalAdvice() : "Consult a qualified physician for clinical medical guidance.")
                .createdAt(plan.getCreatedAt())
                .build();
    }

    private String parseNodeToString(JsonNode node) {
        if (node == null || node.isNull()) return null;
        if (node.isArray()) {
            List<String> items = new ArrayList<>();
            node.forEach(item -> {
                String text = sanitizeIndianFoods(item.asText().trim());
                if (!text.isEmpty()) items.add(text);
            });
            return String.join(", ", items);
        }
        return sanitizeIndianFoods(node.asText().trim());
    }

    private String sanitizeIndianFoods(String text) {
        if (text == null || text.isBlank()) return text;
        return text.replaceAll("(?i)\\bsalmon\\b", "Fish Curry")
                   .replaceAll("(?i)\\bquinoa\\b", "Dahi Chuda / Rice")
                   .replaceAll("(?i)\\bavocado\\b", "Papaya / Banana")
                   .replaceAll("(?i)\\bsteak\\b", "Paneer Sabzi / Egg Curry")
                   .replaceAll("(?i)\\boatmeal\\b", "Ragi Porridge / Upma")
                   .replaceAll("(?i)\\bbroccoli\\b", "Cauliflower / Green Sabzi")
                   .replaceAll("(?i)\\bblueberries?\\b", "Pomegranate")
                   .replaceAll("(?i)\\bchia seeds?\\b", "Sabja Seeds");
    }
}
