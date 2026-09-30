package com.healthguard.ai.controller;

import com.healthguard.ai.dto.ApiResponse;
import com.healthguard.ai.dto.SymptomRequest;
import com.healthguard.ai.dto.SymptomResponse;
import com.healthguard.ai.service.SymptomService;
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
@RequestMapping({"/api/ai/symptoms", "/api/ai/analyze-symptoms"})
@RequiredArgsConstructor
public class SymptomController {

    private final SymptomService symptomService;

    @PostMapping
    public ResponseEntity<ApiResponse<SymptomResponse>> assessSymptoms(
            @RequestHeader(value = "X-User-Id", required = false) String headerUserId,
            @Valid @RequestBody SymptomRequest request) {
        if (headerUserId != null && !headerUserId.isBlank()) {
            request.setUserId(Long.valueOf(headerUserId));
        }
        SymptomResponse response = symptomService.assessSymptoms(request);
        return new ResponseEntity<>(
                ApiResponse.success("Symptom assessment completed successfully", response),
                HttpStatus.CREATED
        );
    }

    @GetMapping("/{userId}")
    public ResponseEntity<ApiResponse<?>> getSymptomHistory(
            @RequestHeader(value = "X-User-Id", required = false) String headerUserId,
            @PathVariable Long userId,
            @RequestParam(value = "requesterUserId", required = false) Long requesterUserId,
            @RequestParam(value = "page", required = false) Integer page,
            @RequestParam(value = "size", required = false, defaultValue = "20") Integer size) {
        
        Long effectiveRequester = requesterUserId;
        if (headerUserId != null && !headerUserId.isBlank()) {
            effectiveRequester = Long.valueOf(headerUserId);
        }

        if (effectiveRequester != null && !effectiveRequester.equals(userId)) {
            throw new AccessDeniedException("Unauthorized: You do not have permission to view another user's symptom history");
        }
        if (page != null) {
            Page<SymptomResponse> pagedResponse = symptomService.getSymptomHistoryByUserId(userId, PageRequest.of(page, size));
            return ResponseEntity.ok(ApiResponse.success("Symptom assessment history retrieved successfully", pagedResponse));
        }
        List<SymptomResponse> response = symptomService.getSymptomHistoryByUserId(userId);
        return ResponseEntity.ok(ApiResponse.success("Symptom assessment history retrieved successfully", response));
    }

    @GetMapping("/risk/{riskLevel}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('HEALTH_OFFICER')")
    public ResponseEntity<ApiResponse<Page<SymptomResponse>>> getAssessmentsByRiskLevel(
            @PathVariable String riskLevel,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "20") int size) {
        Page<SymptomResponse> pageResult = symptomService.getAssessmentsByRiskLevel(riskLevel, PageRequest.of(page, size));
        return ResponseEntity.ok(ApiResponse.success("Assessments retrieved for risk level: " + riskLevel, pageResult));
    }

    @GetMapping("/search")
    @PreAuthorize("hasRole('ADMIN') or hasRole('HEALTH_OFFICER')")
    public ResponseEntity<ApiResponse<Page<SymptomResponse>>> searchAssessments(
            @RequestParam(value = "keyword", required = false) String keyword,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "20") int size) {
        Page<SymptomResponse> pageResult = symptomService.searchAssessments(keyword, PageRequest.of(page, size));
        return ResponseEntity.ok(ApiResponse.success("Symptom assessments search completed", pageResult));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteAssessment(
            @RequestHeader(value = "X-User-Id", required = false) String headerUserId,
            @PathVariable Long id,
            @RequestParam(value = "requesterUserId", required = false) Long requesterUserId) {
        
        Long effectiveRequester = requesterUserId;
        if (headerUserId != null && !headerUserId.isBlank()) {
            effectiveRequester = Long.valueOf(headerUserId);
        }

        symptomService.deleteAssessment(id, effectiveRequester);
        return ResponseEntity.ok(ApiResponse.success("Symptom assessment deleted successfully", null));
    }
}

