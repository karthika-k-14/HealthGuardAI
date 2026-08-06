package com.healthguard.mapper;

import com.healthguard.dto.ReferralResponse;
import com.healthguard.entity.Referral;
import org.springframework.stereotype.Component;

/**
 * Converts between {@link Referral} and its DTOs for the Referral CRUD
 * module.
 */
@Component
public class ReferralMapper {

    public ReferralResponse toResponse(Referral referral) {
        return ReferralResponse.builder()
                .id(referral.getId())
                .uuid(referral.getUuid())
                .citizenName(referral.getCitizenName())
                .referredBy(referral.getReferredBy())
                .fromFacility(referral.getFromFacility())
                .toFacility(referral.getToFacility())
                .reason(referral.getReason())
                .notes(referral.getNotes())
                .status(referral.getStatus())
                .createdAt(referral.getCreatedAt())
                .updatedAt(referral.getUpdatedAt())
                .build();
    }
}
