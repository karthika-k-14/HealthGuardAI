package com.healthguard.mapper;

import com.healthguard.dto.SchemeResponse;
import com.healthguard.entity.Scheme;
import org.springframework.stereotype.Component;

import java.util.ArrayList;

/**
 * Converts between {@link Scheme} and its DTOs for the Scheme CRUD module.
 */
@Component
public class SchemeMapper {

    public SchemeResponse toResponse(Scheme scheme) {
        return SchemeResponse.builder()
                .id(scheme.getId())
                .uuid(scheme.getUuid())
                .name(scheme.getName())
                .description(scheme.getDescription())
                .category(scheme.getCategory())
                .eligibility(scheme.getEligibility())
                .applyUrl(scheme.getApplyUrl())
                .benefits(scheme.getBenefits() != null ? new ArrayList<>(scheme.getBenefits()) : new ArrayList<>())
                .createdAt(scheme.getCreatedAt())
                .updatedAt(scheme.getUpdatedAt())
                .build();
    }
}
