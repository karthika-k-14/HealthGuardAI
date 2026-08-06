package com.healthguard.service;

import com.healthguard.dto.ProfileCompleteRequest;
import com.healthguard.dto.UserSummaryResponse;
import com.healthguard.entity.Citizen;
import com.healthguard.entity.User;
import com.healthguard.mapper.AuthMapper;
import com.healthguard.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Handles the "Complete Profile" step shown once after a user's first
 * successful login, if their profile isn't complete yet. Registration only
 * ever collects identity + credentials; everything else lands here.
 */
@Service
@RequiredArgsConstructor
public class ProfileService {

    private final UserRepository userRepository;
    private final AuthMapper authMapper;

    public UserSummaryResponse getCurrentUser(User user) {
        return authMapper.toUserSummary(user);
    }

    @Transactional
    public UserSummaryResponse completeProfile(User user, ProfileCompleteRequest request) {
        user.setGender(request.getGender());
        user.setDateOfBirth(request.getDateOfBirth());
        user.setBloodGroup(request.getBloodGroup());
        user.setAddress(request.getAddress());
        user.setDistrict(request.getDistrict());
        user.setState(request.getState());
        user.setPincode(request.getPincode());
        user.setPreferredLanguage(request.getPreferredLanguage());
        user.setLatitude(request.getLatitude());
        user.setLongitude(request.getLongitude());
        user.setProfilePhoto(request.getProfilePhoto());

        if (user instanceof Citizen citizen) {
            citizen.setHeight(request.getHeight());
            citizen.setWeight(request.getWeight());
            citizen.setBmi(computeBmi(request.getHeight(), request.getWeight()));
            citizen.setEmergencyContactName(request.getEmergencyContactName());
            citizen.setEmergencyContactPhone(request.getEmergencyContactPhone());
            citizen.setChronicDiseases(request.getChronicDiseases());
            citizen.setAllergies(request.getAllergies());
            citizen.setMedicalHistory(request.getMedicalHistory());
        }

        user.setProfileCompleted(true);
        User saved = userRepository.save(user);
        return authMapper.toUserSummary(saved);
    }

    /** BMI = weight(kg) / height(m)^2. Returns null if either input is missing. */
    private Double computeBmi(Double heightCm, Double weightKg) {
        if (heightCm == null || weightKg == null || heightCm <= 0) {
            return null;
        }
        double heightM = heightCm / 100.0;
        return Math.round((weightKg / (heightM * heightM)) * 100.0) / 100.0;
    }
}
