package com.healthguard.citizen.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DiseaseSummaryDTO {
    private String id;
    private String name;
    private String nativeName;
    private String category;
    private String severity;
    private String summary;
    private List<String> symptoms;
    private List<String> prevention;
    private String icon;
}
