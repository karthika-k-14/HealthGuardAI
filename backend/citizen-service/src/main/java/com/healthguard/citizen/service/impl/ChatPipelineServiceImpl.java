package com.healthguard.citizen.service.impl;

import com.healthguard.citizen.client.HealthAIClient;
import com.healthguard.citizen.dto.*;
import com.healthguard.citizen.entity.AIAnalysis;
import com.healthguard.citizen.exception.AIServiceUnavailableException;
import com.healthguard.citizen.repository.AIAnalysisRepository;
import com.healthguard.citizen.service.ChatPipelineService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChatPipelineServiceImpl implements ChatPipelineService {

    private final HealthAIClient healthAIClient;
    private final AIAnalysisRepository aiAnalysisRepository;

    @Override
    @Transactional
    public ChatAnalysisResponseDTO analyzeChat(ChatAnalysisRequestDTO request) {
        log.info("Processing AI Chat Analysis for Citizen ID: {}", request.getCitizenId());

        String messageText = request.getMessage();

        // Step 1: Call FastAPI Intent endpoint
        IntentRequestDTO intentReq = IntentRequestDTO.builder().text(messageText).build();
        IntentResponseDTO intentRes = healthAIClient.predictIntent(intentReq);
        if (intentRes == null || intentRes.getIntent() == null) {
            throw new AIServiceUnavailableException("Failed to obtain valid intent response from Health AI service");
        }
        log.info("FastAPI Intent Result: {}", intentRes.getIntent());

        // Step 2: Call FastAPI Disease endpoint
        DiseaseRequestDTO diseaseReq = DiseaseRequestDTO.builder().symptoms(messageText).build();
        DiseaseResponseDTO diseaseRes = healthAIClient.predictDisease(diseaseReq);
        if (diseaseRes == null || diseaseRes.getDiseaseCategory() == null) {
            throw new AIServiceUnavailableException("Failed to obtain valid disease classification from Health AI service");
        }
        log.info("FastAPI Disease Result: {}", diseaseRes.getDiseaseCategory());

        // Step 3: Call FastAPI Urgency endpoint
        UrgencyRequestDTO urgencyReq = UrgencyRequestDTO.builder().symptoms(messageText).build();
        UrgencyResponseDTO urgencyRes = healthAIClient.predictUrgency(urgencyReq);
        if (urgencyRes == null || urgencyRes.getUrgency() == null) {
            throw new AIServiceUnavailableException("Failed to obtain valid urgency score from Health AI service");
        }
        log.info("FastAPI Urgency Result: {}", urgencyRes.getUrgency());

        // Step 4: Determine aggregated confidence
        Double confidence = diseaseRes.getConfidence() != null ? diseaseRes.getConfidence() : intentRes.getConfidence();

        // Step 5: Save AI analysis entity to PostgreSQL
        AIAnalysis analysisEntity = AIAnalysis.builder()
                .citizenId(request.getCitizenId())
                .queryText(messageText)
                .intent(intentRes.getIntent())
                .disease(diseaseRes.getDiseaseCategory())
                .urgency(urgencyRes.getUrgency())
                .confidence(confidence)
                .build();

        AIAnalysis savedEntity = aiAnalysisRepository.save(analysisEntity);
        log.info("AI Analysis stored in PostgreSQL with ID: {}", savedEntity.getId());

        // Step 6: Return structured response
        return ChatAnalysisResponseDTO.builder()
                .id(savedEntity.getId())
                .citizenId(savedEntity.getCitizenId())
                .query(savedEntity.getQueryText())
                .intent(savedEntity.getIntent())
                .disease(savedEntity.getDisease())
                .urgency(savedEntity.getUrgency())
                .confidence(savedEntity.getConfidence())
                .timestamp(savedEntity.getCreatedAt())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ChatAnalysisResponseDTO> getHistoryByCitizenId(Long citizenId) {
        log.info("Fetching AI analysis history for Citizen ID: {}", citizenId);
        List<AIAnalysis> records = aiAnalysisRepository.findByCitizenIdOrderByCreatedAtDesc(citizenId);
        return records.stream()
                .map(entity -> ChatAnalysisResponseDTO.builder()
                        .id(entity.getId())
                        .citizenId(entity.getCitizenId())
                        .query(entity.getQueryText())
                        .intent(entity.getIntent())
                        .disease(entity.getDisease())
                        .urgency(entity.getUrgency())
                        .confidence(entity.getConfidence())
                        .timestamp(entity.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
    }
}
