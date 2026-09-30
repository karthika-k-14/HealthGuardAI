package com.healthguard.ai.service.impl;

import com.healthguard.ai.client.AiModelClient;
import com.healthguard.ai.dto.SymptomRequest;
import com.healthguard.ai.dto.SymptomResponse;
import com.healthguard.ai.entity.SymptomAssessment;
import com.healthguard.ai.repository.SymptomAssessmentRepository;
import com.healthguard.ai.service.SymptomService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class SymptomServiceImpl implements SymptomService {

    private final SymptomAssessmentRepository symptomAssessmentRepository;
    private final AiModelClient aiModelClient;

    @Override
    @Transactional
    public SymptomResponse assessSymptoms(SymptomRequest request) {
        log.info("Processing symptom assessment for userId={}", request.getUserId());
        AiModelClient.SymptomAnalysisResult result = aiModelClient.analyzeSymptoms(request.getSymptoms());
        if (result == null) {
            log.warn("AI Model Client returned null result for symptoms='{}'", request.getSymptoms());
            throw new RuntimeException("AI service unavailable. Please try again later.");
        }

        Long targetUserId = request.getUserId();
        if (targetUserId == null) {
            throw new IllegalArgumentException("User ID is required");
        }

        SymptomAssessment assessment = SymptomAssessment.builder()
                .userId(targetUserId)
                .symptoms(request.getSymptoms())
                .prediction(result.prediction())
                .riskLevel(result.riskLevel())
                .recommendation(result.recommendation())
                .build();

        SymptomAssessment savedAssessment = symptomAssessmentRepository.save(assessment);
        log.info("Saved symptom assessment id={} for userId={} with riskLevel={}", savedAssessment.getId(), savedAssessment.getUserId(), savedAssessment.getRiskLevel());
        return mapToResponse(savedAssessment);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SymptomResponse> getSymptomHistoryByUserId(Long userId) {
        List<SymptomAssessment> assessments = symptomAssessmentRepository.findByUserIdOrderByCreatedAtDesc(userId);
        return assessments.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<SymptomResponse> getSymptomHistoryByUserId(Long userId, Pageable pageable) {
        return symptomAssessmentRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable).map(this::mapToResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<SymptomResponse> getAssessmentsByRiskLevel(String riskLevel, Pageable pageable) {
        return symptomAssessmentRepository.findByRiskLevelIgnoreCaseOrderByCreatedAtDesc(riskLevel, pageable).map(this::mapToResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<SymptomResponse> searchAssessments(String keyword, Pageable pageable) {
        return symptomAssessmentRepository.searchAssessments(keyword, pageable).map(this::mapToResponse);
    }

    @Override
    @Transactional
    public void deleteAssessment(Long id, Long requesterUserId) {
        SymptomAssessment assessment = symptomAssessmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Symptom assessment not found with id: " + id));

        if (requesterUserId != null && !requesterUserId.equals(assessment.getUserId())) {
            log.warn("IDOR attempt blocked: requesterUserId={} tried to delete assessment id={} owned by userId={}", requesterUserId, id, assessment.getUserId());
            throw new AccessDeniedException("Unauthorized: Cannot delete another user's symptom assessment");
        }

        symptomAssessmentRepository.delete(assessment);
        log.info("Deleted symptom assessment id={}", id);
    }

    private SymptomResponse mapToResponse(SymptomAssessment assessment) {
        return SymptomResponse.builder()
                .id(assessment.getId())
                .userId(assessment.getUserId())
                .symptoms(assessment.getSymptoms())
                .prediction(assessment.getPrediction())
                .riskLevel(assessment.getRiskLevel())
                .recommendation(assessment.getRecommendation())
                .createdAt(assessment.getCreatedAt())
                .build();
    }
}

