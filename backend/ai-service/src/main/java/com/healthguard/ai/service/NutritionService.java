package com.healthguard.ai.service;

import com.healthguard.ai.dto.NutritionPlanRequest;
import com.healthguard.ai.dto.NutritionPlanResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface NutritionService {

    NutritionPlanResponse generateAndSaveNutritionPlan(NutritionPlanRequest request);

    List<NutritionPlanResponse> getNutritionHistoryByUserId(Long userId);

    Page<NutritionPlanResponse> getNutritionHistoryByUserId(Long userId, Pageable pageable);

    NutritionPlanResponse getLatestNutritionPlanByUserId(Long userId);

    Page<NutritionPlanResponse> searchNutritionPlans(String keyword, Pageable pageable);

    void deleteNutritionPlan(Long id, Long requesterUserId);
}

