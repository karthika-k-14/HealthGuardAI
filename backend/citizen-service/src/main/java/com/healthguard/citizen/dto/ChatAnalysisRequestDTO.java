package com.healthguard.citizen.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Citizen Health Query Request DTO")
public class ChatAnalysisRequestDTO {

    @NotNull(message = "Citizen ID is required")
    @Schema(description = "Unique Identifier of the Citizen", example = "1")
    private Long citizenId;

    @NotBlank(message = "Query message cannot be blank")
    @Schema(description = "Symptom description or health query message", example = "I have fever and headache")
    private String message;

    @Schema(description = "Optional language code (e.g. en, hi, ta, or)", example = "en")
    @Builder.Default
    private String language = "en";
}
