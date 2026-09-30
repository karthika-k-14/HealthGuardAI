package com.healthguard.citizen.service.impl;

import com.healthguard.citizen.dto.CitizenRequest;
import com.healthguard.citizen.dto.CitizenResponse;
import com.healthguard.citizen.dto.UpdateCitizenRequest;
import com.healthguard.citizen.entity.Citizen;
import com.healthguard.citizen.exception.DuplicateResourceException;
import com.healthguard.citizen.exception.ResourceNotFoundException;
import com.healthguard.citizen.repository.CitizenRepository;
import com.healthguard.citizen.repository.CitizenHealthProfileRepository;
import com.healthguard.citizen.entity.CitizenHealthProfile;
import com.healthguard.citizen.service.CitizenService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class CitizenServiceImpl implements CitizenService {

    private final CitizenRepository citizenRepository;
    private final CitizenHealthProfileRepository profileRepository;
    private final JdbcTemplate jdbcTemplate;

    @Override
    @Transactional
    public CitizenResponse createCitizen(CitizenRequest request) {
        if (citizenRepository.existsByUserId(request.getUserId())) {
            return getCitizenByUserId(request.getUserId());
        }

        if (citizenRepository.existsByEmail(request.getEmail())) {
            return getCitizenByUserId(request.getUserId());
        }

        Citizen citizen = Citizen.builder()
                .userId(request.getUserId())
                .fullName(request.getFullName())
                .gender(request.getGender())
                .dateOfBirth(request.getDateOfBirth())
                .bloodGroup(request.getBloodGroup())
                .mobileNumber(request.getMobileNumber())
                .email(request.getEmail())
                .address(request.getAddress())
                .district(request.getDistrict())
                .state(request.getState())
                .pincode(request.getPincode())
                .preferredLanguage(request.getPreferredLanguage())
                .emergencyContactName(request.getEmergencyContactName())
                .emergencyContactNumber(request.getEmergencyContactNumber())
                .height(request.getHeight())
                .weight(request.getWeight())
                .allergies(request.getAllergies())
                .chronicDiseases(request.getChronicDiseases())
                .medicalHistory(request.getMedicalHistory())
                .build();

        Citizen savedCitizen = citizenRepository.save(citizen);
        return mapToResponse(savedCitizen);
    }

    @Override
    @Transactional
    public CitizenResponse updateCitizen(Long userId, UpdateCitizenRequest request) {
        Citizen citizen = citizenRepository.findByUserId(userId)
                .or(() -> citizenRepository.findById(userId))
                .or(() -> (request != null && request.getEmail() != null) ? citizenRepository.findByEmail(request.getEmail()) : java.util.Optional.empty())
                .orElseGet(() -> Citizen.builder()
                        .userId(userId)
                        .fullName((request != null && request.getFullName() != null) ? request.getFullName() : "Citizen User")
                        .email((request != null && request.getEmail() != null) ? request.getEmail() : "user_" + userId + "@healthguard.app")
                        .build());

        if (citizen.getUserId() == null) {
            citizen.setUserId(userId);
        }
        if (citizen.getFullName() == null || citizen.getFullName().isBlank()) {
            citizen.setFullName((request != null && request.getFullName() != null) ? request.getFullName() : "Citizen User");
        }
        if (citizen.getEmail() == null || citizen.getEmail().isBlank()) {
            citizen.setEmail((request != null && request.getEmail() != null) ? request.getEmail() : "user_" + userId + "@healthguard.app");
        }


        if (request != null) {
            if (request.getEmail() != null && !request.getEmail().equalsIgnoreCase(citizen.getEmail())) {
                citizen.setEmail(request.getEmail());
            }

            if (request.getFullName() != null) citizen.setFullName(request.getFullName());
            if (request.getGender() != null) citizen.setGender(request.getGender());
            if (request.getDateOfBirth() != null) citizen.setDateOfBirth(request.getDateOfBirth());
            if (request.getBloodGroup() != null) citizen.setBloodGroup(request.getBloodGroup());
            if (request.getMobileNumber() != null) citizen.setMobileNumber(request.getMobileNumber());
            if (request.getAddress() != null) citizen.setAddress(request.getAddress());
            if (request.getDistrict() != null) citizen.setDistrict(request.getDistrict());
            if (request.getState() != null) citizen.setState(request.getState());
            if (request.getPincode() != null) citizen.setPincode(request.getPincode());
            if (request.getPreferredLanguage() != null) citizen.setPreferredLanguage(request.getPreferredLanguage());
            if (request.getEmergencyContactName() != null) citizen.setEmergencyContactName(request.getEmergencyContactName());
            if (request.getEmergencyContactNumber() != null) citizen.setEmergencyContactNumber(request.getEmergencyContactNumber());
            if (request.getHeight() != null) citizen.setHeight(request.getHeight());
            if (request.getWeight() != null) citizen.setWeight(request.getWeight());
            if (request.getAllergies() != null) citizen.setAllergies(request.getAllergies());
            if (request.getChronicDiseases() != null) citizen.setChronicDiseases(request.getChronicDiseases());
            if (request.getMedicalHistory() != null) citizen.setMedicalHistory(request.getMedicalHistory());
        }

        citizen.setProfileCompleted(true);
        Citizen updated = citizenRepository.save(citizen);

        try {
            jdbcTemplate.update("UPDATE users SET profile_completed = TRUE WHERE id = ?", userId);
        } catch (Exception e) {
            log.warn("Could not sync users table profile_completed for userId {}: {}", userId, e.getMessage());
        }

        profileRepository.findByCitizenId(userId)
                .map(existing -> {
                    if (request.getBloodGroup() != null) existing.setBloodGroup(request.getBloodGroup());
                    if (request.getHeight() != null) existing.setHeight(request.getHeight());
                    if (request.getWeight() != null) existing.setWeight(request.getWeight());
                    if (request.getAllergies() != null) existing.setAllergies(request.getAllergies());
                    if (request.getChronicDiseases() != null) existing.setChronicConditions(request.getChronicDiseases());
                    if (request.getEmergencyContactNumber() != null) existing.setEmergencyContact(request.getEmergencyContactNumber());
                    
                    Double h = existing.getHeight();
                    Double w = existing.getWeight();
                    if (h != null && h > 0 && w != null && w > 0) {
                        double heightM = h / 100.0;
                        double bmi = w / (heightM * heightM);
                        existing.setBmi(Math.round(bmi * 10.0) / 10.0);
                    }
                    return profileRepository.save(existing);
                })
                .orElseGet(() -> {
                    CitizenHealthProfile healthProfile = CitizenHealthProfile.builder()
                            .citizenId(userId)
                            .bloodGroup(request.getBloodGroup())
                            .height(request.getHeight())
                            .weight(request.getWeight())
                            .allergies(request.getAllergies())
                            .chronicConditions(request.getChronicDiseases())
                            .emergencyContact(request.getEmergencyContactNumber())
                            .build();
                    Double h = healthProfile.getHeight();
                    Double w = healthProfile.getWeight();
                    if (h != null && h > 0 && w != null && w > 0) {
                        double heightM = h / 100.0;
                        double bmi = w / (heightM * heightM);
                        healthProfile.setBmi(Math.round(bmi * 10.0) / 10.0);
                    }
                    return profileRepository.save(healthProfile);
                });

        return mapToResponse(updated);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CitizenResponse> getAllCitizens() {
        return citizenRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    @Transactional
    public void deleteCitizen(Long userId) {
        citizenRepository.findByUserId(userId).ifPresent(citizenRepository::delete);
    }

    @Override
    @Transactional(readOnly = true)
    public CitizenResponse getCitizenById(Long id) {
        Citizen citizen = citizenRepository.findById(id)
                .or(() -> citizenRepository.findByUserId(id))
                .orElseThrow(() -> new ResourceNotFoundException("Citizen profile not found with ID: " + id));
        return mapToResponse(citizen);
    }

    @Override
    @Transactional(readOnly = true)
    public CitizenResponse getCitizenByUserId(Long userId) {
        Citizen citizen = citizenRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Citizen profile not found for user ID: " + userId));
        return mapToResponse(citizen);
    }

    @Override
    @Transactional(readOnly = true)
    public CitizenResponse getCitizenProfileByUserId(Long userId) {
        return getCitizenByUserId(userId);
    }

    private CitizenResponse mapToResponse(Citizen citizen) {
        boolean isCompleted = Boolean.TRUE.equals(citizen.getProfileCompleted())
                || (citizen.getDateOfBirth() != null && citizen.getHeight() != null && citizen.getWeight() != null && citizen.getAddress() != null);

        return CitizenResponse.builder()
                .id(citizen.getId())
                .userId(citizen.getUserId())
                .fullName(citizen.getFullName())
                .gender(citizen.getGender())
                .dateOfBirth(citizen.getDateOfBirth())
                .bloodGroup(citizen.getBloodGroup())
                .mobileNumber(citizen.getMobileNumber())
                .email(citizen.getEmail())
                .address(citizen.getAddress())
                .district(citizen.getDistrict())
                .state(citizen.getState())
                .pincode(citizen.getPincode())
                .preferredLanguage(citizen.getPreferredLanguage())
                .emergencyContactName(citizen.getEmergencyContactName())
                .emergencyContactNumber(citizen.getEmergencyContactNumber())
                .height(citizen.getHeight())
                .weight(citizen.getWeight())
                .allergies(citizen.getAllergies())
                .chronicDiseases(citizen.getChronicDiseases())
                .medicalHistory(citizen.getMedicalHistory())
                .profileCompleted(isCompleted)
                .createdAt(citizen.getCreatedAt())
                .updatedAt(citizen.getUpdatedAt())
                .build();
    }
}
