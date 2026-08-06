package com.healthguard.service;

import com.healthguard.dto.EmergencyContactRequest;
import com.healthguard.dto.EmergencyContactResponse;
import com.healthguard.entity.Citizen;
import com.healthguard.entity.EmergencyContact;
import com.healthguard.exception.ResourceNotFoundException;
import com.healthguard.mapper.EmergencyContactMapper;
import com.healthguard.repository.EmergencyContactRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Business logic for Emergency Contact Management.
 * <p>
 * Every method is scoped to the calling citizen - contacts are always
 * looked up via {@code findByIdAndCitizenId}, so one citizen can never
 * read or modify another citizen's emergency contacts even if they guess
 * an id. Mirrors the family member handling in {@code CitizenService}.
 */
@Service
@RequiredArgsConstructor
public class EmergencyContactService {

    private final EmergencyContactRepository emergencyContactRepository;
    private final EmergencyContactMapper emergencyContactMapper;

    public List<EmergencyContactResponse> listContacts(Citizen citizen) {
        return emergencyContactRepository.findByCitizenIdOrderByIsPrimaryDescCreatedAtAsc(citizen.getId()).stream()
                .map(emergencyContactMapper::toResponse)
                .toList();
    }

    public List<EmergencyContactResponse> searchContacts(Citizen citizen, String keyword) {
        if (keyword == null || keyword.isBlank()) {
            return listContacts(citizen);
        }
        return emergencyContactRepository.search(citizen.getId(), keyword.trim()).stream()
                .map(emergencyContactMapper::toResponse)
                .toList();
    }

    @Transactional
    public EmergencyContactResponse addContact(Citizen citizen, EmergencyContactRequest request) {
        EmergencyContact contact = emergencyContactMapper.toEntity(request, citizen);
        EmergencyContact saved = emergencyContactRepository.save(contact);
        return emergencyContactMapper.toResponse(saved);
    }

    @Transactional
    public EmergencyContactResponse updateContact(Citizen citizen, Long contactId, EmergencyContactRequest request) {
        EmergencyContact contact = findOwnedContact(citizen, contactId);
        emergencyContactMapper.applyUpdate(contact, request);
        EmergencyContact saved = emergencyContactRepository.save(contact);
        return emergencyContactMapper.toResponse(saved);
    }

    @Transactional
    public void deleteContact(Citizen citizen, Long contactId) {
        EmergencyContact contact = findOwnedContact(citizen, contactId);
        emergencyContactRepository.delete(contact);
    }

    private EmergencyContact findOwnedContact(Citizen citizen, Long contactId) {
        return emergencyContactRepository.findByIdAndCitizenId(contactId, citizen.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Emergency contact not found: " + contactId));
    }
}
