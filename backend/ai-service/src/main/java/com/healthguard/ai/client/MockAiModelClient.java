package com.healthguard.ai.client;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

@Component
public class MockAiModelClient implements AiModelClient {

    private static final Logger log = LoggerFactory.getLogger(MockAiModelClient.class);
    private static final ObjectMapper objectMapper = new ObjectMapper();

    private final OllamaClient ollamaClient;

    public MockAiModelClient(OllamaClient ollamaClient) {
        this.ollamaClient = ollamaClient;
    }

    @Override
    public String generateChatResponse(String question) {
        String systemPrompt = "You are HealthGuard AI, an evidence-based healthcare triage assistant. Provide concise, safe, and helpful responses.";
        String response = ollamaClient.generateCompletion(question, systemPrompt);
        return (response != null && !response.isBlank()) ? response : null;
    }

    @Override
    public SymptomAnalysisResult analyzeSymptoms(String symptoms) {
        String prompt = "Assess the following symptoms: " + symptoms + ".\n" +
                "Return ONLY a valid JSON object with keys:\n" +
                "{\n" +
                "  \"prediction\": \"...\",\n" +
                "  \"riskLevel\": \"LOW|MODERATE|HIGH\",\n" +
                "  \"recommendation\": \"...\"\n" +
                "}";

        String systemPrompt = "You are HealthGuard AI, an evidence-based healthcare assistant.\n" +
                "CRITICAL RULES:\n" +
                "You MUST ALWAYS return a raw JSON object with NONE of the fields empty, null, or blank.\n" +
                "Do NOT wrap in markdown code blocks or add any extra text.\n" +
                "Recommendations based on risk level:\n" +
                "- For LOW risk: Rest, stay hydrated, monitor symptoms, and seek medical care if symptoms worsen.\n" +
                "- For MODERATE risk: Consult a physician within 24-48 hours and continue hydration and symptom monitoring.\n" +
                "- For HIGH/EMERGENCY risk: Seek immediate medical evaluation.";

        String response = ollamaClient.generateCompletion(prompt, systemPrompt);

        if (response != null && !response.isBlank()) {
            log.info("[RAW GEMINI SYMPTOM RESPONSE]:\n{}", response);

            String prediction = null;
            String riskLevel = null;
            String recommendation = null;

            // Attempt 1: Try JSON Parsing
            try {
                int jsonStart = response.indexOf("{");
                int jsonEnd = response.lastIndexOf("}");
                if (jsonStart != -1 && jsonEnd != -1 && jsonEnd > jsonStart) {
                    String jsonStr = response.substring(jsonStart, jsonEnd + 1);
                    JsonNode node = objectMapper.readTree(jsonStr);
                    if (node.has("prediction") && !node.get("prediction").asText().isBlank()) {
                        prediction = node.get("prediction").asText().trim();
                    }
                    if (node.has("riskLevel") && !node.get("riskLevel").asText().isBlank()) {
                        riskLevel = node.get("riskLevel").asText().trim().toUpperCase();
                    }
                    if (node.has("recommendation") && !node.get("recommendation").asText().isBlank()) {
                        recommendation = node.get("recommendation").asText().trim();
                    }
                }
            } catch (Exception e) {
                log.warn("Could not parse Gemini response as JSON, falling back to line parsing: {}", e.getMessage());
            }

            // Attempt 2: Structured Line-by-Line / Multi-Line Text Parsing Fallback
            if (prediction == null || riskLevel == null || recommendation == null || recommendation.isBlank()) {
                StringBuilder recBuilder = new StringBuilder();
                boolean capturingRec = false;

                String[] lines = response.split("\n");
                for (String line : lines) {
                    String lineTrimmed = line.trim();
                    if (lineTrimmed.isEmpty()) continue;

                    String lower = lineTrimmed.toLowerCase();
                    if (lower.startsWith("prediction:")) {
                        prediction = lineTrimmed.substring(lineTrimmed.indexOf(":") + 1).trim();
                        capturingRec = false;
                    } else if (lower.startsWith("risk level:") || lower.startsWith("risklevel:")) {
                        riskLevel = lineTrimmed.substring(lineTrimmed.indexOf(":") + 1).trim().toUpperCase();
                        capturingRec = false;
                    } else if (lower.startsWith("recommendation:") || lower.startsWith("recommendations:")) {
                        String afterColon = lineTrimmed.substring(lineTrimmed.indexOf(":") + 1).trim();
                        if (!afterColon.isEmpty()) {
                            recBuilder.append(afterColon).append(" ");
                        }
                        capturingRec = true;
                    } else if (capturingRec) {
                        recBuilder.append(lineTrimmed).append(" ");
                    }
                }

                if (recommendation == null || recommendation.isBlank()) {
                    recommendation = recBuilder.toString().trim();
                }
            }

            // Fallback for prediction if empty
            if (prediction == null || prediction.isBlank()) {
                prediction = "Clinical Health Assessment";
            }

            // Fallback for riskLevel if empty
            if (riskLevel == null || riskLevel.isBlank()) {
                String respUpper = response.toUpperCase();
                if (respUpper.contains("EMERGENCY") || respUpper.contains("CRITICAL")) riskLevel = "HIGH";
                else if (respUpper.contains("HIGH")) riskLevel = "HIGH";
                else if (respUpper.contains("MODERATE") || respUpper.contains("MEDIUM")) riskLevel = "MODERATE";
                else riskLevel = "LOW";
            }

            // Fallback for recommendation if header line was blank but response contains body text
            if ((recommendation == null || recommendation.isBlank()) && response != null) {
                String clean = response.replaceAll("(?i)prediction:[^\n]*", "")
                                       .replaceAll("(?i)risk level:[^\n]*", "")
                                       .trim();
                if (!clean.isBlank()) {
                    recommendation = clean;
                }
            }

            // Guaranteed risk-aligned non-empty recommendation fallback
            if (recommendation == null || recommendation.isBlank()) {
                if ("HIGH".equals(riskLevel) || "EMERGENCY".equals(riskLevel) || "CRITICAL".equals(riskLevel)) {
                    recommendation = "Seek immediate medical evaluation.";
                } else if ("MODERATE".equals(riskLevel) || "MEDIUM".equals(riskLevel)) {
                    recommendation = "Consult a physician within 24-48 hours and continue hydration and symptom monitoring.";
                } else {
                    recommendation = "Rest, stay hydrated, monitor symptoms, and seek medical care if symptoms worsen.";
                }
            }

            log.info("[PARSED SYMPTOM ANALYSIS RESULT]: prediction='{}', riskLevel='{}', recommendation='{}'",
                    prediction, riskLevel, recommendation);

            return new SymptomAnalysisResult(
                    prediction.trim(),
                    riskLevel.trim(),
                    recommendation.trim()
            );
        }

        // Final safety fallback if AI response is null
        return new SymptomAnalysisResult(
                "Clinical Symptom Assessment",
                "LOW",
                "Rest, stay hydrated, monitor symptoms, and seek medical care if symptoms worsen."
        );
    }
}
