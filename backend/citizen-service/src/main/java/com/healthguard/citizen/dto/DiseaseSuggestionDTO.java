package com.healthguard.citizen.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DiseaseSuggestionDTO {
    private String id;
    private String name;
    private String nativeName;
    private String category;
    private String type; // "disease" or "symptom"
}
