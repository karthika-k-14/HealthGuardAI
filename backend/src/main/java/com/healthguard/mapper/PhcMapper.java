package com.healthguard.mapper;

import com.healthguard.dto.PhcResponse;
import com.healthguard.entity.Phc;
import com.healthguard.entity.Village;
import org.springframework.stereotype.Component;

/**
 * Converts between {@link Phc} and its DTOs for the Admin PHC CRUD module.
 * Kept separate from {@link OfficerMapper}, which maps PHCs into the
 * Health Officer's read-scoped view.
 */
@Component
public class PhcMapper {

    public PhcResponse toResponse(Phc phc) {
        Village village = phc.getVillage();
        return PhcResponse.builder()
                .id(phc.getId())
                .uuid(phc.getUuid())
                .name(phc.getName())
                .address(phc.getAddress())
                .district(phc.getDistrict())
                .phone(phc.getPhone())
                .latitude(phc.getLatitude())
                .longitude(phc.getLongitude())
                .villageId(village != null ? village.getId() : null)
                .villageName(village != null ? village.getVillageName() : null)
                .createdAt(phc.getCreatedAt())
                .updatedAt(phc.getUpdatedAt())
                .build();
    }
}
