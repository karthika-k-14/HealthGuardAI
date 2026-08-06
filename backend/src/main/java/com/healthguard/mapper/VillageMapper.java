package com.healthguard.mapper;

import com.healthguard.dto.VillageResponse;
import com.healthguard.entity.Village;
import org.springframework.stereotype.Component;

/**
 * Converts {@link Village} into {@link VillageResponse} for the read-only
 * admin village listing that backs the Broadcast Notification "Send to
 * Village" target picker.
 */
@Component
public class VillageMapper {

    public VillageResponse toResponse(Village village) {
        return VillageResponse.builder()
                .id(village.getId())
                .uuid(village.getUuid())
                .villageName(village.getVillageName())
                .district(village.getDistrict())
                .state(village.getState())
                .population(village.getPopulation())
                .build();
    }
}
