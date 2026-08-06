package com.healthguard.mapper;

import com.healthguard.dto.HospitalResponse;
import com.healthguard.entity.Hospital;
import org.springframework.stereotype.Component;

/**
 * Converts between {@link Hospital} and its DTOs for the Hospital CRUD
 * module.
 */
@Component
public class HospitalMapper {

    public HospitalResponse toResponse(Hospital hospital) {
        return HospitalResponse.builder()
                .id(hospital.getId())
                .uuid(hospital.getUuid())
                .name(hospital.getName())
                .type(hospital.getType())
                .address(hospital.getAddress())
                .district(hospital.getDistrict())
                .phone(hospital.getPhone())
                .latitude(hospital.getLatitude())
                .longitude(hospital.getLongitude())
                .beds(hospital.getBeds())
                .emergencyServices(hospital.getEmergencyServices())
                .status(hospital.getStatus())
                .createdAt(hospital.getCreatedAt())
                .updatedAt(hospital.getUpdatedAt())
                .build();
    }
}
