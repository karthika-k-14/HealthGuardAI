package com.healthguard.citizen.controller;

import com.healthguard.citizen.entity.CitizenHealthProfile;
import com.healthguard.citizen.service.CitizenHealthProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/citizens/health-profile")
@RequiredArgsConstructor
public class CitizenHealthProfileController {

    private final CitizenHealthProfileService profileService;

    @PostMapping
    public ResponseEntity<CitizenHealthProfile> createOrUpdateProfile(@RequestBody CitizenHealthProfile profile) {
        return ResponseEntity.ok(profileService.saveOrUpdateProfile(profile));
    }

    @GetMapping("/{citizenId}")
    public ResponseEntity<CitizenHealthProfile> getProfileByCitizenId(@PathVariable("citizenId") Long citizenId) {
        return ResponseEntity.ok(profileService.getProfileByCitizenId(citizenId));
    }

    @PutMapping("/{citizenId}")
    public ResponseEntity<CitizenHealthProfile> updateProfile(@PathVariable("citizenId") Long citizenId, @RequestBody CitizenHealthProfile profile) {
        profile.setCitizenId(citizenId);
        return ResponseEntity.ok(profileService.saveOrUpdateProfile(profile));
    }
}
