package com.healthguard.citizen.client;

import com.healthguard.citizen.config.AIClientConfig;
import com.healthguard.citizen.dto.*;
import com.healthguard.citizen.fallback.HealthAIClientFallback;
import jakarta.validation.Valid;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.Map;

@FeignClient(
    name = "health-ai-service",
    url = "${health.ai.service.url:http://localhost:8000}",
    configuration = AIClientConfig.class,
    fallback = HealthAIClientFallback.class
)
public interface HealthAIClient {

    @PostMapping("/predict-intent")
    IntentResponseDTO predictIntent(@Valid @RequestBody IntentRequestDTO request);

    @PostMapping("/predict-disease")
    DiseaseResponseDTO predictDisease(@Valid @RequestBody DiseaseRequestDTO request);

    @PostMapping("/predict-urgency")
    UrgencyResponseDTO predictUrgency(@Valid @RequestBody UrgencyRequestDTO request);

    @PostMapping("/translate")
    TranslationResponseDTO translate(@Valid @RequestBody TranslationRequestDTO request);

    @PostMapping("/api/nlp/analyze")
    ClinicalNlpDTOs.ClinicalNlpResponseDTO analyzeClinicalNlp(@RequestBody ClinicalNlpDTOs.ClinicalNlpRequestDTO request);

    @PostMapping("/api/nlp/extract-symptoms")
    Map<String, Object> extractSymptoms(@RequestBody Map<String, String> request);

    @PostMapping("/api/nlp/classify")
    Map<String, Object> classifyDisease(@RequestBody Map<String, String> request);

    @PostMapping("/forecast-demand")
    ForecastResponseDTO forecastDemand(@Valid @RequestBody ForecastRequestDTO request);

    @GetMapping("/health")
    Map<String, Object> getHealthStatus();
}
