package com.healthguard.citizen.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

public class ClinicalNlpDTOs {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class ClinicalNlpRequestDTO {
        private String text;
        private String language;
        private Long citizenId;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class ClinicalNlpResponseDTO {
        private List<String> symptoms;
        private String diseaseCategory;
        private Double confidence;
        private Integer riskScore;
        private String urgencyLevel;
        private String reasoning;
        private List<String> recommendations;
        private Boolean safetyOverride;
    }
}
