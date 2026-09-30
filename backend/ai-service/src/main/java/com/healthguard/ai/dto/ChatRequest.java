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
public class ChatRequest {

    @NotNull(message = "User ID is required")
    private Long userId;

    @NotBlank(message = "Question is required")
    private String question;

    private String topic;

    private String language;

    private String imageBase64;
}
