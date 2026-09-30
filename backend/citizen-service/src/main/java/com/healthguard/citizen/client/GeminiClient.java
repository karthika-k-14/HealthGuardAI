package com.healthguard.citizen.client;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.*;

@Slf4j
@Component
public class GeminiClient {

    private final String apiKey;
    private final String model;
    private final String baseUrl;
    private final int timeoutSeconds;
    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;

    public GeminiClient(
            @Value("${gemini.api.key:}") String apiKey,
            @Value("${gemini.model:gemma-4-26b-a4b-it}") String model,
            @Value("${gemini.url:https://generativelanguage.googleapis.com/v1beta/models}") String baseUrl,
            @Value("${gemini.timeout-seconds:25}") int timeoutSeconds,
            ObjectMapper objectMapper) {

        this.apiKey = apiKey != null ? apiKey.trim() : "";
        String rawModel = (model != null && !model.isBlank()) ? model.trim() : "gemma-4-26b-a4b-it";
        this.model = rawModel.startsWith("models/") ? rawModel.substring(7) : rawModel;
        this.baseUrl = (baseUrl != null && !baseUrl.isBlank()) ? baseUrl.trim().replaceAll("/+$", "") : "https://generativelanguage.googleapis.com/v1beta/models";
        this.timeoutSeconds = timeoutSeconds > 0 ? timeoutSeconds : 25;
        this.objectMapper = objectMapper != null ? objectMapper : new ObjectMapper();

        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(this.timeoutSeconds))
                .build();

        log.info("[GeminiClient] Initialized with Model={}, ApiKeyPresent={}, BaseUrl={}",
                this.model, !this.apiKey.isBlank(), this.baseUrl);
    }

    /**
     * Generates rich, genuine health education and disease overview for informational queries.
     * Strictly avoids mock data and never returns risk scores or urgency levels for pure inquiries.
     */
    public String generateHealthGuidance(String userQuery, String language) {
        String lang = (language != null && !language.isBlank()) ? language : "English";
        String prompt = String.format(
                "You are HealthGuard AI, an expert, compassionate medical clinical assistant.\n" +
                "The user is asking the following educational or medical inquiry: \"%s\"\n\n" +
                "Provide a comprehensive, clinically accurate, and easily understandable guide in %s.\n" +
                "Do NOT use mock templates. Respond directly and accurately to their specific question.\n\n" +
                "Structure your response clearly with these sections:\n" +
                "• Overview & Definition\n" +
                "• Common Causes & Risk Factors\n" +
                "• Key Signs & Symptoms\n" +
                "• Prevention, Diet & Lifestyle Recommendations\n" +
                "• Government Health Guidelines & When to Seek Medical Care (mention Indian public health initiatives such as Anemia Mukt Bharat, NVBDCP, IDSP, or Ayushman Bharat if applicable)\n\n" +
                "STRICT SAFETY CONSTRAINT:\n" +
                "Do NOT assign patient risk scores, urgency levels, or triage classifications here, as this is an educational inquiry.",
                userQuery, lang
        );

        String result = callGemini(prompt, 950);
        if (result != null && !result.isBlank()) {
            return cleanGuidanceOutput(result.trim());
        }
        return null;
    }

    /**
     * Generates empathetic, doctor-like follow-up inquiries one by one for multi-turn triage.
     */
    public String generateDoctorFollowUp(int stage, List<String> symptoms, String latestInput, String prevContext, String language) {
        String symStr = (symptoms != null && !symptoms.isEmpty()) ? String.join(", ", symptoms) : latestInput;
        String lang = (language != null && !language.isBlank()) ? language : "English";

        String prompt;
        if (stage == 1) {
            prompt = String.format(
                    "You are an empathetic medical doctor on HealthGuard AI.\n" +
                    "The patient reported these symptoms: \"%s\".\n" +
                    "Directly speak to the patient in 2 short sentences:\n" +
                    "Sentence 1: Warmly acknowledge their symptoms.\n" +
                    "Sentence 2: Ask Question 1 of 3: How long have you been experiencing these symptoms, and did they start suddenly or develop gradually?\n" +
                    "Language: %s.\n" +
                    "Reply ONLY with the doctor's spoken words. No bullet points, no preamble, no role labels.",
                    symStr, lang
            );
        } else if (stage == 2) {
            prompt = String.format(
                    "You are an empathetic medical doctor on HealthGuard AI.\n" +
                    "The patient with symptoms \"%s\" says their symptoms lasted: \"%s\".\n" +
                    "Directly speak to the patient in 2 short sentences:\n" +
                    "Sentence 1: Acknowledge the duration they reported.\n" +
                    "Sentence 2: Ask Question 2 of 3: On a scale of 1 to 10, how severe is the discomfort, and is it constant or coming in waves with chills?\n" +
                    "Language: %s.\n" +
                    "Reply ONLY with the doctor's spoken words. No bullet points, no preamble, no role labels.",
                    symStr, latestInput, lang
            );
        } else {
            prompt = String.format(
                    "You are an empathetic medical doctor on HealthGuard AI.\n" +
                    "The patient with symptoms \"%s\" says their severity is: \"%s\".\n" +
                    "Directly speak to the patient in 2 short sentences:\n" +
                    "Sentence 1: Acknowledge the severity.\n" +
                    "Sentence 2: Ask Question 3 of 3: Are you noticing any critical associated warning signs such as vomiting, dark urine, yellowish eyes, rash, or breathing difficulty?\n" +
                    "Language: %s.\n" +
                    "Reply ONLY with the doctor's spoken words. No bullet points, no preamble, no role labels.",
                    symStr, latestInput, lang
            );
        }

        String result = callGemini(prompt, 600);
        if (result != null && !result.isBlank()) {
            return cleanSpokenOutput(result.trim());
        }
        return null;
    }

    private String cleanGuidanceOutput(String raw) {
        if (raw == null || raw.isBlank()) return null;
        String[] lines = raw.trim().split("\r?\n");
        StringBuilder sb = new StringBuilder();
        for (String line : lines) {
            String l = line.trim();
            if (l.startsWith("*   Role:") || l.startsWith("* Role:") || l.startsWith("*   Platform:")
                    || l.startsWith("*   Persona:") || l.startsWith("* Persona:")
                    || l.startsWith("*   User Inquiry:") || l.startsWith("*   Goal:") || l.startsWith("*   Constraints:")
                    || l.startsWith("*   Structure:") || l.startsWith("*   Language:")
                    || l.startsWith("*   Tone Check:") || l.startsWith("*   Clarity Check:") || l.startsWith("*   Safety Check:")
                    || l.startsWith("*   Accuracy Check:") || l.startsWith("*   Constraint Check:")
                    || l.startsWith("*   Compliance Check:") || l.startsWith("*   Ensure") || l.startsWith("*   Check")
                    || l.startsWith("*   Tone:") || l.startsWith("*   Self-Correction") || l.startsWith("*   Disclaimer:")) {
                continue;
            }
            sb.append(line).append("\n");
        }
        String res = sb.toString().trim();
        return !res.isBlank() ? res : raw.trim();
    }

    private String cleanSpokenOutput(String raw) {
        if (raw == null || raw.isBlank()) return null;
        String trimmed = raw.trim();
        String[] lines = trimmed.split("\r?\n");
        StringBuilder sb = new StringBuilder();
        for (String line : lines) {
            String l = line.trim();
            if (l.startsWith("*") || l.startsWith("-") || l.startsWith("#") || l.contains("Task:") || l.contains("Language:") || l.contains("Role:") || l.contains("Constraints:") || l.contains("Platform:") || l.contains("Persona:")) {
                continue;
            }
            if (l.contains("?")) {
                sb.append(l).append(" ");
                break;
            }
        }
        String res = sb.toString().replace("\"", "").trim();
        return res.length() > 25 ? res : null;
    }

    public static class FinalTriageResult {
        public String diseaseCategory; // GASTRO, VECTOR_BORNE, RESPIRATORY, CARDIAC, NEUROLOGICAL, GENERAL
        public String urgencyLevel;    // LOW, MEDIUM, HIGH, CRITICAL
        public Double riskScore;       // 0 - 100
        public Double confidence;      // 0.80 - 0.98
        public String clinicalSummary;
        public List<String> recommendations = new ArrayList<>();
        public boolean escalateToAsha;
        public String detailedReport;
    }

    /**
     * Synthesizes patient symptoms and answers to all 3 doctor questions to produce final triage assessment.
     */
    public FinalTriageResult generateFinalTriage(String symptoms, String duration, String severity, String associated, String language) {
        String lang = (language != null && !language.isBlank()) ? language : "English";
        String prompt = String.format(
                "You are an expert Clinical Triage Physician on HealthGuard AI.\n" +
                "Evaluate this patient case based on their full intake responses:\n" +
                "- Initial Symptoms: %s\n" +
                "- Question 1 (Duration & Onset): %s\n" +
                "- Question 2 (Severity & Pattern): %s\n" +
                "- Question 3 (Associated Signs): %s\n" +
                "Language: %s.\n\n" +
                "Analyze the clinical risk and return ONLY a valid JSON object (no markdown block wrapper) with these exact keys:\n" +
                "{\n" +
                "  \"diseaseCategory\": \"GASTRO\" or \"VECTOR_BORNE\" or \"RESPIRATORY\" or \"CARDIAC\" or \"NEUROLOGICAL\" or \"GENERAL\",\n" +
                "  \"urgencyLevel\": \"LOW\" or \"MEDIUM\" or \"HIGH\" or \"CRITICAL\",\n" +
                "  \"riskScore\": <number between 0 and 100>,\n" +
                "  \"confidence\": <number between 0.80 and 0.98>,\n" +
                "  \"clinicalSummary\": \"<concise medical impression of the condition>\",\n" +
                "  \"recommendations\": [\"<rec 1>\", \"<rec 2>\", \"<rec 3>\", \"<rec 4>\"],\n" +
                "  \"escalateToAsha\": <true if urgencyLevel is HIGH or CRITICAL, otherwise false>,\n" +
                "  \"detailedReport\": \"<a complete, structured doctor evaluation report addressing the patient warmly with Intake Summary, Clinical Findings, Recommended Next Steps, and Escalation Advice>\"\n" +
                "}",
                symptoms, duration, severity, associated, lang
        );

        String jsonResp = callGemini(prompt, 900);
        if (jsonResp != null && !jsonResp.isBlank()) {
            try {
                // Clean potential markdown wrapper
                String cleaned = jsonResp.trim();
                if (cleaned.startsWith("```")) {
                    int firstNewline = cleaned.indexOf("\n");
                    int lastBackticks = cleaned.lastIndexOf("```");
                    if (firstNewline != -1 && lastBackticks > firstNewline) {
                        cleaned = cleaned.substring(firstNewline + 1, lastBackticks).trim();
                    }
                }

                JsonNode node = objectMapper.readTree(cleaned);
                FinalTriageResult res = new FinalTriageResult();
                res.diseaseCategory = node.has("diseaseCategory") ? node.get("diseaseCategory").asText("GENERAL") : "GENERAL";
                res.urgencyLevel = node.has("urgencyLevel") ? node.get("urgencyLevel").asText("MEDIUM") : "MEDIUM";
                res.riskScore = node.has("riskScore") ? node.get("riskScore").asDouble(50.0) : 50.0;
                res.confidence = node.has("confidence") ? node.get("confidence").asDouble(0.90) : 0.90;
                res.clinicalSummary = node.has("clinicalSummary") ? node.get("clinicalSummary").asText("") : "";
                res.detailedReport = node.has("detailedReport") ? node.get("detailedReport").asText("") : "";
                res.escalateToAsha = node.has("escalateToAsha")
                        ? node.get("escalateToAsha").asBoolean(false)
                        : ("HIGH".equalsIgnoreCase(res.urgencyLevel) || "CRITICAL".equalsIgnoreCase(res.urgencyLevel));

                if (node.has("recommendations") && node.get("recommendations").isArray()) {
                    for (JsonNode rNode : node.get("recommendations")) {
                        res.recommendations.add(rNode.asText());
                    }
                }
                return res;
            } catch (Exception e) {
                log.warn("[GeminiClient] Could not parse JSON triage response: {}. Content: {}", e.getMessage(), jsonResp);
            }
        }
        return null;
    }

    /**
     * Executes HTTP POST call to Google Gemini generateContent endpoint.
     */
    private String callGemini(String promptText, int maxTokens) {
        if (apiKey.isBlank()) {
            log.warn("[GeminiClient] No API key configured for Gemini.");
            return null;
        }

        try {
            String endpoint = String.format("%s/%s:generateContent?key=%s", baseUrl, model, apiKey);

            Map<String, Object> textPart = Map.of("text", promptText);
            Map<String, Object> partsContainer = Map.of("parts", List.of(textPart));
            Map<String, Object> genConfig = Map.of(
                    "temperature", 0.3,
                    "maxOutputTokens", maxTokens > 0 ? maxTokens : 800
            );

            Map<String, Object> payload = Map.of(
                    "contents", List.of(partsContainer),
                    "generationConfig", genConfig
            );

            String requestBody = objectMapper.writeValueAsString(payload);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(endpoint))
                    .header("Content-Type", "application/json")
                    .timeout(Duration.ofSeconds(timeoutSeconds))
                    .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                    .build();

            log.info("[GeminiClient] Sending request to Gemini [Model={}, PromptLength={}]", model, promptText.length());
            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() >= 200 && response.statusCode() < 300) {
                JsonNode root = objectMapper.readTree(response.body());
                JsonNode candidates = root.path("candidates");
                if (candidates.isArray() && !candidates.isEmpty()) {
                    JsonNode parts = candidates.get(0).path("content").path("parts");
                    if (parts.isArray() && !parts.isEmpty()) {
                        String text = parts.get(0).path("text").asText("");
                        log.info("[GeminiClient] Received successful response ({} chars)", text.length());
                        return text;
                    }
                }
            } else {
                log.error("[GeminiClient] Gemini API returned error status {}: {}", response.statusCode(), response.body());
            }
        } catch (Exception e) {
            log.error("[GeminiClient] Error executing call to Gemini API: {}", e.getMessage(), e);
        }
        return null;
    }
}
