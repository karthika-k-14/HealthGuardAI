package com.healthguard.ai.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TriageRequest {

    @NotBlank(message = "User message / symptoms description cannot be blank")
    private String userQuery;

    private Integer age;
    private String gender;
    private Integer feverDays;
    private Integer painScore;
    private String existingConditions;
    private String currentMedications;
    private String language;
    private String sessionUuid;
    private Long userId;
    private Boolean resetSession;
}
