package com.healthguard.mapper;

import com.healthguard.dto.SosRequestCreateRequest;
import com.healthguard.dto.SosRequestResponse;
import com.healthguard.entity.Citizen;
import com.healthguard.entity.SosRequest;
import org.springframework.stereotype.Component;

/**
 * Converts between {@link SosRequest} and its DTOs.
 */
@Component
public class SosRequestMapper {

    public SosRequestResponse toResponse(SosRequest sos) {
        Citizen citizen = sos.getCitizen();
        String citizenName = citizen != null
                ? String.format("%s %s", nullToEmpty(citizen.getFirstName()), nullToEmpty(citizen.getLastName())).trim()
                : null;
        return SosRequestResponse.builder()
                .id(sos.getId())
                .uuid(sos.getUuid())
                .citizenId(citizen != null ? citizen.getId() : null)
                .citizenName(citizenName)
                .citizenPhone(citizen != null ? citizen.getPhone() : null)
                .emergencyType(sos.getEmergencyType())
                .description(sos.getDescription())
                .latitude(sos.getLatitude())
                .longitude(sos.getLongitude())
                .status(sos.getStatus())
                .respondedByName(sos.getRespondedByName())
                .respondedByRole(sos.getRespondedByRole())
                .statusNote(sos.getStatusNote())
                .resolvedAt(sos.getResolvedAt())
                .createdAt(sos.getCreatedAt())
                .updatedAt(sos.getUpdatedAt())
                .build();
    }

    public SosRequest toEntity(SosRequestCreateRequest request, Citizen citizen) {
        return SosRequest.builder()
                .citizen(citizen)
                .emergencyType(request.getEmergencyType())
                .description(request.getDescription())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .build();
    }

    private String nullToEmpty(String value) {
        return value == null ? "" : value;
    }
}
