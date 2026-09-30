package com.healthguard.citizen.service;

import com.healthguard.citizen.entity.CitizenHealthProfile;
import com.healthguard.citizen.repository.CitizenHealthProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CitizenHealthProfileService {

    private final CitizenHealthProfileRepository profileRepository;

    @Transactional
    public CitizenHealthProfile saveOrUpdateProfile(CitizenHealthProfile profile) {
        if (profile.getHeight() != null && profile.getHeight() > 0 && profile.getWeight() != null && profile.getWeight() > 0) {
            double heightM = profile.getHeight() / 100.0;
            double bmi = profile.getWeight() / (heightM * heightM);
            profile.setBmi(Math.round(bmi * 10.0) / 10.0);
        }

        return profileRepository.findByCitizenId(profile.getCitizenId())
                .map(existing -> {
                    existing.setBloodGroup(profile.getBloodGroup());
                    existing.setHeight(profile.getHeight());
                    existing.setWeight(profile.getWeight());
                    existing.setBmi(profile.getBmi());
                    existing.setAllergies(profile.getAllergies());
                    existing.setChronicConditions(profile.getChronicConditions());
                    existing.setEmergencyContact(profile.getEmergencyContact());
                    existing.setPregnancyStatus(profile.getPregnancyStatus());
                    existing.setDisabilityStatus(profile.getDisabilityStatus());
                    return profileRepository.save(existing);
                })
                .orElseGet(() -> profileRepository.save(profile));
    }

    @Transactional(readOnly = true)
    public CitizenHealthProfile getProfileByCitizenId(Long citizenId) {
        return profileRepository.findByCitizenId(citizenId)
                .orElse(null);
    }
}
