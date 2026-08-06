package com.healthguard.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

/**
 * Service for communicating with Google's official Gemini API.
 * Reads GEMINI_API_KEY from environment variables.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class GeminiService {

    @Value("${gemini.api.key:${GEMINI_API_KEY:}}")
    private String apiKey;

    private static final String GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=";
    private static final String GEMINI_FALLBACK_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=";

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final RestTemplate restTemplate = new RestTemplate();

    /**
     * Calls Google Gemini API with the given prompt string.
     *
     * @param prompt The complete prompt text
     * @return AI reply string
     */
    public String generateContent(String prompt) {
        String key = (apiKey != null && !apiKey.trim().isEmpty()) ? apiKey.trim() : System.getenv("GEMINI_API_KEY");

        if (key == null || key.trim().isEmpty()) {
            log.warn("GEMINI_API_KEY environment variable is not configured.");
            return "I'm unable to reach the AI assistant right now. Please try again later.";
        }

        long startTime = System.currentTimeMillis();
        try {
            String requestJson = objectMapper.writeValueAsString(Map.of(
                    "contents", List.of(
                            Map.of("parts", List.of(Map.of("text", prompt)))
                    )
            ));

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<String> entity = new HttpEntity<>(requestJson, headers);

            String url = GEMINI_API_URL + key.trim();
            ResponseEntity<String> response;
            try {
                response = restTemplate.postForEntity(url, entity, String.class);
            } catch (Exception primaryEx) {
                log.warn("gemini-2.5-flash call failed, retrying with gemini-1.5-flash: {}", primaryEx.getMessage());
                String fallbackUrl = GEMINI_FALLBACK_URL + key.trim();
                response = restTemplate.postForEntity(fallbackUrl, entity, String.class);
            }

            long latency = System.currentTimeMillis() - startTime;
            log.info("Gemini API call completed in {} ms", latency);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                JsonNode root = objectMapper.readTree(response.getBody());
                JsonNode candidates = root.path("candidates");
                if (candidates.isArray() && candidates.size() > 0) {
                    JsonNode parts = candidates.get(0).path("content").path("parts");
                    if (parts.isArray() && parts.size() > 0) {
                        return parts.get(0).path("text").asText();
                    }
                }
            }

            log.error("Unexpected Gemini response body structure: {}", response.getBody());
            return "I'm unable to reach the AI assistant right now. Please try again later.";

        } catch (Exception e) {
            long latency = System.currentTimeMillis() - startTime;
            log.error("Error communicating with Gemini API (latency {}ms): {}", latency, e.getMessage(), e);
            return "I'm unable to reach the AI assistant right now. Please try again later.";
        }
    }
}
