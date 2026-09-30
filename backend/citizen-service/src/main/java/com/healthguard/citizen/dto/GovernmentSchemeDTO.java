package com.healthguard.citizen.dto;

import com.healthguard.citizen.entity.GovernmentScheme;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GovernmentSchemeDTO {

    private Long id;
    private String schemeName;
    private String description;
    private String benefits;
    private String eligibilityCriteria;
    private String officialLink;
    private String applicationLink;
    private String requiredDocuments;
    private String state;
    private String category;
    private Boolean isActive;
    private LocalDateTime createdAt;

    public static GovernmentSchemeDTO fromEntity(GovernmentScheme scheme) {
        if (scheme == null) return null;
        return GovernmentSchemeDTO.builder()
                .id(scheme.getId())
                .schemeName(scheme.getSchemeName())
                .description(scheme.getDescription())
                .benefits(scheme.getBenefits())
                .eligibilityCriteria(scheme.getEligibilityCriteria())
                .officialLink(scheme.getOfficialLink())
                .applicationLink(scheme.getApplicationLink())
                .requiredDocuments(scheme.getRequiredDocuments())
                .state(scheme.getState())
                .category(scheme.getCategory())
                .isActive(scheme.getIsActive())
                .createdAt(scheme.getCreatedAt())
                .build();
    }
}
