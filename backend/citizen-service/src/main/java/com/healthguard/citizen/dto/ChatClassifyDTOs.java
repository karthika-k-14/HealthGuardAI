package com.healthguard.citizen.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

public class ChatClassifyDTOs {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ClassifyRequest {
        private String query;
        private Long citizenId;
        private String language;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ClassifyResponse {
        private Long id;
        private Long citizenId;
        private String query;
        private String diseaseCategory;
        private String urgencyLevel;
        private Double riskScore;
        private Double confidence;
        private Double confidenceScore;
        private String intent;
        private List<String> extractedSymptoms;
        private List<String> recommendations;
        private String clinicalSummary;
        private boolean autoEscalated;
        private String escalationDetails;
        private String escalationStatus;
        private String assignedWorker;
        private LocalDateTime createdAt;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ConsultRequest {
        private String message;
        private String query;
        private Long citizenId;
        private String language;
        private String category;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ConsultResponse {
        private Long id;
        private Long citizenId;
        private String query;
        private String response;
        private String clinicalSummary;
        private String diseaseCategory;
        private String urgencyLevel;
        private Double riskScore;
        private Double confidence;
        private Double confidenceScore;
        private String queryType; // SYMPTOM, DISEASE_AWARENESS, PREVENTION, FACILITY, GENERAL
        private List<String> extractedSymptoms;
        private List<String> recommendations;
        private Map<String, Object> diseaseDetails;
        private List<Map<String, Object>> facilities;
        private boolean emergencyEscalated;
        private String escalationStatus;
        private String assignedWorker;
        private String assignedAshaName;
        private Integer stage;
        @JsonProperty("isDoctorFollowUp")
        private boolean isDoctorFollowUp;
        private List<String> quickReplies;
        private LocalDateTime timestamp;
    }
}
