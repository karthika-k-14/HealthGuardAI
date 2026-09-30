package com.healthguard.ai.dto;

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
public class SymptomRequest {

    @NotNull(message = "User ID is required")
    private Long userId;

    @NotBlank(message = "Symptoms description is required")
    private String symptoms;
}
