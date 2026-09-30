package com.healthguard.citizen.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IntentRequestDTO {

    @NotBlank(message = "Text cannot be empty or blank")
    private String text;
}
