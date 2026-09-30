package com.healthguard.citizen.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DiseaseAwarenessResponseDTO {
    private String diseaseName;
    private String nativeName;
    private String category;
    private String severity;
    private String description;
    private List<String> symptoms;
    private List<String> prevention;
    private List<String> governmentRecommendations;
    private String treatment;
    private String language;
    private List<AwarenessVideoDTO> videos;
    private boolean isFallback;
    private String fallbackMessage;
    private List<DiseaseSummaryDTO> matchedDiseases;
}
