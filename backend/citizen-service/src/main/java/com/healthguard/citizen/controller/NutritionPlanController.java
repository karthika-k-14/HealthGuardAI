package com.healthguard.citizen.controller;

import com.healthguard.citizen.dto.ApiResponse;
import com.healthguard.citizen.service.ClinicalNutritionService;
import com.healthguard.citizen.service.ClinicalNutritionService.NutritionGenerateRequest;
import com.healthguard.citizen.service.ClinicalNutritionService.NutritionPlanResult;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping({"/api/nutrition", "/api/ai/nutrition"})
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class NutritionPlanController {

    private final ClinicalNutritionService clinicalNutritionService;

    /**
     * Requirement: POST /api/nutrition/generate
     * Generates visibly distinct condition-aware nutrition plan based on:
     * - Citizen profile (age, gender, height, weight, BMI)
     * - Medical history
     * - Disease condition (Fever, Diabetes, Hypertension, Anemia, Malnutrition)
     */
    @PostMapping("/generate")
    public ResponseEntity<ApiResponse<NutritionPlanResult>> generateNutritionPlan(
            @RequestHeader(value = "X-User-Id", required = false) String headerUserId,
            @RequestBody NutritionGenerateRequest request) {

        if (request.getCitizenId() == null && request.getUserId() == null && headerUserId != null && !headerUserId.isBlank()) {
            try {
                request.setCitizenId(Long.parseLong(headerUserId));
            } catch (Exception ignored) {}
        }

        log.info("Generating nutrition plan for condition: {}, citizenId: {}", request.getCondition(), request.getCitizenId());
        NutritionPlanResult plan = clinicalNutritionService.generatePlan(request);
        return ResponseEntity.ok(ApiResponse.success("Condition-aware clinical nutrition plan generated successfully", plan));
    }
}
