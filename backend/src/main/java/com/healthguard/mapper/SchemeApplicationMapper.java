package com.healthguard.mapper;

import com.healthguard.dto.SchemeApplicationResponse;
import com.healthguard.entity.SchemeApplication;
import org.springframework.stereotype.Component;

/**
 * Converts between {@link SchemeApplication} and its DTOs for the Scheme
 * Beneficiary Management module.
 */
@Component
public class SchemeApplicationMapper {

    public SchemeApplicationResponse toResponse(SchemeApplication application) {
        return SchemeApplicationResponse.builder()
                .id(application.getId())
                .uuid(application.getUuid())
                .schemeId(application.getScheme().getId())
                .schemeName(application.getScheme().getName())
                .schemeCategory(application.getScheme().getCategory())
                .citizenId(application.getCitizen().getId())
                .citizenName(application.getCitizen().getFirstName() + " " + application.getCitizen().getLastName())
                .citizenPhone(application.getCitizen().getPhone())
                .status(application.getStatus())
                .remarks(application.getRemarks())
                .appliedAt(application.getCreatedAt())
                .reviewedAt(application.getReviewedAt())
                .build();
    }
}
