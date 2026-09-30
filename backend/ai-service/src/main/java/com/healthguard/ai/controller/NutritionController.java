package com.healthguard.ai.controller;

import com.healthguard.ai.dto.ApiResponse;
import com.healthguard.ai.dto.NutritionPlanRequest;
import com.healthguard.ai.dto.NutritionPlanResponse;
import com.healthguard.ai.service.NutritionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ai/nutrition")
@RequiredArgsConstructor
public class NutritionController {

    private final NutritionService nutritionService;

    @PostMapping("/generate")
    public ResponseEntity<ApiResponse<NutritionPlanResponse>> generateNutritionPlan(
            @RequestHeader(value = "X-User-Id", required = false) String headerUserId,
            @Valid @RequestBody NutritionPlanRequest request) {
        if (headerUserId != null && !headerUserId.isBlank()) {
            request.setUserId(Long.valueOf(headerUserId));
        }
        NutritionPlanResponse response = nutritionService.generateAndSaveNutritionPlan(request);
        return new ResponseEntity<>(
                ApiResponse.success("Personalized AI nutrition plan generated successfully", response),
                HttpStatus.CREATED
        );
    }

    @GetMapping("/history/{userId}")
    public ResponseEntity<ApiResponse<?>> getNutritionHistory(
            @RequestHeader(value = "X-User-Id", required = false) String headerUserId,
            @PathVariable Long userId,
            @RequestParam(value = "requesterUserId", required = false) Long requesterUserId,
            @RequestParam(value = "page", required = false) Integer page,
            @RequestParam(value = "size", required = false, defaultValue = "20") Integer size) {
        
        Long effectiveRequester = (headerUserId != null && !headerUserId.isBlank()) ? Long.valueOf(headerUserId) : requesterUserId;
        
        if (effectiveRequester != null && !effectiveRequester.equals(userId)) {
            throw new AccessDeniedException("Unauthorized: You do not have permission to view another user's nutrition plan history");
        }
        if (page != null) {
            Page<NutritionPlanResponse> pagedResponse = nutritionService.getNutritionHistoryByUserId(userId, PageRequest.of(page, size));
            return ResponseEntity.ok(ApiResponse.success("Nutrition plan history retrieved successfully", pagedResponse));
        }
        List<NutritionPlanResponse> response = nutritionService.getNutritionHistoryByUserId(userId);
        return ResponseEntity.ok(ApiResponse.success("Nutrition plan history retrieved successfully", response));
    }

    @GetMapping("/latest/{userId}")
    public ResponseEntity<ApiResponse<NutritionPlanResponse>> getLatestNutritionPlan(
            @PathVariable Long userId,
            @RequestParam(value = "requesterUserId", required = false) Long requesterUserId) {
        if (requesterUserId != null && !requesterUserId.equals(userId)) {
            throw new AccessDeniedException("Unauthorized: You do not have permission to view another user's nutrition plan");
        }
        NutritionPlanResponse response = nutritionService.getLatestNutritionPlanByUserId(userId);
        return ResponseEntity.ok(ApiResponse.success("Latest nutrition plan retrieved successfully", response));
    }

    @GetMapping("/search")
    @PreAuthorize("hasRole('ADMIN') or hasRole('HEALTH_OFFICER')")
    public ResponseEntity<ApiResponse<Page<NutritionPlanResponse>>> searchNutritionPlans(
            @RequestParam(value = "keyword", required = false) String keyword,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "20") int size) {
        Page<NutritionPlanResponse> pagedResponse = nutritionService.searchNutritionPlans(keyword, PageRequest.of(page, size));
        return ResponseEntity.ok(ApiResponse.success("Nutrition plans search completed", pagedResponse));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteNutritionPlan(
            @PathVariable Long id,
            @RequestParam(value = "requesterUserId", required = false) Long requesterUserId) {
        nutritionService.deleteNutritionPlan(id, requesterUserId);
        return ResponseEntity.ok(ApiResponse.success("Nutrition plan deleted successfully", null));
    }
}

