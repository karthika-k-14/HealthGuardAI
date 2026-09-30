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
public class TranslationRequestDTO {

    @NotBlank(message = "Text for translation cannot be blank")
    private String text;

    @Builder.Default
    private String sourceLang = "en";

    @Builder.Default
    private String targetLang = "hi";
}
