package com.healthguard.ai.service;

import com.healthguard.ai.dto.SymptomRequest;
import com.healthguard.ai.dto.SymptomResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface SymptomService {

    SymptomResponse assessSymptoms(SymptomRequest request);

    List<SymptomResponse> getSymptomHistoryByUserId(Long userId);

    Page<SymptomResponse> getSymptomHistoryByUserId(Long userId, Pageable pageable);

    Page<SymptomResponse> getAssessmentsByRiskLevel(String riskLevel, Pageable pageable);

    Page<SymptomResponse> searchAssessments(String keyword, Pageable pageable);

    void deleteAssessment(Long id, Long requesterUserId);
}

