package com.healthguard.ai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SymptomResponse {

    private Long id;
    private Long userId;
    private String symptoms;
    private String prediction;
    private String riskLevel;
    private String recommendation;
    private LocalDateTime createdAt;
}
