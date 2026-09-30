package com.healthguard.ai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TriageResponse {

    private String riskLevel;// LOW RISK, MODERATE RISK, HIGH RISK, EMERGENCY
    private String language;
    private boolean emergencyAlert;
    private List<String> symptomsIdentified;
    private String assessment;
    private List<String> followUpQuestions;
    private List<String> recommendations;
    private String whenToSeekCare;
    private String disclaimer;
    private List<String> retrievedKnowledgeSources;
    private String formattedResponse;
    private String currentStage;
    private String nextStage;
    private String sessionUuid;
}
