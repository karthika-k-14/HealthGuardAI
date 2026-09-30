package com.healthguard.ai.client;

public interface AiModelClient {

    String generateChatResponse(String question);

    SymptomAnalysisResult analyzeSymptoms(String symptoms);

    record SymptomAnalysisResult(String prediction, String riskLevel, String recommendation) {}
}
