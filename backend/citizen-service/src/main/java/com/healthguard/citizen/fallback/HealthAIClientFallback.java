package com.healthguard.citizen.fallback;

import com.healthguard.citizen.client.HealthAIClient;
import com.healthguard.citizen.dto.*;
import com.healthguard.citizen.exception.AIServiceUnavailableException;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
public class HealthAIClientFallback implements HealthAIClient {

    @Override
    public IntentResponseDTO predictIntent(IntentRequestDTO request) {
        throw new AIServiceUnavailableException("Health AI Service is unavailable.");
    }

    @Override
    public DiseaseResponseDTO predictDisease(DiseaseRequestDTO request) {
        throw new AIServiceUnavailableException("Health AI Service is unavailable.");
    }

    @Override
    public UrgencyResponseDTO predictUrgency(UrgencyRequestDTO request) {
        throw new AIServiceUnavailableException("Health AI Service is unavailable.");
    }

    @Override
    public TranslationResponseDTO translate(TranslationRequestDTO request) {
        throw new AIServiceUnavailableException("Health AI Service is unavailable.");
    }

    @Override
    public ClinicalNlpDTOs.ClinicalNlpResponseDTO analyzeClinicalNlp(ClinicalNlpDTOs.ClinicalNlpRequestDTO request) {
        throw new AIServiceUnavailableException("FastAPI NLP Service is unavailable.");
    }

    @Override
    public Map<String, Object> extractSymptoms(Map<String, String> request) {
        throw new AIServiceUnavailableException("FastAPI NLP Service is unavailable.");
    }

    @Override
    public Map<String, Object> classifyDisease(Map<String, String> request) {
        throw new AIServiceUnavailableException("FastAPI NLP Service is unavailable.");
    }

    @Override
    public ForecastResponseDTO forecastDemand(ForecastRequestDTO request) {
        throw new AIServiceUnavailableException("Health AI Service is unavailable.");
    }

    @Override
    public Map<String, Object> getHealthStatus() {
        throw new AIServiceUnavailableException("Health AI Service is unavailable.");
    }
}
