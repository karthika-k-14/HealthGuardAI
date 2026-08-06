package com.healthguard.mapper;

import com.healthguard.dto.EmergencyContactRequest;
import com.healthguard.dto.EmergencyContactResponse;
import com.healthguard.entity.Citizen;
import com.healthguard.entity.EmergencyContact;
import org.springframework.stereotype.Component;

/**
 * Converts between {@link EmergencyContact} and its DTOs. Kept separate
 * from {@link CitizenMapper} so the Emergency Contact Management module
 * stays self-contained.
 */
@Component
public class EmergencyContactMapper {

    public EmergencyContactResponse toResponse(EmergencyContact contact) {
        return EmergencyContactResponse.builder()
                .id(contact.getId())
                .uuid(contact.getUuid())
                .name(contact.getName())
                .relationship(contact.getRelationship())
                .phone(contact.getPhone())
                .alternatePhone(contact.getAlternatePhone())
                .email(contact.getEmail())
                .address(contact.getAddress())
                .isPrimary(contact.getIsPrimary())
                .createdAt(contact.getCreatedAt())
                .build();
    }

    public EmergencyContact toEntity(EmergencyContactRequest request, Citizen citizen) {
        return EmergencyContact.builder()
                .citizen(citizen)
                .name(request.getName())
                .relationship(request.getRelationship())
                .phone(request.getPhone())
                .alternatePhone(request.getAlternatePhone())
                .email(request.getEmail())
                .address(request.getAddress())
                .isPrimary(Boolean.TRUE.equals(request.getIsPrimary()))
                .build();
    }

    public void applyUpdate(EmergencyContact contact, EmergencyContactRequest request) {
        contact.setName(request.getName());
        contact.setRelationship(request.getRelationship());
        contact.setPhone(request.getPhone());
        contact.setAlternatePhone(request.getAlternatePhone());
        contact.setEmail(request.getEmail());
        contact.setAddress(request.getAddress());
        contact.setIsPrimary(Boolean.TRUE.equals(request.getIsPrimary()));
    }
}
