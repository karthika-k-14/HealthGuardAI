package com.healthguard.citizen.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Citizen Health Analysis Response DTO")
public class ChatAnalysisResponseDTO {

    @Schema(description = "Database ID of saved analysis record", example = "101")
    private Long id;

    @Schema(description = "Unique Identifier of the Citizen", example = "1")
    private Long citizenId;

    @Schema(description = "Original query text analyzed", example = "I have fever and headache")
    private String query;

    @Schema(description = "Detected NLP Intent", example = "SYMPTOM_QUERY")
    private String intent;

    @Schema(description = "Classified Disease Category", example = "VIRAL_FEVER")
    private String disease;

    @Schema(description = "Urgency Level (LOW, MEDIUM, HIGH, CRITICAL)", example = "MEDIUM")
    private String urgency;

    @Schema(description = "AI Confidence Score (0.0 to 1.0)", example = "0.92")
    private Double confidence;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    @Schema(description = "Analysis Timestamp", example = "2026-08-17T12:00:00")
    private LocalDateTime timestamp;
}
